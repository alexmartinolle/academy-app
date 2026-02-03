-- =====================================================
-- 8. Critical Indexes
-- =====================================================
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_student_plan_active ON student_plan(id_student, active);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_student ON payments(id_student);
CREATE INDEX idx_payments_student_date ON payments(id_student, payment_date DESC);
CREATE INDEX idx_plans_type ON plans(type);

-- ADDED: one active plan per student (partial unique index)
CREATE UNIQUE INDEX uq_student_plan_unique_active
ON student_plan (id_student)
WHERE active = true;

-- =====================================================
-- 9. Additional useful indexes for reporting
-- =====================================================
CREATE INDEX idx_students_type ON students(type);
CREATE INDEX idx_students_enrollment_date ON students(enrollment_date);
CREATE INDEX idx_payments_period ON payments(period_start, period_end);
CREATE INDEX idx_plans_active ON plans(active);
CREATE INDEX idx_modalities_active ON modalities(active);
