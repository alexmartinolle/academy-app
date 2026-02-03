-- =====================================================
-- 12. Useful Views for Backend
-- =====================================================

-- Vista: Estudiantes con su plan actual y modalidades
CREATE VIEW v_students_current_plan AS
SELECT 
    s.id_student,
    s.first_name,
    s.last_name,
    s.email,
    s.type,
    s.status,
    s.enrollment_date,
    s.cancellation_date,
    sp.id_student_plan,
    sp.start_date as plan_start_date,
    sp.end_date as plan_end_date,
    p.id_plan,
    p.name as plan_name,
    p.frequency,
    p.monthly_price,
    array_agg(m.name ORDER BY m.name) FILTER (WHERE m.name IS NOT NULL) as modalities
FROM students s
LEFT JOIN student_plan sp ON s.id_student = sp.id_student AND sp.active = true
LEFT JOIN plans p ON sp.id_plan = p.id_plan
LEFT JOIN plan_modality pm ON p.id_plan = pm.id_plan
LEFT JOIN modalities m ON pm.id_modality = m.id_modality
GROUP BY s.id_student, sp.id_student_plan, p.id_plan;

COMMENT ON VIEW v_students_current_plan IS 'Vista consolidada de estudiantes con su plan activo y modalidades disponibles';
