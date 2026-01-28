-- ==========================================================
-- VIEWS FOR STUDENTS MANAGEMENT
-- ==========================================================

-- =========================
-- Current status of each student
-- ==========================================================
CREATE OR REPLACE VIEW student_current_status AS
SELECT
    s.id,
    s.first_name,
    s.last_name,
    CASE
        -- Student paid current month
        WHEN MAX(p.year * 12 + p.month) =
             (EXTRACT(YEAR FROM CURRENT_DATE)::INT * 12
              + EXTRACT(MONTH FROM CURRENT_DATE)::INT)
        THEN 'active'
        -- Student inactive (3+ months without payment)
        WHEN (
            (EXTRACT(YEAR FROM CURRENT_DATE)::INT * 12
             + EXTRACT(MONTH FROM CURRENT_DATE)::INT)
            -
            COALESCE(MAX(p.year * 12 + p.month),
                     (EXTRACT(YEAR FROM s.enrollment_date)::INT * 12
                      + EXTRACT(MONTH FROM s.enrollment_date)::INT))
        ) >= 3
        -- Pending (1–2 months without payment)
        ELSE 'pending'
    END AS student_status
FROM students s
LEFT JOIN payments p ON p.student_id = s.id
GROUP BY s.id;

-- =========================
-- Last payment date for each student
-- ==========================================================
CREATE OR REPLACE VIEW student_last_payment AS
SELECT
    s.id AS student_id,
    s.first_name,
    s.last_name,
    MAX(p.payment_date) AS last_payment_date
FROM students s
LEFT JOIN payments p ON p.student_id = s.id
GROUP BY s.id;

-- =========================
-- List of inactive students (3+ months without payment)
-- ==========================================================
CREATE OR REPLACE VIEW inactive_students AS
SELECT *
FROM student_current_status
WHERE student_status = 'inactive';

-- =========================
-- Students with plan info for the current month
-- ==========================================================
CREATE OR REPLACE VIEW students_with_plan AS
SELECT
    s.id AS student_id,
    s.first_name,
    s.last_name,
    pl.name AS plan_name,
    pl.price
FROM students s
LEFT JOIN payments p
    ON p.student_id = s.id
LEFT JOIN plans pl
    ON pl.id = p.plan_id
    AND p.year = EXTRACT(YEAR FROM CURRENT_DATE)::INT
    AND p.month = EXTRACT(MONTH FROM CURRENT_DATE)::INT;
