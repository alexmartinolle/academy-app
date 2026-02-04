-- =============================================================================
-- Academy App - Database Seeder
-- =============================================================================
-- This script inserts realistic sample data for testing the application
-- Run this after the main setup: psql -U academy_user -d academy_db -f seeder.sql
-- =============================================================================

-- =============================================================================
-- 1. Clean existing data
-- =============================================================================

-- Clean tables in correct order to respect foreign keys
DELETE FROM payments;
DELETE FROM student_plan;
DELETE FROM students;
DELETE FROM plan_modality;
DELETE FROM plans;
DELETE FROM modalities;

-- Reset sequences
ALTER SEQUENCE modalities_id_modality_seq RESTART WITH 1;
ALTER SEQUENCE plans_id_plan_seq RESTART WITH 1;
ALTER SEQUENCE students_id_student_seq RESTART WITH 1;
ALTER SEQUENCE student_plan_id_student_plan_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_payment_seq RESTART WITH 1;

-- Disable triggers temporarily for faster insertion
SET session_replication_role = replica;

-- =============================================================================
-- 2. Insert Modalities
-- =============================================================================

INSERT INTO modalities (name, active) VALUES
('MMA', true),
('BJJ', true),
('Yoga', true),
('Budokon', true);

-- =============================================================================
-- 3. Insert Plans
-- =============================================================================

INSERT INTO plans (name, type, frequency, monthly_price, active) VALUES
-- BJJ Adult Plans
('BJJ Adult 1x Week', 'adult', '1_week', 50.00, true),
('BJJ Adult 2x Week', 'adult', '2_week', 70.00, true),
('BJJ Adult Unlimited', 'adult', 'unlimited', 90.00, true),
-- MMA Plans
('MMA Unlimited', 'adult', 'unlimited', 80.00, true),
-- Yoga/Budokon Plans
('Yoga/Budokon Unlimited', 'adult', 'unlimited', 50.00, true),
-- All Unlimited Plan
('All Unlimited', 'adult', 'unlimited', 98.00, true),
-- BJJ Kids Plans
('BJJ Kids 1x Week', 'kids', '1_week', 45.00, true),
('BJJ Kids 2x Week', 'kids', '2_week', 65.00, true),
('BJJ Kids Unlimited', 'kids', 'unlimited', 75.00, true);

-- =============================================================================
-- 4. Associate Plans with Modalities
-- =============================================================================

INSERT INTO plan_modality (id_plan, id_modality) VALUES
-- BJJ Adult Plans
(1, 2), -- BJJ Adult 1x Week - BJJ
(2, 2), -- BJJ Adult 2x Week - BJJ
(3, 2), -- BJJ Adult Unlimited - BJJ
-- MMA Plans
(4, 1), -- MMA Unlimited - MMA
-- Yoga/Budokon Plans
(5, 3), -- Yoga/Budokon Unlimited - Yoga
(5, 4), -- Yoga/Budokon Unlimited - Budokon
-- All Unlimited Plan
(6, 1), -- All Unlimited - MMA
(6, 2), -- All Unlimited - BJJ
(6, 3), -- All Unlimited - Yoga
(6, 4), -- All Unlimited - Budokon
-- BJJ Kids Plans
(7, 2), -- BJJ Kids 1x Week - BJJ
(8, 2), -- BJJ Kids 2x Week - BJJ
(9, 2); -- BJJ Kids Unlimited - BJJ

-- =============================================================================
-- 5. Insert Students
-- =============================================================================

INSERT INTO students (first_name, last_name, email, type, status, enrollment_date) VALUES
-- Kids Students
('Emma', 'García', 'emma.garcia@email.com', 'kids', 'active', '2025-01-15'),
('Lucas', 'Martínez', 'lucas.martinez@email.com', 'kids', 'active', '2025-01-20'),
('Sofía', 'López', 'sofia.lopez@email.com', 'kids', 'active', '2025-02-01'),
('Noah', 'Sánchez', 'noah.sanchez@email.com', 'kids', 'active', '2025-02-10'),
('Ava', 'Rodríguez', 'ava.rodriguez@email.com', 'kids', 'active', '2025-02-15'),
('Mason', 'Fernández', 'mason.fernandez@email.com', 'kids', 'active', '2025-03-01'),
('Isabella', 'Gómez', 'isabella.gomez@email.com', 'kids', 'active', '2025-03-05'),
('Ethan', 'Díaz', 'ethan.diaz@email.com', 'kids', 'active', '2025-03-10'),
('Ava', 'Pérez', 'ava.perez@email.com', 'kids', 'payment_pending', '2025-03-15'),
('Mason', 'Martín', 'mason.martin@email.com', 'kids', 'active', '2025-04-01'),
('Isabella', 'Jiménez', 'isabella.jimenez@email.com', 'kids', 'active', '2025-04-05'),
('Ethan', 'Ruiz', 'ethan.ruiz@email.com', 'kids', 'active', '2025-04-10'),
('Ava', 'Hernández', 'ava.hernandez@email.com', 'kids', 'payment_pending', '2025-04-15'),
-- Adult Students
('Michael', 'Moreno', 'michael.moreno@email.com', 'adult', 'active', '2025-01-15'),
('Sarah', 'Muñoz', 'sarah.munoz@email.com', 'adult', 'active', '2025-01-05'),
('David', 'Álvarez', 'david.alvarez@email.com', 'adult', 'active', '2025-01-10'),
('Jennifer', 'Castro', 'jennifer.castro@email.com', 'adult', 'active', '2025-01-15'),
('Robert', 'Ortega', 'robert.ortega@email.com', 'adult', 'active', '2025-02-01'),
('Lisa', 'Garrido', 'lisa.garrido@email.com', 'adult', 'active', '2025-02-01'),
('William', 'Delgado', 'william.delgado@email.com', 'adult', 'active', '2025-02-25'),
('Patricia', 'Marín', 'patricia.marin@email.com', 'adult', 'payment_pending', '2025-02-20'),
('James', 'Molina', 'james.molina@email.com', 'adult', 'active', '2025-02-25'),
('Mary', 'Vargas', 'mary.vargas@email.com', 'adult', 'active', '2025-03-01'),
('Richard', 'Blanco', 'richard.blanco@email.com', 'adult', 'active', '2025-03-01'),
('Barbara', 'Cortés', 'barbara.cortes@email.com', 'adult', 'active', '2025-03-10'),
('Charles', 'Santos', 'charles.santos@email.com', 'adult', 'active', '2025-03-15'),
('Dorothy', 'Luna', 'dorothy.luna@email.com', 'adult', 'active', '2025-03-20'),
('Joseph', 'Cruz', 'joseph.cruz@email.com', 'adult', 'active', '2025-03-01'),
('Nancy', 'Cabrera', 'nancy.cabrera@email.com', 'adult', 'active', '2025-03-10'),
('Thomas', 'Nicolás', 'thomas.nicolas@email.com', 'adult', 'active', '2025-03-15'),
('Betty', 'Romero', 'betty.romero@email.com', 'adult', 'inactive', '2025-03-01'),
('Mark', 'Suárez', 'mark.suarez@email.com', 'adult', 'active', '2025-03-10'),
('Sandra', 'Ramos', 'sandra.ramos@email.com', 'adult', 'active', '2025-03-15'),
('Paul', 'Torres', 'paul.torres@email.com', 'adult', 'active', '2025-03-20'),
('Karen', 'Gil', 'karen.gil@email.com', 'adult', 'payment_pending', '2025-03-20'),
('Donald', 'Serrano', 'donald.serrano@email.com', 'adult', 'active', '2025-03-25'),
('Ashley', 'Reyes', 'ashley.reyes@email.com', 'adult', 'active', '2025-04-01');

-- =============================================================================
-- 6. Insert Student Plans
-- =============================================================================

INSERT INTO student_plan (id_student, id_plan, start_date, end_date, active) VALUES
-- Kids Plans
(1, 7, '2025-01-15', '2025-02-15', false), -- Emma - BJJ Kids 1x Week (completed)
(1, 8, '2025-02-16', '2025-03-16', false), -- Emma - BJJ Kids 2x Week (completed)
(1, 9, '2025-03-17', NULL, true), -- Emma - BJJ Kids Unlimited (current)
(2, 8, '2025-01-20', '2025-02-20', false), -- Lucas - BJJ Kids 2x Week (completed)
(2, 9, '2025-02-21', NULL, true), -- Lucas - BJJ Kids Unlimited (current)
(3, 9, '2025-02-01', NULL, true), -- Sophia - BJJ Kids Unlimited (current)
(4, 8, '2025-02-10', '2025-03-10', false), -- Noah - BJJ Kids 2x Week (completed)
(4, 9, '2025-03-11', NULL, true), -- Noah - BJJ Kids Unlimited (current)
(5, 8, '2025-02-15', '2025-03-15', false), -- Ava - BJJ Kids 2x Week (completed)
(6, 9, '2025-03-01', NULL, true), -- Mason - BJJ Kids Unlimited (current)
(7, 9, '2025-03-05', NULL, true), -- Isabella - BJJ Kids Unlimited (current)
(8, 9, '2025-03-10', NULL, true), -- Ethan - BJJ Kids Unlimited (current)
(9, 8, '2025-03-15', '2025-04-15', false), -- Ava - BJJ Kids 2x Week (completed)
(10, 9, '2025-04-01', NULL, true), -- Mason - BJJ Kids Unlimited (current)
(11, 9, '2025-04-05', NULL, true), -- Isabella - BJJ Kids Unlimited (current)
(12, 8, '2025-04-10', NULL, true), -- Ethan - BJJ Kids 2x Week (current)
(13, 9, '2025-04-15', NULL, true), -- Ava - BJJ Kids Unlimited (current)
-- Adult Plans
(14, 1, '2025-01-15', '2025-02-15', false), -- Michael - BJJ Adult 1x Week (completed)
(14, 2, '2025-02-16', '2025-03-16', false), -- Michael - BJJ Adult 2x Week (completed)
(14, 3, '2025-03-17', NULL, true), -- Michael - BJJ Adult Unlimited (current)
(15, 2, '2025-01-05', '2025-02-05', false), -- Sarah - BJJ Adult 2x Week (completed)
(15, 3, '2025-02-06', NULL, true), -- Sarah - BJJ Adult Unlimited (current)
(16, 4, '2025-01-10', NULL, true), -- David - MMA Unlimited (current)
(17, 2, '2025-01-15', '2025-02-15', false), -- Jennifer - BJJ Adult 2x Week (completed)
(17, 3, '2025-02-16', NULL, true), -- Jennifer - BJJ Adult Unlimited (current)
(18, 3, '2025-02-01', NULL, true), -- Robert - BJJ Adult Unlimited (current)
(19, 5, '2025-02-01', '2025-03-01', false), -- Lisa - Yoga/Budokon Unlimited (completed)
(19, 3, '2025-03-01', NULL, true), -- Lisa - BJJ Adult Unlimited (current)
(20, 3, '2025-02-25', NULL, true), -- William - BJJ Adult Unlimited (current)
(21, 5, '2025-02-25', '2025-03-25', false), -- Patricia - Yoga/Budokon Unlimited (completed)
(21, 3, '2025-03-01', NULL, true), -- Patricia - BJJ Adult Unlimited (current)
(22, 3, '2025-02-25', NULL, true), -- James - BJJ Adult Unlimited (current)
(23, 3, '2025-03-01', NULL, true), -- Mary - BJJ Adult Unlimited (current)
(24, 4, '2025-03-01', NULL, true), -- Richard - MMA Unlimited (current)
(25, 3, '2025-03-10', NULL, true), -- Barbara - BJJ Adult Unlimited (current)
(26, 6, '2025-03-15', NULL, true), -- Charles - All Unlimited (current)
(27, 3, '2025-03-20', NULL, true), -- Dorothy - BJJ Adult Unlimited (current)
(28, 6, '2025-03-01', NULL, true), -- Joseph - All Unlimited (current)
(29, 3, '2025-03-10', NULL, true), -- Nancy - BJJ Adult Unlimited (current)
(30, 3, '2025-03-15', NULL, true), -- Thomas - BJJ Adult Unlimited (current)
(31, 4, '2025-03-20', NULL, true), -- Richard - MMA Unlimited (current)
(32, 3, '2025-03-25', NULL, true), -- Barbara - BJJ Adult Unlimited (current)
(33, 3, '2025-03-10', NULL, true), -- Mark - BJJ Adult Unlimited (current)
(34, 5, '2025-03-15', NULL, true), -- Sandra - Yoga/Budokon Unlimited (current)
(35, 4, '2025-03-20', NULL, true), -- Paul - MMA Unlimited (current)
(36, 3, '2025-03-25', NULL, true), -- Karen - BJJ Adult Unlimited (current)
(37, 3, '2025-03-30', NULL, true), -- Donald - BJJ Adult Unlimited (current)
(37, 6, '2025-04-01', NULL, true); -- Ashley - All Unlimited (current)

-- =============================================================================
-- 7. Insert Payments
-- =============================================================================

INSERT INTO payments (id_student, id_plan, payment_date, period_start, period_end, total_amount, payment_method, observations) VALUES
-- Pagos históricos para Emma
(1, 7, '2025-01-15', '2025-01-15', '2025-02-15', 45.00, 'cash', 'Pago inicial para BJJ Kids 1x Week'),
(1, 8, '2025-02-16', '2025-02-16', '2025-03-16', 65.00, 'transfer', 'Actualizado a BJJ Kids 2x Week'),
(1, 9, '2025-03-17', '2025-03-17', '2025-04-17', 75.00, 'card', 'Actualizado a BJJ Kids Unlimited'),
-- Pagos históricos para Lucas
(2, 8, '2025-01-20', '2025-01-20', '2025-02-20', 65.00, 'cash', 'Pago inicial para BJJ Kids 2x Week'),
(2, 9, '2025-02-21', '2025-02-21', '2025-03-21', 75.00, 'card', 'Actualizado a BJJ Kids Unlimited'),
-- Pagos recientes para Sofía
(3, 9, '2025-02-01', '2025-02-01', '2025-03-01', 75.00, 'cash', 'Pago inicial para BJJ Kids Unlimited'),
(3, 9, '2025-03-01', '2025-03-01', '2025-04-01', 75.00, 'card', 'Renovación mensual'),
-- Pagos recientes para Noah
(4, 8, '2025-02-10', '2025-02-10', '2025-03-10', 65.00, 'cash', 'Pago inicial para BJJ Kids 2x Week'),
(4, 9, '2025-03-11', '2025-03-11', '2025-04-11', 75.00, 'transfer', 'Actualizado a BJJ Kids Unlimited'),
-- Pagos recientes para Mason
(6, 9, '2025-03-01', '2025-03-01', '2025-04-01', 75.00, 'card', 'Pago inicial para BJJ Kids Unlimited'),
-- Pagos recientes para Isabella
(7, 9, '2025-03-05', '2025-03-05', '2025-04-05', 75.00, 'cash', 'Pago inicial para BJJ Kids Unlimited'),
-- Pagos recientes para Ethan
(8, 9, '2025-03-10', '2025-03-10', '2025-04-10', 75.00, 'card', 'Pago inicial para BJJ Kids Unlimited'),
-- Pagos recientes para Ava
(9, 8, '2025-03-15', '2025-03-15', '2025-04-15', 65.00, 'cash', 'Pago inicial para BJJ Kids 2x Week'),
-- Pagos recientes para Mason
(10, 9, '2025-04-01', '2025-04-01', '2025-05-01', 75.00, 'card', 'Pago inicial para BJJ Kids Unlimited'),
-- Pagos recientes para Isabella
(11, 9, '2025-04-05', '2025-04-05', '2025-05-05', 75.00, 'transfer', 'Pago inicial para BJJ Kids Unlimited'),
-- Pagos recientes para Ethan
(12, 8, '2025-04-10', '2025-04-10', '2025-05-10', 65.00, 'cash', 'Pago inicial para BJJ Kids 2x Week'),
-- Pagos recientes para Ava
(13, 9, '2025-04-15', '2025-04-15', '2025-05-15', 75.00, 'card', 'Pago inicial para BJJ Kids Unlimited'),
-- Pagos históricos para Michael
(14, 1, '2025-01-15', '2025-01-15', '2025-02-15', 50.00, 'cash', 'Pago inicial para BJJ Adult 1x Week'),
(14, 2, '2025-02-16', '2025-02-16', '2025-03-16', 70.00, 'transfer', 'Actualizado a BJJ Adult 2x Week'),
(14, 3, '2025-03-17', '2025-03-17', '2025-04-17', 90.00, 'card', 'Actualizado a BJJ Adult Unlimited'),
-- Pagos recientes para Sarah
(15, 2, '2025-01-05', '2025-01-05', '2025-02-05', 70.00, 'cash', 'Pago inicial para BJJ Adult 2x Week'),
(15, 3, '2025-02-06', '2025-02-06', '2025-03-06', 90.00, 'transfer', 'Actualizado a BJJ Adult Unlimited'),
(15, 3, '2025-03-06', '2025-03-06', '2025-04-06', 90.00, 'card', 'Renovación mensual'),
-- Pagos recientes para David
(16, 4, '2025-01-10', '2025-01-10', '2025-02-10', 80.00, 'card', 'Pago inicial para MMA Unlimited'),
(16, 4, '2025-02-10', '2025-02-10', '2025-03-10', 80.00, 'card', 'Renovación mensual'),
(16, 4, '2025-03-10', '2025-03-10', '2025-04-10', 80.00, 'card', 'Renovación mensual'),
-- Pagos recientes para Jennifer
(17, 2, '2025-01-15', '2025-01-15', '2025-02-15', 70.00, 'cash', 'Pago inicial para BJJ Adult 2x Week'),
(17, 3, '2025-02-16', '2025-02-16', '2025-03-16', 90.00, 'transfer', 'Actualizado a BJJ Adult Unlimited'),
(17, 3, '2025-03-16', '2025-03-16', '2025-04-16', 90.00, 'card', 'Renovación mensual'),
-- Pagos recientes para Robert
(18, 3, '2025-02-01', '2025-02-01', '2025-03-01', 90.00, 'card', 'Pago inicial para BJJ Adult Unlimited'),
(18, 3, '2025-03-01', '2025-03-01', '2025-04-01', 90.00, 'card', 'Renovación mensual'),
-- Pagos recientes para Lisa
(19, 5, '2025-02-01', '2025-02-01', '2025-03-01', 50.00, 'cash', 'Pago inicial para Yoga/Budokon Unlimited'),
(19, 3, '2025-03-01', '2025-03-01', '2025-04-01', 90.00, 'transfer', 'Actualizado a BJJ Adult Unlimited'),
-- Pagos recientes para William
(20, 3, '2025-02-25', '2025-02-25', '2025-03-25', 90.00, 'card', 'Pago inicial para BJJ Adult Unlimited'),
(20, 3, '2025-03-25', '2025-03-25', '2025-04-25', 90.00, 'card', 'Renovación mensual'),
-- Pagos recientes para Patricia
(21, 5, '2025-02-25', '2025-02-25', '2025-03-25', 50.00, 'cash', 'Pago inicial para Yoga/Budokon Unlimited'),
(21, 3, '2025-03-01', '2025-03-01', '2025-04-01', 90.00, 'transfer', 'Actualizado a BJJ Adult Unlimited'),
-- Pagos recientes para James
(22, 3, '2025-02-25', '2025-02-25', '2025-03-25', 90.00, 'card', 'Pago inicial para BJJ Adult Unlimited'),
(22, 3, '2025-03-25', '2025-03-25', '2025-04-25', 90.00, 'card', 'Renovación mensual'),
-- Pagos recientes para Mary
(23, 3, '2025-03-01', '2025-03-01', '2025-04-01', 90.00, 'transfer', 'Pago inicial para BJJ Adult Unlimited'),
-- Pagos recientes para Richard
(24, 4, '2025-03-01', '2025-03-01', '2025-04-01', 80.00, 'card', 'Pago inicial para MMA Unlimited'),
(24, 4, '2025-04-01', '2025-04-01', '2025-05-01', 80.00, 'card', 'Renovación mensual'),
-- Pagos recientes para Barbara
(25, 3, '2025-03-10', '2025-03-10', '2025-04-10', 90.00, 'cash', 'Pago inicial para BJJ Adult Unlimited'),
-- Pagos recientes para Charles
(26, 6, '2025-03-15', '2025-03-15', '2025-04-15', 98.00, 'card', 'Pago inicial para All Unlimited'),
(26, 6, '2025-04-15', '2025-04-15', '2025-05-15', 98.00, 'card', 'Renovación mensual'),
-- Pagos recientes para Dorothy
(27, 3, '2025-03-20', '2025-03-20', '2025-04-20', 90.00, 'transfer', 'Pago inicial para BJJ Adult Unlimited'),
-- Pagos recientes para Joseph
(28, 6, '2025-03-01', '2025-03-01', '2025-04-01', 98.00, 'cash', 'Pago inicial para All Unlimited'),
(28, 6, '2025-04-01', '2025-04-01', '2025-05-01', 98.00, 'transfer', 'Renovación mensual'),
-- Pagos recientes para Nancy
(29, 3, '2025-03-10', '2025-03-10', '2025-04-10', 90.00, 'card', 'Pago inicial para BJJ Adult Unlimited'),
-- Pagos recientes para Thomas
(30, 3, '2025-03-15', '2025-03-15', '2025-04-15', 90.00, 'cash', 'Pago inicial para BJJ Adult Unlimited'),
-- Pagos recientes para Richard
(31, 4, '2025-03-20', '2025-03-20', '2025-04-20', 80.00, 'card', 'Pago inicial para MMA Unlimited'),
-- Pagos recientes para Barbara
(32, 3, '2025-03-25', '2025-03-25', '2025-04-25', 90.00, 'card', 'Pago inicial para BJJ Adult Unlimited'),
-- Pagos recientes para Mark
(33, 3, '2025-03-10', '2025-03-10', '2025-04-10', 90.00, 'transfer', 'Pago inicial para BJJ Adult Unlimited'),
-- Pagos recientes para Sandra
(34, 5, '2025-03-15', '2025-03-15', '2025-04-15', 50.00, 'card', 'Pago inicial para Yoga/Budokon Unlimited'),
-- Pagos recientes para Paul
(35, 4, '2025-03-20', '2025-03-20', '2025-04-20', 80.00, 'card', 'Pago inicial para MMA Unlimited'),
-- Pagos recientes para Karen
(36, 3, '2025-03-25', '2025-03-25', '2025-04-25', 90.00, 'cash', 'Pago inicial para BJJ Adult Unlimited'),
-- Pagos recientes para Donald
(37, 3, '2025-03-30', '2025-03-30', '2025-04-30', 90.00, 'card', 'Pago inicial para BJJ Adult Unlimited'),
-- Pagos recientes para Ashley
(37, 6, '2025-04-01', '2025-04-01', '2025-05-01', 98.00, 'transfer', 'Pago inicial para All Unlimited');

-- =============================================================================
-- 8. Re-enable triggers
-- =============================================================================

SET session_replication_role = DEFAULT;

-- =============================================================================
-- 9. Update sequences
-- =============================================================================

SELECT setval('modalities_id_modality_seq', (SELECT COALESCE(MAX(id_modality), 0) + 1) FROM modalities);
SELECT setval('plans_id_plan_seq', (SELECT COALESCE(MAX(id_plan), 0) + 1) FROM plans);
SELECT setval('students_id_student_seq', (SELECT COALESCE(MAX(id_student), 0) + 1) FROM students);
SELECT setval('student_plan_id_student_plan_seq', (SELECT COALESCE(MAX(id_student_plan), 0) + 1) FROM student_plan);
SELECT setval('payments_id_payment_seq', (SELECT COALESCE(MAX(id_payment), 0) + 1) FROM payments);

-- =============================================================================
-- 10. Display summary
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '==================================================================';
    RAISE NOTICE '🌱️ Academy App - Database Seeder Complete!';
    RAISE NOTICE '==================================================================';
    RAISE NOTICE 'Sample data inserted:';
    RAISE NOTICE '  Modalities: %', (SELECT COUNT(*) FROM modalities);
    RAISE NOTICE '  Plans: %', (SELECT COUNT(*) FROM plans);
    RAISE NOTICE '  Students: %', (SELECT COUNT(*) FROM students);
    RAISE NOTICE '  Student Plans: %', (SELECT COUNT(*) FROM student_plan);
    RAISE NOTICE '  Payments: %', (SELECT COUNT(*) FROM payments);
    RAISE NOTICE '';
    RAISE NOTICE '📊 Sample Statistics:';
    RAISE NOTICE '  Active Students: %', (SELECT COUNT(*) FROM students WHERE status = 'active');
    RAISE NOTICE '  Payment Pending: %', (SELECT COUNT(*) FROM students WHERE status = 'payment_pending');
    RAISE NOTICE '  Inactive Students: %', (SELECT COUNT(*) FROM students WHERE status = 'inactive');
    RAISE NOTICE '  Kids Students: %', (SELECT COUNT(*) FROM students WHERE type = 'kids');
    RAISE NOTICE '  Adult Students: %', (SELECT COUNT(*) FROM students WHERE type = 'adult');
    RAISE NOTICE '  Total Revenue: %', (SELECT COALESCE(SUM(total_amount), 0) FROM payments);
    RAISE NOTICE '';
    RAISE NOTICE '💰 Revenue by Plan Type:';
    RAISE NOTICE '  BJJ Kids: %', (SELECT COALESCE(SUM(p.total_amount), 0) FROM payments p JOIN plans pl ON p.id_plan = pl.id_plan WHERE pl.type = 'kids' AND pl.name LIKE 'BJJ%');
    RAISE NOTICE '  BJJ Adult: %', (SELECT COALESCE(SUM(p.total_amount), 0) FROM payments p JOIN plans pl ON p.id_plan = pl.id_plan WHERE pl.type = 'adult' AND pl.name LIKE 'BJJ%');
    RAISE NOTICE '  MMA: %', (SELECT COALESCE(SUM(p.total_amount), 0) FROM payments p JOIN plans pl ON p.id_plan = pl.id_plan WHERE pl.name LIKE 'MMA%');
    RAISE NOTICE '  Yoga/Budokon: %', (SELECT COALESCE(SUM(p.total_amount), 0) FROM payments p JOIN plans pl ON p.id_plan = pl.id_plan WHERE pl.name LIKE '%Yoga/Budokon%');
    RAISE NOTICE '  All Unlimited: %', (SELECT COALESCE(SUM(p.total_amount), 0) FROM payments p JOIN plans pl ON p.id_plan = pl.id_plan WHERE pl.name LIKE 'All Unlimited');
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Plan Distribution:';
    RAISE NOTICE '  Most Popular Plan: %', (SELECT pl.name FROM plans pl JOIN student_plan sp ON pl.id_plan = sp.id_plan WHERE sp.active = true GROUP BY pl.name ORDER BY COUNT(*) DESC LIMIT 1);
    RAISE NOTICE '  Plan Types Available: %', (SELECT COUNT(DISTINCT type) FROM plans);
    RAISE NOTICE '  Modalities Available: %', (SELECT COUNT(*) FROM modalities);
    RAISE NOTICE '==================================================================';
END $$;
