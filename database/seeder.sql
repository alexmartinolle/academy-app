-- ==========================================================
-- DATABASE SEEDER FOR MARTIAL ARTS ACADEMY
-- ==========================================================

-- Clear existing data (in correct order to respect foreign keys)
DELETE FROM payments;
DELETE FROM students;
DELETE FROM plans;
DELETE FROM disciplines;

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
('Budokon Unlimited', 50.00, 'adult'),
('Yoga Unlimited', 50.00, 'adult'),
('All Unlimited', 98.00, 'adult');

-- Insert plans for kids
INSERT INTO plans (name, price, type) VALUES 
('1 class per week', 45.00, 'kids'),
('2 classes per week', 65.00, 'kids'),
('Unlimited', 75.00, 'kids');

-- Insert students (20 students with different statuses)
INSERT INTO students (first_name, last_name, email, type, enrollment_date) VALUES 
-- Active students (paid current month)
('John', 'Smith', 'john.smith@email.com', 'adult', '2023-01-15'),
('Maria', 'Garcia', 'maria.garcia@email.com', 'adult', '2023-02-20'),
('David', 'Johnson', 'david.j@email.com', 'adult', '2023-03-10'),
('Emma', 'Wilson', 'emma.w@email.com', 'adult', '2023-04-05'),
('Carlos', 'Rodriguez', 'carlos.r@email.com', 'adult', '2023-05-12'),
('Lucas', 'Martin', 'lucas.m@email.com', 'kids', '2023-06-18'),
('Sofia', 'Anderson', 'sofia.a@email.com', 'kids', '2023-07-22'),
('Michael', 'Brown', 'michael.b@email.com', 'adult', '2023-08-14'),

-- Pending students (1-2 months behind)
('Robert', 'Taylor', 'robert.t@email.com', 'adult', '2023-09-10'),
('Ana', 'Martinez', 'ana.m@email.com', 'adult', '2023-10-15'),
('James', 'Davis', 'james.d@email.com', 'adult', '2023-11-20'),
('Olivia', 'Lopez', 'olivia.l@email.com', 'kids', '2023-12-05'),

-- Inactive students (3+ months behind)
('William', 'Gonzalez', 'william.g@email.com', 'adult', '2023-01-08'),
('Isabella', 'Perez', 'isabella.p@email.com', 'adult', '2023-02-12'),
('Daniel', 'Sanchez', 'daniel.s@email.com', 'adult', '2023-03-25'),
('Mia', 'Ramirez', 'mia.r@email.com', 'kids', '2023-04-30'),

-- New students (recently enrolled)
('Alexander', 'Cruz', 'alexander.c@email.com', 'adult', '2024-08-15'),
('Emily', 'Torres', 'emily.t@email.com', 'adult', '2024-09-01'),
('Ethan', 'Flores', 'ethan.f@email.com', 'kids', '2024-09-10'),

-- Trial students (haven't paid yet)
('Liam', 'Walker', 'liam.w@email.com', 'adult', '2026-01-20'),
('Ava', 'Hall', 'ava.h@email.com', 'adult', '2026-01-22'),
('Noah', 'Young', 'noah.y@email.com', 'kids', '2026-01-25');

-- Insert payments for active students (up to date)
-- John Smith (ID: 1) - BJJ Unlimited - Active
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(1, 3, 6, 2024, '2024-06-01', 'paid'),
(1, 3, 7, 2024, '2024-07-01', 'paid'),
(1, 3, 8, 2024, '2024-08-01', 'paid'),
(1, 3, 9, 2024, '2024-09-01', 'paid'),
(1, 3, 10, 2024, '2024-10-01', 'paid'),
(1, 3, 11, 2024, '2024-10-15', 'paid'),
(1, 3, 12, 2024, '2024-10-15', 'paid'),
(1, 3, 1, 2025, '2024-10-20', 'paid');

-- Maria Garcia (ID: 2) - Yoga Unlimited - Active
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(2, 6, 6, 2024, '2024-06-05', 'paid'),
(2, 6, 7, 2024, '2024-07-05', 'paid'),
(2, 6, 8, 2024, '2024-08-05', 'paid'),
(2, 6, 9, 2024, '2024-09-05', 'paid'),
(2, 6, 10, 2024, '2024-10-05', 'paid'),
(2, 6, 11, 2024, '2024-10-10', 'paid');

-- David Johnson (ID: 3) - 2 classes per week - Active
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(3, 2, 6, 2024, '2024-06-10', 'paid'),
(3, 2, 7, 2024, '2024-07-10', 'paid'),
(3, 2, 8, 2024, '2024-08-10', 'paid'),
(3, 2, 9, 2024, '2024-09-10', 'paid'),
(3, 2, 10, 2024, '2024-10-10', 'paid'),
(3, 2, 11, 2024, '2024-10-12', 'paid'),
(3, 2, 12, 2024, '2024-10-12', 'paid');

-- Emma Wilson (ID: 4) - All Unlimited - Active
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(4, 7, 6, 2024, '2024-06-15', 'paid'),
(4, 7, 7, 2024, '2024-07-15', 'paid'),
(4, 7, 8, 2024, '2024-08-15', 'paid'),
(4, 7, 9, 2024, '2024-09-15', 'paid'),
(4, 7, 10, 2024, '2024-10-15', 'paid'),
(4, 7, 11, 2024, '2024-10-20', 'paid'),
(4, 7, 12, 2024, '2024-10-20', 'paid'),
(4, 7, 1, 2025, '2024-10-25', 'paid'),
(4, 7, 2, 2025, '2024-10-25', 'paid'),
(4, 7, 3, 2025, '2024-10-25', 'paid');

-- Carlos Rodriguez (ID: 5) - MMA Unlimited - Active
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(5, 4, 6, 2024, '2024-06-20', 'paid'),
(5, 4, 7, 2024, '2024-07-20', 'paid'),
(5, 4, 8, 2024, '2024-08-20', 'paid'),
(5, 4, 9, 2024, '2024-09-20', 'paid'),
(5, 4, 10, 2024, '2024-10-20', 'paid');

-- Lucas Martin (ID: 6) - Kids Unlimited - Active
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(6, 12, 6, 2024, '2024-06-25', 'paid'),
(6, 12, 7, 2024, '2024-07-25', 'paid'),
(6, 12, 8, 2024, '2024-08-25', 'paid'),
(6, 12, 9, 2024, '2024-09-25', 'paid'),
(6, 12, 10, 2024, '2024-10-25', 'paid'),
(6, 12, 11, 2024, '2024-10-26', 'paid');

-- Sofia Anderson (ID: 7) - Kids 2 classes per week - Active
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(7, 11, 6, 2024, '2024-06-28', 'paid'),
(7, 11, 7, 2024, '2024-07-28', 'paid'),
(7, 11, 8, 2024, '2024-08-28', 'paid'),
(7, 11, 9, 2024, '2024-09-28', 'paid'),
(7, 11, 10, 2024, '2024-10-28', 'paid');

-- Michael Brown (ID: 8) - 1 class per week - Active
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(8, 1, 6, 2024, '2024-06-30', 'paid'),
(8, 1, 7, 2024, '2024-07-30', 'paid'),
(8, 1, 8, 2024, '2024-08-30', 'paid'),
(8, 1, 9, 2024, '2024-09-30', 'paid'),
(8, 1, 10, 2024, '2024-10-30', 'paid');

-- Pending Students (1-2 months behind)
-- Robert Taylor (ID: 9) - Last paid August (2 months behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(9, 5, 6, 2024, '2024-06-01', 'paid'),
(9, 5, 7, 2024, '2024-07-01', 'paid'),
(9, 5, 8, 2024, '2024-08-01', 'paid');

-- Ana Martinez (ID: 10) - Last paid September (1 month behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(10, 2, 6, 2024, '2024-06-05', 'paid'),
(10, 2, 7, 2024, '2024-07-05', 'paid'),
(10, 2, 8, 2024, '2024-08-05', 'paid'),
(10, 2, 9, 2024, '2024-09-05', 'paid');

-- James Davis (ID: 11) - Last paid August (2 months behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(11, 3, 6, 2024, '2024-06-10', 'paid'),
(11, 3, 7, 2024, '2024-07-10', 'paid'),
(11, 3, 8, 2024, '2024-08-10', 'paid');

-- Olivia Lopez (ID: 12) - Last paid September (1 month behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(12, 10, 6, 2024, '2024-06-15', 'paid'),
(12, 10, 7, 2024, '2024-07-15', 'paid'),
(12, 10, 8, 2024, '2024-08-15', 'paid'),
(12, 10, 9, 2024, '2024-09-15', 'paid');

-- Inactive Students (3+ months behind)
-- William Gonzalez (ID: 13) - Last paid July (3+ months behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(13, 1, 6, 2024, '2024-06-01', 'paid'),
(13, 1, 7, 2024, '2024-07-01', 'paid');

-- Isabella Perez (ID: 14) - Last paid June (4+ months behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(14, 2, 6, 2024, '2024-06-05', 'paid');

-- Daniel Sanchez (ID: 15) - Last paid May (5+ months behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(15, 3, 5, 2024, '2024-05-10', 'paid'),
(15, 3, 6, 2024, '2024-06-10', 'paid');

-- Mia Ramirez (ID: 16) - Last paid July (3+ months behind)
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(16, 11, 6, 2024, '2024-06-20', 'paid'),
(16, 11, 7, 2024, '2024-07-20', 'paid');

-- New Students (recent payments)
-- Alexander Cruz (ID: 17) - Started August
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(17, 4, 8, 2024, '2024-08-15', 'paid'),
(17, 4, 9, 2024, '2024-09-15', 'paid'),
(17, 4, 10, 2024, '2024-10-15', 'paid');

-- Emily Torres (ID: 18) - Started September
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(18, 5, 9, 2024, '2024-09-01', 'paid'),
(18, 5, 10, 2024, '2024-10-01', 'paid');

-- Ethan Flores (ID: 19) - Started September
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(19, 12, 9, 2024, '2024-09-10', 'paid'),
(19, 12, 10, 2024, '2024-10-10', 'paid');

-- Future payments (3 months ahead)
-- Some students with advance payments
INSERT INTO payments (student_id, plan_id, month, year, payment_date, status) VALUES 
(1, 3, 2, 2025, '2024-10-20', 'paid'),
(1, 3, 3, 2025, '2024-10-20', 'paid'),
(4, 7, 4, 2025, '2024-10-25', 'paid'),
(4, 7, 5, 2025, '2024-10-25', 'paid'),
(6, 12, 12, 2024, '2024-10-26', 'paid'),
(6, 12, 1, 2025, '2024-10-26', 'paid'),
(6, 12, 2, 2025, '2024-10-26', 'paid');

-- Display summary
SELECT 'Database seeded successfully!' as message;
SELECT 'Disciplines:' as info, COUNT(*) as count FROM disciplines;
SELECT 'Plans:' as info, COUNT(*) as count FROM plans;
SELECT 'Students:' as info, COUNT(*) as count FROM students;
SELECT 'Payments:' as info, COUNT(*) as count FROM payments;

-- Show student status distribution
SELECT 
    student_status,
    COUNT(*) as student_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM student_current_status
GROUP BY student_status
ORDER BY student_status;
