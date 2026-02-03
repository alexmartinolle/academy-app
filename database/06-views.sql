-- =====================================================
-- OPTIMIZED VIEWS - Academy Management System
-- =====================================================

-- =====================================================
-- STUDENTS VIEWS
-- =====================================================

-- Vista 1: Lista completa de estudiantes (OPTIMIZED)
CREATE VIEW v_students_list AS
SELECT 
    s.id_student,
    s.first_name,
    s.last_name,
    s.email,
    s.type,
    s.status,
    s.enrollment_date,
    s.cancellation_date,
    -- Plan actual
    p.name as current_plan_name,
    p.monthly_price as current_plan_price,
    p.frequency as current_plan_frequency,
    -- Último pago (optimizado con window function)
    last_payment.payment_date as last_payment_date,
    last_payment.period_end as last_payment_period_end,
    -- Indicador de si debe pagar
    CASE 
        WHEN last_payment.period_end IS NULL THEN true
        WHEN last_payment.period_end < CURRENT_DATE THEN true
        ELSE false
    END as payment_required,
    -- Días desde último pago
    CASE 
        WHEN last_payment.payment_date IS NOT NULL 
        THEN CURRENT_DATE - last_payment.payment_date
        ELSE NULL
    END as days_since_last_payment,
    -- Total pagado históricamente
    COALESCE(total_payments.total_paid, 0) as total_paid_ever,
    -- Número de pagos realizados
    COALESCE(total_payments.payment_count, 0) as total_payments_count
FROM students s
LEFT JOIN student_plan sp ON s.id_student = sp.id_student AND sp.active = true
LEFT JOIN plans p ON sp.id_plan = p.id_plan
LEFT JOIN LATERAL (
    SELECT payment_date, period_end
    FROM payments 
    WHERE id_student = s.id_student
    ORDER BY payment_date DESC
    LIMIT 1
) last_payment ON true
LEFT JOIN LATERAL (
    SELECT 
        SUM(total_amount) as total_paid,
        COUNT(*) as payment_count
    FROM payments 
    WHERE id_student = s.id_student
) total_payments ON true;

COMMENT ON VIEW v_students_list IS 'Lista completa de estudiantes con información resumida para tabla principal';


-- Vista 2: Detalle completo de un estudiante (FIXED & OPTIMIZED)
CREATE VIEW v_student_detail AS
WITH payment_stats AS (
    SELECT 
        id_student,
        SUM(total_amount) as total_paid,
        COUNT(*) as payment_count,
        MIN(payment_date) as first_payment_date,
        MAX(payment_date) as last_payment_date,
        MAX(total_amount) FILTER (WHERE payment_date = max_payment_date) as last_payment_amount,
        MAX(payment_method::text) FILTER (WHERE payment_date = max_payment_date) as last_payment_method,
        MAX(period_end) FILTER (WHERE payment_date = max_payment_date) as last_payment_period_end
    FROM (
        SELECT 
            *,
            MAX(payment_date) OVER (PARTITION BY id_student) as max_payment_date
        FROM payments
    ) p
    GROUP BY id_student
)
SELECT 
    s.id_student,
    s.first_name,
    s.last_name,
    s.email,
    s.type,
    s.status,
    s.enrollment_date,
    s.cancellation_date,
    s.created_at,
    s.updated_at,
    -- Plan actual completo
    sp.id_student_plan,
    sp.start_date as current_plan_start,
    sp.end_date as current_plan_end,
    p.id_plan as current_plan_id,
    p.name as current_plan_name,
    p.frequency as current_plan_frequency,
    p.monthly_price as current_plan_price,
    -- Modalidades del plan actual
    array_agg(DISTINCT m.name ORDER BY m.name) FILTER (WHERE m.name IS NOT NULL) as current_plan_modalities,
    -- Estadísticas de pagos
    COALESCE(ps.total_paid, 0) as total_paid,
    COALESCE(ps.payment_count, 0) as payment_count,
    ps.first_payment_date,
    ps.last_payment_date,
    ps.last_payment_amount,
    ps.last_payment_method,
    -- Estadísticas de tiempo
    CURRENT_DATE - s.enrollment_date as days_enrolled,
    CASE 
        WHEN s.cancellation_date IS NOT NULL 
        THEN s.cancellation_date - s.enrollment_date
        ELSE CURRENT_DATE - s.enrollment_date
    END as days_as_member,
    -- Indicadores
    CASE 
        WHEN ps.last_payment_period_end IS NULL THEN true
        WHEN ps.last_payment_period_end < CURRENT_DATE THEN true
        ELSE false
    END as needs_payment,
    CASE 
        WHEN ps.last_payment_period_end >= CURRENT_DATE 
        THEN ps.last_payment_period_end - CURRENT_DATE
        ELSE NULL
    END as days_until_next_payment
FROM students s
LEFT JOIN student_plan sp ON s.id_student = sp.id_student AND sp.active = true
LEFT JOIN plans p ON sp.id_plan = p.id_plan
LEFT JOIN plan_modality pm ON p.id_plan = pm.id_plan
LEFT JOIN modalities m ON pm.id_modality = m.id_modality
LEFT JOIN payment_stats ps ON s.id_student = ps.id_student
GROUP BY 
    s.id_student, sp.id_student_plan, p.id_plan,
    ps.total_paid, ps.payment_count,
    ps.first_payment_date, ps.last_payment_date,
    ps.last_payment_amount, ps.last_payment_method,
    ps.last_payment_period_end;

COMMENT ON VIEW v_student_detail IS 'Información completa de un estudiante individual para página de detalle';


-- Vista 3: Historial de planes de un estudiante (OPTIMIZED)
CREATE VIEW v_student_plan_history AS
SELECT 
    sp.id_student,
    sp.id_student_plan,
    sp.start_date,
    sp.end_date,
    sp.active,
    p.name as plan_name,
    p.type as plan_type,
    p.frequency as plan_frequency,
    p.monthly_price,
    array_agg(m.name ORDER BY m.name) as modalities,
    -- Duración del plan
    CASE 
        WHEN sp.end_date IS NOT NULL 
        THEN sp.end_date - sp.start_date
        ELSE CURRENT_DATE - sp.start_date
    END as plan_duration_days,
    -- Pagos realizados en este plan
    COALESCE(plan_payments.payment_count, 0) as payments_in_plan,
    COALESCE(plan_payments.total_paid_in_plan, 0) as total_paid_in_plan
FROM student_plan sp
JOIN plans p ON sp.id_plan = p.id_plan
LEFT JOIN plan_modality pm ON p.id_plan = pm.id_plan
LEFT JOIN modalities m ON pm.id_modality = m.id_modality
LEFT JOIN LATERAL (
    SELECT 
        COUNT(*) as payment_count,
        SUM(total_amount) as total_paid_in_plan
    FROM payments pay
    WHERE pay.id_student = sp.id_student
    AND pay.id_plan = sp.id_plan
    AND pay.payment_date BETWEEN sp.start_date AND COALESCE(sp.end_date, CURRENT_DATE)
) plan_payments ON true
GROUP BY sp.id_student_plan, p.id_plan, plan_payments.payment_count, plan_payments.total_paid_in_plan
ORDER BY sp.start_date DESC;

COMMENT ON VIEW v_student_plan_history IS 'Historial completo de planes por estudiante';


-- Vista 4: Estudiantes con pagos vencidos (OPTIMIZED)
CREATE VIEW v_students_overdue AS
SELECT 
    s.id_student,
    s.first_name,
    s.last_name,
    s.email,
    s.type,
    s.status,
    p.name as plan_name,
    p.monthly_price,
    last_payment.payment_date as last_payment_date,
    last_payment.period_end as coverage_until,
    CURRENT_DATE - last_payment.period_end as days_overdue,
    -- Monto estimado adeudado (simplificado)
    p.monthly_price as estimated_debt
FROM students s
JOIN student_plan sp ON s.id_student = sp.id_student AND sp.active = true
JOIN plans p ON sp.id_plan = p.id_plan
LEFT JOIN LATERAL (
    SELECT payment_date, period_end
    FROM payments 
    WHERE id_student = s.id_student
    ORDER BY payment_date DESC
    LIMIT 1
) last_payment ON true
WHERE s.status != 'inactive'
AND (
    last_payment.period_end IS NULL 
    OR last_payment.period_end < CURRENT_DATE
)
ORDER BY days_overdue DESC NULLS FIRST;

COMMENT ON VIEW v_students_overdue IS 'Estudiantes con pagos pendientes o vencidos';


-- =====================================================
-- PAYMENTS VIEWS (OPTIMIZED)
-- =====================================================

-- Vista 5: Historial de pagos de un estudiante
CREATE VIEW v_student_payments_history AS
SELECT 
    p.id_payment,
    p.id_student,
    s.first_name,
    s.last_name,
    p.payment_date,
    p.period_start,
    p.period_end,
    p.total_amount,
    p.payment_method,
    p.observations,
    pl.name as plan_name,
    pl.frequency as plan_frequency,
    -- Días de cobertura
    p.period_end - p.period_start + 1 as coverage_days,
    -- Precio diario
    p.total_amount / NULLIF(p.period_end - p.period_start + 1, 0) as daily_rate
FROM payments p
JOIN students s ON p.id_student = s.id_student
JOIN plans pl ON p.id_plan = pl.id_plan
ORDER BY p.payment_date DESC;

COMMENT ON VIEW v_student_payments_history IS 'Historial detallado de todos los pagos por estudiante';


-- Vista 6: Resumen de pagos por método de pago
CREATE VIEW v_payments_by_method AS
SELECT 
    payment_method,
    COUNT(*) as total_transactions,
    SUM(total_amount) as total_amount,
    AVG(total_amount) as avg_amount,
    MIN(total_amount) as min_amount,
    MAX(total_amount) as max_amount,
    MIN(payment_date) as first_payment,
    MAX(payment_date) as last_payment
FROM payments
GROUP BY payment_method;

COMMENT ON VIEW v_payments_by_method IS 'Estadísticas de pagos agrupados por método de pago';


-- Vista 7: Ingresos diarios (OPTIMIZED)
CREATE VIEW v_daily_revenue AS
SELECT 
    payment_date,
    COUNT(*) as payment_count,
    SUM(total_amount) as daily_revenue,
    AVG(total_amount) as avg_payment,
    -- Desglose por tipo de estudiante
    COUNT(*) FILTER (WHERE s.type = 'adult') as adult_payments,
    COUNT(*) FILTER (WHERE s.type = 'kids') as kids_payments,
    SUM(total_amount) FILTER (WHERE s.type = 'adult') as adult_revenue,
    SUM(total_amount) FILTER (WHERE s.type = 'kids') as kids_revenue,
    -- Desglose por método de pago
    COUNT(*) FILTER (WHERE payment_method = 'cash') as cash_count,
    COUNT(*) FILTER (WHERE payment_method = 'transfer') as transfer_count,
    COUNT(*) FILTER (WHERE payment_method = 'card') as card_count,
    SUM(total_amount) FILTER (WHERE payment_method = 'cash') as cash_amount,
    SUM(total_amount) FILTER (WHERE payment_method = 'transfer') as transfer_amount,
    SUM(total_amount) FILTER (WHERE payment_method = 'card') as card_amount
FROM payments p
JOIN students s ON p.id_student = s.id_student
GROUP BY payment_date
ORDER BY payment_date DESC;

COMMENT ON VIEW v_daily_revenue IS 'Ingresos diarios con desgloses por tipo de estudiante y método de pago';


-- Vista 8: Ingresos mensuales (OPTIMIZED)
CREATE VIEW v_monthly_revenue AS
WITH monthly_data AS (
    SELECT 
        DATE_TRUNC('month', payment_date)::DATE as month,
        EXTRACT(YEAR FROM payment_date) as year,
        EXTRACT(MONTH FROM payment_date) as month_number,
        TO_CHAR(payment_date, 'Month YYYY') as month_name,
        SUM(total_amount) as monthly_revenue,
        SUM(total_amount) FILTER (WHERE s.type = 'adult') as adult_revenue,
        SUM(total_amount) FILTER (WHERE s.type = 'kids') as kids_revenue,
        SUM(total_amount) FILTER (WHERE payment_method = 'cash') as cash_revenue,
        SUM(total_amount) FILTER (WHERE payment_method = 'transfer') as transfer_revenue,
        SUM(total_amount) FILTER (WHERE payment_method = 'card') as card_revenue,
        COUNT(*) as payment_count,
        COUNT(DISTINCT p.id_student) as unique_students,
        AVG(total_amount) as avg_payment
    FROM payments p
    JOIN students s ON p.id_student = s.id_student
    GROUP BY DATE_TRUNC('month', payment_date)
)
SELECT 
    *,
    LAG(monthly_revenue) OVER (ORDER BY month) as previous_month_revenue,
    monthly_revenue - LAG(monthly_revenue) OVER (ORDER BY month) as revenue_change,
    ROUND(
        (monthly_revenue - LAG(monthly_revenue) OVER (ORDER BY month)) 
        / NULLIF(LAG(monthly_revenue) OVER (ORDER BY month), 0) * 100, 2
    ) as revenue_change_percentage
FROM monthly_data
ORDER BY month DESC;

COMMENT ON VIEW v_monthly_revenue IS 'Ingresos mensuales con comparativas y desgloses completos';


-- Vista 9: Ingresos anuales
CREATE VIEW v_yearly_revenue AS
SELECT 
    EXTRACT(YEAR FROM payment_date) as year,
    COUNT(*) as payment_count,
    COUNT(DISTINCT id_student) as unique_students,
    SUM(total_amount) as yearly_revenue,
    AVG(total_amount) as avg_payment,
    -- Desglose por tipo
    SUM(total_amount) FILTER (WHERE s.type = 'adult') as adult_revenue,
    SUM(total_amount) FILTER (WHERE s.type = 'kids') as kids_revenue,
    -- Desglose por método
    SUM(total_amount) FILTER (WHERE payment_method = 'cash') as cash_revenue,
    SUM(total_amount) FILTER (WHERE payment_method = 'transfer') as transfer_revenue,
    SUM(total_amount) FILTER (WHERE payment_method = 'card') as card_revenue
FROM payments p
JOIN students s ON p.id_student = s.id_student
GROUP BY EXTRACT(YEAR FROM payment_date)
ORDER BY year DESC;

COMMENT ON VIEW v_yearly_revenue IS 'Ingresos anuales con desgloses completos';


-- =====================================================
-- STATISTICS VIEWS (OPTIMIZED)
-- =====================================================

-- Vista 10: Estadísticas generales de estudiantes
CREATE VIEW v_students_statistics AS
SELECT 
    -- Totales generales
    COUNT(*) as total_students,
    COUNT(*) FILTER (WHERE status = 'active') as active_students,
    COUNT(*) FILTER (WHERE status = 'inactive') as inactive_students,
    COUNT(*) FILTER (WHERE status = 'payment_pending') as payment_pending_students,
    
    -- Por tipo
    COUNT(*) FILTER (WHERE type = 'adult') as adult_students,
    COUNT(*) FILTER (WHERE type = 'kids') as kids_students,
    COUNT(*) FILTER (WHERE type = 'adult' AND status = 'active') as active_adults,
    COUNT(*) FILTER (WHERE type = 'kids' AND status = 'active') as active_kids,
    
    -- Nuevos estudiantes
    COUNT(*) FILTER (WHERE enrollment_date >= CURRENT_DATE - INTERVAL '30 days') as new_students_last_30_days,
    COUNT(*) FILTER (WHERE enrollment_date >= DATE_TRUNC('month', CURRENT_DATE)) as new_students_this_month,
    COUNT(*) FILTER (WHERE enrollment_date >= DATE_TRUNC('year', CURRENT_DATE)) as new_students_this_year,
    
    -- Bajas
    COUNT(*) FILTER (WHERE cancellation_date >= CURRENT_DATE - INTERVAL '30 days') as cancelled_last_30_days,
    COUNT(*) FILTER (WHERE cancellation_date >= DATE_TRUNC('month', CURRENT_DATE)) as cancelled_this_month,
    
    -- Tasa de retención
    ROUND(
        COUNT(*) FILTER (WHERE status = 'active')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 
        2
    ) as retention_rate_percentage
FROM students;

COMMENT ON VIEW v_students_statistics IS 'Estadísticas generales de estudiantes para dashboard';


-- Vista 11: Distribución de estudiantes por plan
CREATE VIEW v_students_by_plan AS
SELECT 
    p.id_plan,
    p.name as plan_name,
    p.type as plan_type,
    p.frequency,
    p.monthly_price,
    COUNT(sp.id_student) as student_count,
    COUNT(sp.id_student) FILTER (WHERE s.status = 'active') as active_students,
    -- Revenue potencial mensual
    COUNT(sp.id_student) FILTER (WHERE s.status = 'active') * p.monthly_price as monthly_potential_revenue,
    -- Porcentaje del total
    ROUND(
        COUNT(sp.id_student)::NUMERIC / NULLIF(SUM(COUNT(sp.id_student)) OVER (), 0) * 100,
        2
    ) as percentage_of_total
FROM plans p
LEFT JOIN student_plan sp ON p.id_plan = sp.id_plan AND sp.active = true
LEFT JOIN students s ON sp.id_student = s.id_student
WHERE p.active = true
GROUP BY p.id_plan
ORDER BY student_count DESC;

COMMENT ON VIEW v_students_by_plan IS 'Distribución de estudiantes por tipo de plan';


-- Vista 12: Estadísticas de modalidades
CREATE VIEW v_modalities_statistics AS
SELECT 
    m.id_modality,
    m.name as modality_name,
    COUNT(DISTINCT sp.id_student) as total_students,
    COUNT(DISTINCT sp.id_student) FILTER (WHERE s.status = 'active') as active_students,
    COUNT(DISTINCT p.id_plan) as plans_offering,
    -- Revenue total de esta modalidad
    COALESCE(SUM(pay.total_amount), 0) as total_revenue_all_time
FROM modalities m
LEFT JOIN plan_modality pm ON m.id_modality = pm.id_modality
LEFT JOIN plans p ON pm.id_plan = p.id_plan
LEFT JOIN student_plan sp ON p.id_plan = sp.id_plan AND sp.active = true
LEFT JOIN students s ON sp.id_student = s.id_student
LEFT JOIN payments pay ON pay.id_plan = p.id_plan
WHERE m.active = true
GROUP BY m.id_modality
ORDER BY total_students DESC;

COMMENT ON VIEW v_modalities_statistics IS 'Estadísticas por modalidad deportiva';


-- Vista 13: Tendencia de crecimiento mensual (OPTIMIZED)
CREATE VIEW v_growth_trend AS
WITH monthly_enrollments AS (
    SELECT 
        DATE_TRUNC('month', enrollment_date)::DATE as month,
        TO_CHAR(enrollment_date, 'Month YYYY') as month_name,
        COUNT(*) as new_enrollments,
        COUNT(*) FILTER (WHERE type = 'adult') as new_adults,
        COUNT(*) FILTER (WHERE type = 'kids') as new_kids
    FROM students
    GROUP BY DATE_TRUNC('month', enrollment_date)
),
monthly_cancellations AS (
    SELECT 
        DATE_TRUNC('month', cancellation_date)::DATE as month,
        COUNT(*) as cancellations
    FROM students
    WHERE cancellation_date IS NOT NULL
    GROUP BY DATE_TRUNC('month', cancellation_date)
)
SELECT 
    me.month,
    me.month_name,
    me.new_enrollments,
    me.new_adults,
    me.new_kids,
    COALESCE(mc.cancellations, 0) as same_month_cancellations,
    me.new_enrollments - COALESCE(mc.cancellations, 0) as net_growth,
    SUM(me.new_enrollments) OVER (ORDER BY me.month) as cumulative_enrollments
FROM monthly_enrollments me
LEFT JOIN monthly_cancellations mc ON me.month = mc.month
ORDER BY me.month DESC;

COMMENT ON VIEW v_growth_trend IS 'Tendencia de crecimiento mensual de estudiantes';


-- Vista 14: KPIs principales (dashboard) - OPTIMIZED
CREATE VIEW v_main_kpis AS
SELECT 
    -- Estudiantes
    (SELECT COUNT(*) FROM students WHERE status = 'active') as active_students,
    (SELECT COUNT(*) FROM students WHERE status = 'payment_pending') as payment_pending,
    (SELECT COUNT(*) FROM students WHERE status = 'inactive') as inactive_students,
    
    -- Ingresos del mes actual
    (SELECT COALESCE(SUM(total_amount), 0) 
     FROM payments 
     WHERE DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE)
    ) as current_month_revenue,
    
    -- Ingresos del mes anterior
    (SELECT COALESCE(SUM(total_amount), 0) 
     FROM payments 
     WHERE DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    ) as previous_month_revenue,
    
    -- Pagos del día de hoy
    (SELECT COALESCE(SUM(total_amount), 0) 
     FROM payments 
     WHERE payment_date = CURRENT_DATE
    ) as today_revenue,
    
    -- Estudiantes que ingresaron este mes
    (SELECT COUNT(*) 
     FROM students 
     WHERE DATE_TRUNC('month', enrollment_date) = DATE_TRUNC('month', CURRENT_DATE)
    ) as new_students_this_month,
    
    -- Bajas este mes
    (SELECT COUNT(*) 
     FROM students 
     WHERE DATE_TRUNC('month', cancellation_date) = DATE_TRUNC('month', CURRENT_DATE)
    ) as cancelled_this_month,
    
    -- Revenue potencial mensual
    (SELECT SUM(p.monthly_price)
     FROM students s
     JOIN student_plan sp ON s.id_student = sp.id_student AND sp.active = true
     JOIN plans p ON sp.id_plan = p.id_plan
     WHERE s.status = 'active'
    ) as monthly_potential_revenue,
    
    -- Promedio de pago
    (SELECT AVG(total_amount) 
     FROM payments 
     WHERE DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE)
    ) as avg_payment_this_month;

COMMENT ON VIEW v_main_kpis IS 'KPIs principales para dashboard principal';


-- Vista 15: Análisis de retención por cohorte (OPTIMIZED)
CREATE VIEW v_cohort_retention AS
WITH cohort_payments AS (
    SELECT 
        s.id_student,
        DATE_TRUNC('month', s.enrollment_date)::DATE as cohort_month,
        COALESCE(SUM(p.total_amount), 0) as total_paid
    FROM students s
    LEFT JOIN payments p ON s.id_student = p.id_student
    GROUP BY s.id_student, DATE_TRUNC('month', s.enrollment_date)
)
SELECT 
    cohort_month,
    TO_CHAR(cohort_month, 'Month YYYY') as cohort_name,
    COUNT(*) as initial_students,
    COUNT(*) FILTER (WHERE s.status = 'active') as still_active,
    COUNT(*) FILTER (WHERE s.status = 'inactive') as churned,
    ROUND(
        COUNT(*) FILTER (WHERE s.status = 'active')::NUMERIC / NULLIF(COUNT(*), 0) * 100,
        2
    ) as retention_rate,
    AVG(CASE 
        WHEN s.cancellation_date IS NOT NULL 
        THEN s.cancellation_date - s.enrollment_date 
        ELSE CURRENT_DATE - s.enrollment_date 
    END) as avg_lifetime_days,
    COALESCE(SUM(cp.total_paid), 0) as total_revenue_generated,
    COALESCE(AVG(cp.total_paid), 0) as avg_revenue_per_student
FROM students s
LEFT JOIN cohort_payments cp ON s.id_student = cp.id_student
GROUP BY cohort_month
ORDER BY cohort_month DESC;

COMMENT ON VIEW v_cohort_retention IS 'Análisis de retención por cohorte de inscripción';


-- =====================================================
-- RECOMMENDATIONS
-- =====================================================
-- 
-- VIEWS TO KEEP (ESSENTIAL):
--   - v_students_list (main student list)
--   - v_student_detail (individual student view)
--   - v_monthly_revenue (financial reporting)
--   - v_main_kpis (dashboard)
--   - v_students_overdue (collections)
--
-- VIEWS TO CONSIDER MATERIALIZING:
--   - v_monthly_revenue (heavy calculations)
--   - v_cohort_retention (complex cohort analysis)
--   - v_growth_trend (historical trends)
--
-- REDUNDANT VIEWS TO REMOVE:
--   - v_students_current_plan (replaced by v_students_list)
--
-- =====================================================
