-- =====================================================
-- 1. ENUM Types
-- =====================================================
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE student_type AS ENUM ('adult', 'kids');
CREATE TYPE student_status AS ENUM ('active', 'inactive', 'payment_pending');
CREATE TYPE plan_frequency AS ENUM ('1_week', '2_week', 'unlimited');
CREATE TYPE payment_method AS ENUM ('cash', 'transfer', 'card');
