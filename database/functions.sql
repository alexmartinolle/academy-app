-- ==========================================================
-- FUNCTIONS AND TRIGGERS FOR AUTOMATIC STATUS UPDATES
-- ==========================================================

-- =========================
-- Function to update student status when payment is made
-- =========================
CREATE OR REPLACE FUNCTION update_student_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- When a payment is made as 'paid', update student status to 'active'
    IF NEW.status = 'paid' THEN
        UPDATE students 
        SET student_status = 'active' 
        WHERE id = NEW.student_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Trigger for automatic status updates
-- =========================
DROP TRIGGER IF EXISTS trigger_update_student_status ON payments;
CREATE TRIGGER trigger_update_student_status
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW 
WHEN (NEW.status = 'paid')
EXECUTE FUNCTION update_student_payment_status();

-- =========================
-- Function to refresh all student statuses
-- =========================
CREATE OR REPLACE FUNCTION refresh_student_statuses()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
BEGIN
    -- Mark as pending students who haven't paid current month
    UPDATE students 
    SET student_status = 'pending'
    WHERE student_status = 'active'
      AND enrollment_date <= CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM payments p 
        WHERE p.student_id = students.id 
          AND p.month = EXTRACT(MONTH FROM CURRENT_DATE)::integer
          AND p.year = EXTRACT(YEAR FROM CURRENT_DATE)::integer
          AND p.status = 'paid'
      );
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Mark as active students who have paid current month
    UPDATE students 
    SET student_status = 'active'
    WHERE student_status = 'pending'
      AND EXISTS (
        SELECT 1 FROM payments p 
        WHERE p.student_id = students.id 
          AND p.month = EXTRACT(MONTH FROM CURRENT_DATE)::integer
          AND p.year = EXTRACT(YEAR FROM CURRENT_DATE)::integer
          AND p.status = 'paid'
      );
    
    GET DIAGNOSTICS updated_count = updated_count + ROW_COUNT;
    
    -- Mark as inactive students who are 3+ months behind
    UPDATE students 
    SET student_status = 'inactive'
    WHERE student_status = 'pending'
      AND (
        (EXTRACT(YEAR FROM CURRENT_DATE)::integer * 12 + EXTRACT(MONTH FROM CURRENT_DATE)::integer) -
        COALESCE((
            SELECT MAX(p.year * 12 + p.month) 
            FROM payments p 
            WHERE p.student_id = students.id AND p.status = 'paid'
        ), 0) >= 3
      );
    
    GET DIAGNOSTICS updated_count = updated_count + ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Function to get pending payments count
-- =========================
CREATE OR REPLACE FUNCTION get_pending_payments_count()
RETURNS INTEGER AS $$
DECLARE
    pending_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO pending_count
    FROM students_pending_payments;
    
    RETURN pending_count;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Function to get top N pending students
-- =========================
CREATE OR REPLACE FUNCTION get_top_pending_students(limit_count INTEGER DEFAULT 3)
RETURNS TABLE (
    student_id INTEGER,
    student_name TEXT,
    email TEXT,
    days_late INTEGER,
    amount DECIMAL,
    current_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        spp.id,
        spp.first_name || ' ' || spp.last_name as student_name,
        spp.email,
        spp.days_late,
        spp.price as amount,
        spp.student_status as current_status
    FROM students_pending_payments spp
    ORDER BY spp.days_late DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
