-- ==========================================================
-- DATABASE SEEDER FOR MARTIAL ARTS ACADEMY
-- Date: 2026-01-28
-- Complete reset with ID counters restart
-- ==========================================================

-- Disable foreign key constraints temporarily
SET session_replication_role = replica;

-- Clear all data and reset ID counters
TRUNCATE TABLE payments, students, plans, disciplines RESTART IDENTITY CASCADE;

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;

-- Insert disciplines
INSERT INTO disciplines (name) VALUES 
('BJJ'),
('MMA'),
('Budokon'),
('Yoga');

-- Insert plans for adults
INSERT INTO plans (name, price, type) VALUES 
('1 class per week', 50.00, 'adult'),
('2 classes per week', 70.00, 'adult'),
('BJJ Unlimited', 90.00, 'adult'),
('MMA Unlimited', 80.00, 'adult'),
('Budokon and Yoga Unlimited', 50.00, 'adult'),
('All Unlimited', 98.00, 'adult');

-- Insert plans for kids
INSERT INTO plans (name, price, type) VALUES 
('1 class per week', 45.00, 'kids'),
('2 classes per week', 65.00, 'kids'),
('Unlimited', 75.00, 'kids');

-- Verify plan IDs
SELECT '=== PLAN IDs ===' as info;
SELECT id, name, type, price FROM plans ORDER BY id;

-- Insert students - ensuring every plan combination is represented
INSERT INTO students (first_name, last_name, email, type, enrollment_date) VALUES 
-- Adult students - each with different plans
('John', 'Smith', 'john.smith@email.com', 'adult', '2025-01-15'),      -- Will use: 1 class per week
('Maria', 'Garcia', 'maria.garcia@email.com', 'adult', '2025-02-20'),   -- Will use: 2 classes per week
('David', 'Johnson', 'david.j@email.com', 'adult', '2025-03-10'),      -- Will use: BJJ Unlimited
('Emma', 'Wilson', 'emma.w@email.com', 'adult', '2025-04-05'),         -- Will use: MMA Unlimited
('Carlos', 'Rodriguez', 'carlos.r@email.com', 'adult', '2025-05-12'),   -- Will use: Budokon and Yoga Unlimited
('Sophia', 'Chen', 'sophia.c@email.com', 'adult', '2025-06-18'),       -- Will use: All Unlimited

-- Kids students - each with different plans
('Lucas', 'Martin', 'lucas.m@email.com', 'kids', '2025-07-22'),        -- Will use: 1 class per week
('Sofia', 'Anderson', 'sofia.a@email.com', 'kids', '2025-08-14'),      -- Will use: 2 classes per week
('Michael', 'Brown', 'michael.b@email.com', 'kids', '2025-09-10'),     -- Will use: Unlimited

-- Additional students for variety
('Robert', 'Taylor', 'robert.t@email.com', 'adult', '2025-09-15'),     -- BJJ Unlimited - pending
('Ana', 'Martinez', 'ana.m@email.com', 'adult', '2025-10-20'),          -- 2 classes per week - pending
('James', 'Davis', 'james.d@email.com', 'adult', '2025-11-25'),         -- MMA Unlimited - inactive
('Olivia', 'Lopez', 'olivia.l@email.com', 'kids', '2025-12-05'),       -- 2 classes per week - pending
('William', 'Gonzalez', 'william.g@email.com', 'adult', '2025-01-08'), -- 1 class per week - inactive
('Isabella', 'Perez', 'isabella.p@email.com', 'adult', '2025-02-12'),  -- Budokon and Yoga Unlimited - inactive
('Daniel', 'Sanchez', 'daniel.s@email.com', 'adult', '2025-03-25'),     -- All Unlimited - inactive
('Mia', 'Ramirez', 'mia.r@email.com', 'kids', '2025-04-30'),           -- 1 class per week - inactive

-- Trial students (no payments yet)
('Liam', 'Walker', 'liam.w@email.com', 'adult', '2026-01-20'),
('Ava', 'Hall', 'ava.h@email.com', 'adult', '2026-01-22'),
('Noah', 'Young', 'noah.y@email.com', 'kids', '2026-01-25');

-- Verify student IDs
SELECT '=== STUDENT IDs ===' as info;
SELECT id, first_name, last_name, type FROM students ORDER BY id;

-- Insert payments - ensuring every plan is used and various payment scenarios
-- Plan IDs: 1=1class(adult), 2=2class(adult), 3=BJJ(adult), 4=MMA(adult), 5=BudokonYoga(adult), 6=All(adult), 7=1class(kids), 8=2class(kids), 9=Unlimited(kids)

-- John Smith (ID: 1) - 1 class per week (plan_id: 1) - ACTIVE with advance payments
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(1, 1, 9, 2025, '2025-09-01', 'paid', 'monthly'),
(1, 1, 10, 2025, '2025-10-01', 'paid', 'monthly'),
(1, 1, 11, 2025, '2025-11-01', 'paid', 'monthly'),
(1, 1, 12, 2025, '2025-12-01', 'paid', 'monthly'),
(1, 1, 1, 2026, '2026-01-01', 'paid', 'monthly'),
(1, 1, 2, 2026, '2026-01-28', 'paid', 'advanced'),
(1, 1, 3, 2026, '2026-01-28', 'paid', 'advanced'),
(1, 1, 4, 2026, '2026-01-28', 'paid', 'advanced');

-- Maria Garcia (ID: 2) - 2 classes per week (plan_id: 2) - ACTIVE
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(2, 2, 9, 2025, '2025-09-05', 'paid', 'monthly'),
(2, 2, 10, 2025, '2025-10-05', 'paid', 'monthly'),
(2, 2, 11, 2025, '2025-11-05', 'paid', 'monthly'),
(2, 2, 12, 2025, '2025-12-05', 'paid', 'monthly'),
(2, 2, 1, 2026, '2026-01-05', 'paid', 'monthly'),
(2, 2, 2, 2026, '2026-01-25', 'paid', 'advanced');

-- David Johnson (ID: 3) - BJJ Unlimited (plan_id: 3) - ACTIVE
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(3, 3, 9, 2025, '2025-09-10', 'paid', 'monthly'),
(3, 3, 10, 2025, '2025-10-10', 'paid', 'monthly'),
(3, 3, 11, 2025, '2025-11-10', 'paid', 'monthly'),
(3, 3, 12, 2025, '2025-12-10', 'paid', 'monthly'),
(3, 3, 1, 2026, '2026-01-10', 'paid', 'monthly'),
(3, 3, 2, 2026, '2026-01-20', 'paid', 'advanced'),
(3, 3, 3, 2026, '2026-01-20', 'paid', 'advanced');

-- Emma Wilson (ID: 4) - MMA Unlimited (plan_id: 4) - ACTIVE with many advance payments
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(4, 4, 9, 2025, '2025-09-15', 'paid', 'monthly'),
(4, 4, 10, 2025, '2025-10-15', 'paid', 'monthly'),
(4, 4, 11, 2025, '2025-11-15', 'paid', 'monthly'),
(4, 4, 12, 2025, '2025-12-15', 'paid', 'monthly'),
(4, 4, 1, 2026, '2026-01-15', 'paid', 'monthly'),
(4, 4, 2, 2026, '2026-01-20', 'paid', 'advanced'),
(4, 4, 3, 2026, '2026-01-20', 'paid', 'advanced'),
(4, 4, 4, 2026, '2026-01-20', 'paid', 'advanced'),
(4, 4, 5, 2026, '2026-01-20', 'paid', 'advanced'),
(4, 4, 6, 2026, '2026-01-20', 'paid', 'advanced');

-- Carlos Rodriguez (ID: 5) - Budokon and Yoga Unlimited (plan_id: 5) - ACTIVE
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(5, 5, 9, 2025, '2025-09-20', 'paid', 'monthly'),
(5, 5, 10, 2025, '2025-10-20', 'paid', 'monthly'),
(5, 5, 11, 2025, '2025-11-20', 'paid', 'monthly'),
(5, 5, 12, 2025, '2025-12-20', 'paid', 'monthly'),
(5, 5, 1, 2026, '2026-01-20', 'paid', 'monthly');

-- Sophia Chen (ID: 6) - All Unlimited (plan_id: 6) - ACTIVE
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(6, 6, 9, 2025, '2025-09-25', 'paid', 'monthly'),
(6, 6, 10, 2025, '2025-10-25', 'paid', 'monthly'),
(6, 6, 11, 2025, '2025-11-25', 'paid', 'monthly'),
(6, 6, 12, 2025, '2025-12-25', 'paid', 'monthly'),
(6, 6, 1, 2026, '2026-01-25', 'paid', 'monthly'),
(6, 6, 2, 2026, '2026-01-26', 'paid', 'advanced'),
(6, 6, 3, 2026, '2026-01-26', 'paid', 'advanced');

-- Lucas Martin (ID: 7) - Kids 1 class per week (plan_id: 7) - ACTIVE
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(7, 7, 9, 2025, '2025-09-28', 'paid', 'monthly'),
(7, 7, 10, 2025, '2025-10-28', 'paid', 'monthly'),
(7, 7, 11, 2025, '2025-11-28', 'paid', 'monthly'),
(7, 7, 12, 2025, '2025-12-28', 'paid', 'monthly'),
(7, 7, 1, 2026, '2026-01-28', 'paid', 'monthly');

-- Sofia Anderson (ID: 8) - Kids 2 classes per week (plan_id: 8) - ACTIVE
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(8, 8, 9, 2025, '2025-09-30', 'paid', 'monthly'),
(8, 8, 10, 2025, '2025-10-30', 'paid', 'monthly'),
(8, 8, 11, 2025, '2025-11-30', 'paid', 'monthly'),
(8, 8, 12, 2025, '2025-12-30', 'paid', 'monthly'),
(8, 8, 1, 2026, '2026-01-30', 'paid', 'monthly'),
(8, 8, 2, 2026, '2026-01-30', 'paid', 'advanced');

-- Michael Brown (ID: 9) - Kids Unlimited (plan_id: 9) - ACTIVE
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(9, 9, 9, 2025, '2025-09-01', 'paid', 'monthly'),
(9, 9, 10, 2025, '2025-10-01', 'paid', 'monthly'),
(9, 9, 11, 2025, '2025-11-01', 'paid', 'monthly'),
(9, 9, 12, 2025, '2025-12-01', 'paid', 'monthly'),
(9, 9, 1, 2026, '2026-01-01', 'paid', 'monthly'),
(9, 9, 2, 2026, '2026-01-15', 'paid', 'advanced'),
(9, 9, 3, 2026, '2026-01-15', 'paid', 'advanced');

-- Pending Students (1-2 months behind)
-- Robert Taylor (ID: 10) - BJJ Unlimited (plan_id: 3) - Last paid November 2025 (2 months behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(10, 3, 9, 2025, '2025-09-01', 'paid', 'monthly'),
(10, 3, 10, 2025, '2025-10-01', 'paid', 'monthly'),
(10, 3, 11, 2025, '2025-11-01', 'paid', 'monthly');

-- Ana Martinez (ID: 11) - 2 classes per week (plan_id: 2) - Last paid December 2025 (1 month behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(11, 2, 9, 2025, '2025-09-05', 'paid', 'monthly'),
(11, 2, 10, 2025, '2025-10-05', 'paid', 'monthly'),
(11, 2, 11, 2025, '2025-11-05', 'paid', 'monthly'),
(11, 2, 12, 2025, '2025-12-05', 'paid', 'monthly');

-- Inactive Students (3+ months behind)
-- James Davis (ID: 12) - MMA Unlimited (plan_id: 4) - Last paid August 2025 (5+ months behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(12, 4, 8, 2025, '2025-08-10', 'paid', 'monthly'),
(12, 4, 9, 2025, '2025-09-10', 'paid', 'monthly');

-- Olivia Lopez (ID: 13) - Kids 2 classes per week (plan_id: 8) - Last paid December 2025 (1 month behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(13, 8, 9, 2025, '2025-09-15', 'paid', 'monthly'),
(13, 8, 10, 2025, '2025-10-15', 'paid', 'monthly'),
(13, 8, 11, 2025, '2025-11-15', 'paid', 'monthly'),
(13, 8, 12, 2025, '2025-12-15', 'paid', 'monthly');

-- William Gonzalez (ID: 14) - 1 class per week (plan_id: 1) - Last paid October 2025 (3+ months behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(14, 1, 9, 2025, '2025-09-01', 'paid', 'monthly'),
(14, 1, 10, 2025, '2025-10-01', 'paid', 'monthly');

-- Isabella Perez (ID: 15) - Budokon and Yoga Unlimited (plan_id: 5) - Last paid September 2025 (4+ months behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(15, 5, 9, 2025, '2025-09-05', 'paid', 'monthly');

-- Daniel Sanchez (ID: 16) - All Unlimited (plan_id: 6) - Last paid July 2025 (6+ months behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(16, 6, 7, 2025, '2025-07-25', 'paid', 'monthly'),
(16, 6, 8, 2025, '2025-08-25', 'paid', 'monthly');

-- Mia Ramirez (ID: 17) - Kids 1 class per week (plan_id: 7) - Last paid October 2025 (3+ months behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source) VALUES 
(17, 7, 9, 2025, '2025-09-20', 'paid', 'monthly'),
(17, 7, 10, 2025, '2025-10-20', 'paid', 'monthly');

-- Trial students (NO PAYMENTS - came to try classes)
-- Liam Walker (ID: 18) - Trial, no payments yet
-- Ava Hall (ID: 19) - Trial, no payments yet  
-- Noah Young (ID: 20) - Trial, no payments yet

-- Display comprehensive summary
SELECT '=== DATABASE SEEDED SUCCESSFULLY ===' as message;
SELECT 'Disciplines:' as info, COUNT(*) as count FROM disciplines;
SELECT 'Plans:' as info, COUNT(*) as count FROM plans;
SELECT 'Students:' as info, COUNT(*) as count FROM students;
SELECT 'Payments:' as info, COUNT(*) as count FROM payments;

-- Show payment source distribution
SELECT '=== PAYMENT SOURCE DISTRIBUTION ===' as info;
SELECT source, COUNT(*) as count FROM payments GROUP BY source ORDER BY source;

-- Show plan usage distribution
SELECT '=== PLAN USAGE DISTRIBUTION ===' as info;
SELECT p.name as plan_name, p.type, COUNT(pa.id) as payment_count
FROM plans p
LEFT JOIN payments pa ON p.id = pa.plan_id
GROUP BY p.id, p.name, p.type
ORDER BY p.type, p.name;

-- Show student status distribution
SELECT '=== STUDENT STATUS DISTRIBUTION ===' as info;
SELECT 
    student_status,
    COUNT(*) as student_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM student_current_status
GROUP BY student_status
ORDER BY student_status;

-- Show trial students (no payments)
SELECT '=== TRIAL STUDENTS (NO PAYMENTS) ===' as info;
SELECT s.id, s.first_name, s.last_name, s.type, s.enrollment_date
FROM students s
LEFT JOIN payments p ON s.id = p.student_id
WHERE p.id IS NULL
ORDER BY s.enrollment_date DESC;
