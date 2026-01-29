-- ==========================================================
-- OPTIMIZED DATABASE DESIGN - STATE-DRIVEN ARCHITECTURE
-- ==========================================================
-- This script creates an optimized database with state management
-- directly in tables to avoid complex calculations
-- ==========================================================

-- ==========================================================
-- STEP 1: CREATE DATABASE
-- ==========================================================

-- Drop existing database if it exists
DROP DATABASE IF EXISTS academy_db;

-- Create new database
CREATE DATABASE academy_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the new database
\c academy_db;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================
-- STEP 2: CREATE TABLES WITH OPTIMIZED STRUCTURE
-- ==========================================================

-- Plans table
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    type VARCHAR(20) NOT NULL DEFAULT 'adult' CHECK (type IN ('adult', 'kids')),
    duration_months INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table with state management
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    type VARCHAR(20) NOT NULL DEFAULT 'adult' CHECK (type IN ('adult', 'kids')),
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- STATE MANAGEMENT (previously calculated)
    state VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (state IN ('active', 'pending', 'inactive', 'trial')),
    current_plan_id INTEGER REFERENCES plans(id),
    current_plan_name VARCHAR(100) DEFAULT 'No plan',
    current_price DECIMAL(10,2) DEFAULT 0,
    last_payment_date DATE,
    next_payment_date DATE,
    days_overdue INTEGER DEFAULT 0,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Subscriptions table (NEW - Better Payment Tracking)
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES plans(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    monthly_amount DECIMAL(10,2) NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monthly payments table (NEW - Simplified Monthly Tracking)
CREATE TABLE monthly_payments (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'failed')),
    payment_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(subscription_id, month, year)
);

-- Payments table (simplified)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer', 'online')),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ==========================================================

-- Students table indexes
CREATE INDEX idx_students_id ON students(id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_state ON students(state);
CREATE INDEX idx_students_type ON students(type);
CREATE INDEX idx_students_current_plan ON students(current_plan_id);
CREATE INDEX idx_students_next_payment ON students(next_payment_date);
CREATE INDEX idx_students_name ON students(first_name, last_name);
CREATE INDEX idx_students_deleted_at ON students(deleted_at);

-- Plans table indexes
CREATE INDEX idx_plans_id ON plans(id);
CREATE INDEX idx_plans_type ON plans(type);
CREATE INDEX idx_plans_active ON plans(is_active);

-- Subscriptions table indexes
CREATE INDEX idx_subscriptions_id ON subscriptions(id);
CREATE INDEX idx_subscriptions_student ON subscriptions(student_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_dates ON subscriptions(start_date, end_date);

-- Monthly payments table indexes
CREATE INDEX idx_monthly_payments_id ON monthly_payments(id);
CREATE INDEX idx_monthly_payments_subscription ON monthly_payments(subscription_id);
CREATE INDEX idx_monthly_payments_status ON monthly_payments(status);
CREATE INDEX idx_monthly_payments_due ON monthly_payments(due_date);
CREATE INDEX idx_monthly_payments_month_year ON monthly_payments(month, year);

-- Payments table indexes
CREATE INDEX idx_payments_id ON payments(id);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- ==========================================================
-- STEP 4: CREATE TRIGGERS FOR UPDATED_AT
-- ==========================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at 
    BEFORE UPDATE ON plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_payments_updated_at 
    BEFORE UPDATE ON monthly_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================
-- STEP 5: CREATE FUNCTIONS FOR STATE MANAGEMENT
-- ==========================================================

-- Function to calculate student state based on payments
CREATE OR REPLACE FUNCTION calculate_student_state(student_id_param INTEGER)
RETURNS TEXT AS $$
DECLARE
    overdue_days INTEGER;
    has_active_subscription BOOLEAN;
    current_month_paid BOOLEAN;
BEGIN
    -- Check if student has active subscription
    SELECT EXISTS(
        SELECT 1 FROM subscriptions s
        WHERE s.student_id = student_id_param 
        AND s.status = 'active'
        AND s.end_date >= CURRENT_DATE
    ) INTO has_active_subscription;
    
    -- Check if current month is paid
    SELECT EXISTS(
        SELECT 1 FROM monthly_payments mp
        JOIN subscriptions s ON mp.subscription_id = s.id
        WHERE s.student_id = student_id_param
        AND mp.month = EXTRACT(MONTH FROM CURRENT_DATE)::integer
        AND mp.year = EXTRACT(YEAR FROM CURRENT_DATE)::integer
        AND mp.status = 'paid'
    ) INTO current_month_paid;
    
    -- Calculate overdue days
    SELECT COALESCE(
        EXTRACT(DAY FROM AGE(CURRENT_DATE, MIN(mp.due_date)))::integer, 0
    ) INTO overdue_days
    FROM monthly_payments mp
    JOIN subscriptions s ON mp.subscription_id = s.id
    WHERE s.student_id = student_id_param
    AND mp.status IN ('pending', 'overdue')
    AND mp.due_date < CURRENT_DATE;
    
    -- Determine state
    IF NOT has_active_subscription THEN
        RETURN 'inactive';
    ELSIF current_month_paid THEN
        RETURN 'active';
    ELSIF overdue_days >= 90 THEN
        RETURN 'inactive';
    ELSIF overdue_days > 0 THEN
        RETURN 'pending';
    ELSE
        RETURN 'trial';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update student state and related fields
CREATE OR REPLACE FUNCTION update_student_state(student_id_param INTEGER)
RETURNS VOID AS $$
DECLARE
    student_state TEXT;
    plan_info RECORD;
    overdue_days INTEGER;
BEGIN
    -- Calculate new state
    student_state := calculate_student_state(student_id_param);
    
    -- Get current plan info
    SELECT 
        p.id as plan_id,
        p.name as plan_name,
        p.price as price
    INTO plan_info
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.student_id = student_id_param
    AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- Calculate overdue days
    SELECT COALESCE(
        EXTRACT(DAY FROM AGE(CURRENT_DATE, MIN(mp.due_date)))::integer, 0
    ) INTO overdue_days
    FROM monthly_payments mp
    JOIN subscriptions s ON mp.subscription_id = s.id
    WHERE s.student_id = student_id_param
    AND mp.status IN ('pending', 'overdue')
    AND mp.due_date < CURRENT_DATE;
    
    -- Update student record
    UPDATE students SET
        state = student_state,
        current_plan_id = COALESCE(plan_info.plan_id, current_plan_id),
        current_plan_name = COALESCE(plan_info.plan_name, 'No plan'),
        current_price = COALESCE(plan_info.price, 0),
        days_overdue = overdue_days,
        next_payment_date = (
            SELECT DATE_TRUNC('month', mp.due_date) + INTERVAL '1 month'
            FROM monthly_payments mp
            JOIN subscriptions s ON mp.subscription_id = s.id
            WHERE s.student_id = student_id_param
            AND mp.status = 'pending'
            ORDER BY mp.due_date ASC
            LIMIT 1
        )
    WHERE id = student_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending payments count
CREATE OR REPLACE FUNCTION get_pending_payments_count()
RETURNS INTEGER AS $$
DECLARE
    pending_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO pending_count
    FROM students 
    WHERE state = 'pending' AND deleted_at IS NULL;
    
    RETURN pending_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get top pending students
CREATE OR REPLACE FUNCTION get_top_pending_students(limit_count INTEGER DEFAULT 3)
RETURNS TABLE (
    student_id INTEGER,
    student_name TEXT,
    email TEXT,
    days_late INTEGER,
    amount DECIMAL,
    current_state TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.first_name || ' ' || s.last_name as student_name,
        s.email,
        s.days_overdue as days_late,
        s.current_price as amount,
        s.state as current_state
    FROM students s
    WHERE s.state = 'pending' AND s.deleted_at IS NULL
    ORDER BY s.days_overdue DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================
-- STEP 6: CREATE TRIGGERS FOR AUTOMATIC STATE UPDATES
-- ==========================================================

-- Trigger to update student state when payment is made
CREATE OR REPLACE FUNCTION update_student_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' THEN
        -- Update student state
        PERFORM update_student_state(NEW.student_id);
        
        -- Update monthly payment record
        UPDATE monthly_payments 
        SET 
            status = 'paid',
            paid_date = NEW.payment_date,
            payment_id = NEW.id
        WHERE subscription_id = NEW.subscription_id
        AND month = EXTRACT(MONTH FROM NEW.payment_date)::integer
        AND year = EXTRACT(YEAR FROM NEW.payment_date)::integer;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment updates
DROP TRIGGER IF EXISTS trigger_update_student_on_payment ON payments;
CREATE TRIGGER trigger_update_student_on_payment
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW 
WHEN (NEW.status = 'paid')
EXECUTE FUNCTION update_student_on_payment();

-- ==========================================================
-- STEP 7: INSERT SAMPLE DATA
-- ==========================================================

-- Insert sample plans
INSERT INTO plans (name, description, price, type) VALUES
('Basic Plan', 'Access to basic facilities', 45.00, 'adult'),
('Premium Plan', 'Full access to all facilities', 60.00, 'adult'),
('Kids Basic', 'Basic training for kids', 35.00, 'kids'),
('Kids Advanced', 'Advanced training for kids', 50.00, 'kids');

-- Insert sample students
INSERT INTO students (first_name, last_name, email, phone, type, enrollment_date, state) VALUES
('John', 'Doe', 'john.doe@email.com', '555-0101', 'adult', '2024-01-15', 'active'),
('Jane', 'Smith', 'jane.smith@email.com', '555-0102', 'adult', '2024-02-01', 'pending'),
('Mike', 'Johnson', 'mike.johnson@email.com', '555-0103', 'adult', '2023-12-01', 'inactive'),
('Sarah', 'Williams', 'sarah.williams@email.com', '555-0104', 'kids', '2024-01-20', 'active'),
('Tom', 'Brown', 'tom.brown@email.com', '555-0105', 'kids', '2024-02-10', 'pending');

-- Create subscriptions for students
INSERT INTO subscriptions (student_id, plan_id, start_date, end_date, monthly_amount) VALUES
(1, 2, '2024-01-15', '2024-12-31', 60.00),
(2, 1, '2024-02-01', '2024-12-31', 45.00),
(3, 2, '2023-12-01', '2024-11-30', 60.00),
(4, 4, '2024-01-20', '2024-12-31', 50.00),
(5, 3, '2024-02-10', '2024-12-31', 35.00);

-- Create monthly payments for current year
INSERT INTO monthly_payments (subscription_id, month, year, amount, due_date, status) VALUES
-- John Doe (active)
(1, 1, 2024, 60.00, '2024-01-15', 'paid'),
(1, 2, 2024, 60.00, '2024-02-15', 'paid'),
(1, 3, 2024, 60.00, '2024-03-15', 'paid'),

-- Jane Smith (pending)
(2, 1, 2024, 45.00, '2024-02-01', 'overdue'),
(2, 2, 2024, 45.00, '2024-03-01', 'pending'),

-- Mike Johnson (inactive)
(3, 1, 2024, 60.00, '2023-12-01', 'overdue'),
(3, 2, 2024, 60.00, '2024-01-01', 'overdue'),
(3, 3, 2024, 60.00, '2024-02-01', 'overdue'),

-- Sarah Williams (active)
(4, 1, 2024, 50.00, '2024-01-20', 'paid'),
(4, 2, 2024, 50.00, '2024-02-20', 'paid'),

-- Tom Brown (pending)
(5, 1, 2024, 35.00, '2024-02-10', 'overdue'),
(5, 2, 2024, 35.00, '2024-03-10', 'pending');

-- Create payment records for paid monthly payments
INSERT INTO payments (student_id, subscription_id, amount, payment_date, status, payment_method) VALUES
(1, 1, 60.00, '2024-01-15', 'paid', 'card'),
(1, 1, 60.00, '2024-02-15', 'paid', 'card'),
(1, 1, 60.00, '2024-03-15', 'paid', 'card'),
(4, 4, 50.00, '2024-01-20', 'paid', 'cash'),
(4, 4, 50.00, '2024-02-20', 'paid', 'cash');

-- ==========================================================
-- STEP 8: UPDATE STUDENT STATES
-- ==========================================================

-- Update all student states based on their payment history
SELECT update_student_state(1);  -- John Doe → active
SELECT update_student_state(2);  -- Jane Smith → pending
SELECT update_student_state(3);  -- Mike Johnson → inactive
SELECT update_student_state(4);  -- Sarah Williams → active
SELECT update_student_state(5);  -- Tom Brown → pending

-- ==========================================================
-- STEP 9: VERIFICATION
-- ==========================================================

SELECT '=== OPTIMIZED DATABASE CREATED ===' as status;

-- Show table information
SELECT '=== TABLES CREATED ===' as info;
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Show optimized student data
SELECT '=== OPTIMIZED STUDENT DATA ===' as info;
SELECT 
    id,
    first_name,
    last_name,
    email,
    type,
    state,
    current_plan_name,
    current_price,
    days_overdue,
    next_payment_date
FROM students 
ORDER BY id;

-- Show subscription data
SELECT '=== SUBSCRIPTION DATA ===' as info;
SELECT 
    s.id,
    st.first_name || ' ' || st.last_name as student_name,
    p.name as plan_name,
    s.start_date,
    s.end_date,
    s.status,
    s.monthly_amount
FROM subscriptions s
JOIN students st ON s.student_id = st.id
JOIN plans p ON s.plan_id = p.id
ORDER BY s.id;

-- Show monthly payments
SELECT '=== MONTHLY PAYMENTS ===' as info;
SELECT 
    mp.id,
    st.first_name || ' ' || st.last_name as student_name,
    p.name as plan_name,
    mp.month,
    mp.year,
    mp.amount,
    mp.due_date,
    mp.paid_date,
    mp.status
FROM monthly_payments mp
JOIN subscriptions s ON mp.subscription_id = s.id
JOIN students st ON s.student_id = st.id
JOIN plans p ON s.plan_id = p.id
ORDER BY mp.year, mp.month, st.last_name;

-- Test optimized functions
SELECT '=== FUNCTION TESTS ===' as info;
SELECT 'Pending Payments Count:' as metric, get_pending_payments_count() as value;

SELECT 'Top 3 Pending Students:' as info;
SELECT * FROM get_top_pending_students(3);

-- Show final statistics
SELECT '=== FINAL STATISTICS ===' as info;
SELECT 
    'Total Students' as metric,
    COUNT(*) as value
FROM students
WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'Active Students' as metric,
    COUNT(*) as value
FROM students WHERE state = 'active' AND deleted_at IS NULL
UNION ALL
SELECT 
    'Pending Students' as metric,
    COUNT(*) as value
FROM students WHERE state = 'pending' AND deleted_at IS NULL
UNION ALL
SELECT 
    'Inactive Students' as metric,
    COUNT(*) as value
FROM students WHERE state = 'inactive' AND deleted_at IS NULL
UNION ALL
SELECT 
    'Trial Students' as metric,
    COUNT(*) as value
FROM students WHERE state = 'trial' AND deleted_at IS NULL
UNION ALL
SELECT 
    'Active Subscriptions' as metric,
    COUNT(*) as value
FROM subscriptions WHERE status = 'active'
UNION ALL
SELECT 
    'Paid Monthly Payments' as metric,
    COUNT(*) as value
FROM monthly_payments WHERE status = 'paid'
UNION ALL
SELECT 
    'Overdue Monthly Payments' as metric,
    COUNT(*) as value
FROM monthly_payments WHERE status = 'overdue';

SELECT '=== OPTIMIZED DATABASE READY ===' as final_status;
SELECT 'Database with state-driven architecture is ready for production!' as message;
SELECT 'All queries are now optimized for maximum performance!' as performance;
