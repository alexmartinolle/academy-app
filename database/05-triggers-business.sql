-- =====================================================
-- 11. Business Logic Triggers - Student Status Sync
-- =====================================================

-- Trigger 1: Actualizar status a 'active' cuando se registra un pago válido
CREATE OR REPLACE FUNCTION sync_student_status_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Cuando se registra un pago que cubre hasta hoy o futuro
    IF NEW.period_end >= CURRENT_DATE THEN
        UPDATE students 
        SET status = 'active'
        WHERE id_student = NEW.id_student;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_status_after_payment
AFTER INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION sync_student_status_on_payment();

-- Trigger 2: Actualizar status a 'payment_pending' cuando termina el plan
CREATE OR REPLACE FUNCTION sync_student_status_on_plan_end()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se desactiva un plan (end_date establecido)
    IF NEW.active = false AND OLD.active = true THEN
        UPDATE students 
        SET status = 'payment_pending'
        WHERE id_student = NEW.id_student
        AND NOT EXISTS (
            -- A menos que tenga otro plan activo
            SELECT 1 FROM student_plan 
            WHERE id_student = NEW.id_student 
            AND active = true
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_status_on_plan_change
AFTER UPDATE ON student_plan
FOR EACH ROW
EXECUTE FUNCTION sync_student_status_on_plan_end();
