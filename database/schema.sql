-- =========================
-- TABLE: students
-- =========================
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    type VARCHAR(6) NOT NULL CHECK (type IN ('adult', 'kids')),
    enrollment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE: disciplines
-- =========================
CREATE TABLE disciplines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

-- =========================
-- TABLE: plans
-- =========================
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price NUMERIC(8,2) NOT NULL,
    type VARCHAR(6) NOT NULL CHECK (type IN ('adult', 'kids')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE: payments
-- =========================
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id),
    plan_id INT NOT NULL REFERENCES plans(id),
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    payment_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'paid',
    source VARCHAR(20) DEFAULT 'monthly',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, month, year)
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_period ON payments(year, month);
