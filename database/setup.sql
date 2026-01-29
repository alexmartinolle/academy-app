-- ==========================================================
-- COMPLETE DATABASE SETUP FOR OPTIMIZED STUDENT MANAGEMENT
-- ==========================================================
-- 
-- EXECUTION ORDER:
-- 1. views.sql (already exists - updated)
-- 2. indexes.sql (new)
-- 3. functions.sql (new)
-- 4. This setup file (initialization)
--
-- ==========================================================

-- =========================
-- Step 1: Create/Update Views
-- ==========================================================
-- Run: \i views.sql
-- This file has been updated with new views for pending payments

-- =========================
-- Step 2: Create Indexes
-- ==========================================================
-- Run: \i indexes.sql
-- Creates all necessary indexes for performance

-- =========================
-- Step 3: Create Functions and Triggers
-- ==========================================================
-- Run: \i functions.sql
-- Creates automatic status update functions

-- =========================
-- Step 4: Initialize Data
-- ==========================================================

-- Refresh all student statuses based on current payments
SELECT refresh_student_statuses();

-- Verify the setup
SELECT '=== SETUP VERIFICATION ===' as info;

-- Check student status distribution
SELECT 
    'Student Status Distribution' as description,
    student_status,
    COUNT(*) as count
FROM students 
GROUP BY student_status
UNION ALL
SELECT 
    'Pending Payments Count' as description,
    'pending' as student_status,
    get_pending_payments_count() as count
UNION ALL
SELECT 
    'Total Students' as description,
    'total' as student_status,
    COUNT(*) as count
FROM students;

-- Show top 3 pending students
SELECT '=== TOP 3 PENDING STUDENTS ===' as info;
SELECT * FROM get_top_pending_students(3);

-- Verify views are working
SELECT '=== VIEW VERIFICATION ===' as info;
SELECT 
    'student_current_status' as view_name,
    COUNT(*) as record_count
FROM student_current_status
UNION ALL
SELECT 
    'students_pending_payments' as view_name,
    COUNT(*) as record_count
FROM students_pending_payments
UNION ALL
SELECT 
    'students_complete_info' as view_name,
    COUNT(*) as record_count
FROM students_complete_info;

-- Performance check
SELECT '=== PERFORMANCE METRICS ===' as info;
SELECT 
    'Database Size (MB)' as metric,
    ROUND(pg_database_size(current_database()) / 1024 / 1024, 2) as value
UNION ALL
SELECT 
    'Total Students' as metric,
    COUNT(*)::text as value
FROM students
UNION ALL
SELECT 
    'Total Payments' as metric,
    COUNT(*)::text as value
FROM payments;

-- =========================
-- Step 5: Optional - Schedule Automatic Updates
-- ==========================================================
-- Uncomment the following if you want automatic daily updates:
-- 
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule(
--     'update-student-statuses',
--     '0 2 * * *',  -- Daily at 2 AM
--     'SELECT refresh_student_statuses();'
-- );

-- =========================
-- Step 6: Maintenance Commands
-- ==========================================================
-- Run these periodically for optimal performance:
-- ANALYZE students;
-- ANALYZE payments;
-- ANALYZE plans;
-- VACUUM ANALYZE students;
-- VACUUM ANALYZE payments;

SELECT '=== SETUP COMPLETE ===' as info;
SELECT 'Database is now optimized for student management!' as message;
