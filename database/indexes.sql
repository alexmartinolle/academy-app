-- ==========================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==========================================================

-- =========================
-- Students table indexes
-- =========================
CREATE INDEX IF NOT EXISTS idx_students_id ON students(id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(student_status);
CREATE INDEX IF NOT EXISTS idx_students_type ON students(type);
CREATE INDEX IF NOT EXISTS idx_students_enrollment ON students(enrollment_date);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(first_name, last_name);

-- =========================
-- Payments table indexes
-- =========================
CREATE INDEX IF NOT EXISTS idx_payments_id ON payments(id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_month_year ON payments(month, year);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_plan ON payments(plan_id);

-- =========================
-- Critical composite indexes
-- =========================
-- For pending payments queries
CREATE INDEX IF NOT EXISTS idx_payments_student_status_month_year 
ON payments(student_id, status, month, year);

-- For student status calculations
CREATE INDEX IF NOT EXISTS idx_payments_student_year_month_status 
ON payments(student_id, year DESC, month DESC, status);

-- For plan lookups
CREATE INDEX IF NOT EXISTS idx_payments_student_plan_desc 
ON payments(student_id, plan_id) WHERE status = 'paid';

-- =========================
-- Plans table indexes
-- =========================
CREATE INDEX IF NOT EXISTS idx_plans_id ON plans(id);
CREATE INDEX IF NOT EXISTS idx_plans_type ON plans(type);
CREATE INDEX IF NOT EXISTS idx_plans_price ON plans(price);
CREATE INDEX IF NOT EXISTS idx_plans_name ON plans(name);

-- =========================
-- Performance analysis queries
-- =========================
-- Check index usage (run this after implementing)
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     idx_scan,
--     idx_tup_read,
--     idx_tup_fetch
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- Analyze table statistics (run after creating indexes)
-- ANALYZE students;
-- ANALYZE payments;
-- ANALYZE plans;
