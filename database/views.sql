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
        -- Student paid current month OR future months
        WHEN COALESCE(MAX(p.year * 12 + p.month), 0) >=
             (EXTRACT(YEAR FROM CURRENT_DATE)::INT * 12
              + EXTRACT(MONTH FROM CURRENT_DATE)::INT)
        THEN 'active'
        -- Student inactive (3+ months without payment)
        WHEN (
            (EXTRACT(YEAR FROM CURRENT_DATE)::INT * 12
             + EXTRACT(MONTH FROM CURRENT_DATE)::INT)
            -
            COALESCE(MAX(p.year * 12 + p.month), 0)
        ) >= 3
        THEN 'inactive'
        -- Pending (1–2 months without payment)
        ELSE 'pending'
    END AS student_status
FROM students s
LEFT JOIN payments p ON p.student_id = s.id AND p.status = 'paid'
GROUP BY s.id, s.first_name, s.last_name;

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

-- =========================
-- Students with pending payments (NEW)
-- ==========================================================
CREATE OR REPLACE VIEW students_pending_payments AS
SELECT
    s.id,
    s.first_name,
    s.last_name,
    s.email,
    s.enrollment_date,
    scs.student_status,
    COALESCE(pl.name, 'No plan') as plan_name,
    COALESCE(pl.price, 0) as price,
    CASE 
        WHEN MAX(p.payment_date) IS NULL THEN 
            EXTRACT(DAY FROM AGE(CURRENT_DATE, s.enrollment_date))
        ELSE 
            EXTRACT(DAY FROM AGE(CURRENT_DATE, (DATE_TRUNC('month', MAX(p.payment_date)) + INTERVAL '1 month')))
    END as days_late
FROM students s
LEFT JOIN student_current_status scs ON s.id = scs.id
LEFT JOIN payments p ON p.student_id = s.id AND p.status = 'paid'
LEFT JOIN plans pl ON pl.id = (
    SELECT p.plan_id 
    FROM payments p 
    WHERE p.student_id = s.id 
    ORDER BY p.year DESC, p.month DESC 
    LIMIT 1
)
WHERE scs.student_status = 'pending'
GROUP BY s.id, scs.student_status, pl.name, pl.price
ORDER BY days_late DESC;

-- =========================
-- Complete student info with status and plan (NEW)
-- ==========================================================
CREATE OR REPLACE VIEW students_complete_info AS
SELECT
    s.*,
    scs.student_status,
    COALESCE(pl.name, 'No plan') as plan_name,
    COALESCE(pl.price, 0) as price,
    MAX(p.payment_date) as last_payment_date
FROM students s
LEFT JOIN student_current_status scs ON s.id = scs.id
LEFT JOIN payments p ON p.student_id = s.id
LEFT JOIN plans pl ON pl.id = (
    SELECT p.plan_id 
    FROM payments p 
    WHERE p.student_id = s.id 
    ORDER BY p.year DESC, p.month DESC 
    LIMIT 1
)
GROUP BY s.id, scs.student_status, pl.name, pl.price
ORDER BY s.first_name, s.last_name;