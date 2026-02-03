-- =====================================================
-- 2. students table
-- =====================================================
CREATE TABLE students (
    id_student SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    type student_type NOT NULL,
    status student_status NOT NULL DEFAULT 'payment_pending',
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    cancellation_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enrollment_date_realistic CHECK (enrollment_date <= CURRENT_DATE + INTERVAL '1 day')
);

COMMENT ON TABLE students IS 'Registro maestro de estudiantes de la academia';

-- =====================================================
-- 3. modalities table
-- =====================================================
CREATE TABLE modalities (
    id_modality SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. plans table (IMMUTABLE)
-- =====================================================
CREATE TABLE plans (
    id_plan SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type student_type NOT NULL,
    frequency plan_frequency NOT NULL,
    monthly_price NUMERIC(10,2) NOT NULL CHECK (monthly_price > 0),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_plan UNIQUE (name, type, frequency, monthly_price)
);

COMMENT ON TABLE plans IS 'Catálogo de planes. INMUTABLE: cambios de precio crean nuevo registro';

-- =====================================================
-- 5. plan_modality table (many-to-many relationship)
-- =====================================================
CREATE TABLE plan_modality (
    id_plan INTEGER NOT NULL REFERENCES plans(id_plan) ON DELETE CASCADE,
    id_modality INTEGER NOT NULL REFERENCES modalities(id_modality) ON DELETE CASCADE,
    PRIMARY KEY (id_plan, id_modality),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. student_plan table (plan history)
-- =====================================================
CREATE TABLE student_plan (
    id_student_plan SERIAL PRIMARY KEY,
    id_student INTEGER NOT NULL REFERENCES students(id_student) ON DELETE CASCADE,
    id_plan INTEGER NOT NULL REFERENCES plans(id_plan) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

-- =====================================================
-- 7. payments table
-- =====================================================
CREATE TABLE payments (
    id_payment SERIAL PRIMARY KEY,
    id_student INTEGER NOT NULL REFERENCES students(id_student) ON DELETE CASCADE,
    id_plan INTEGER NOT NULL REFERENCES plans(id_plan) ON DELETE RESTRICT,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL CHECK (period_end >= period_start),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount > 0),
    payment_method payment_method NOT NULL,
    observations TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE payments IS 'Historial completo de pagos. NUNCA modificar, solo INSERT';
COMMENT ON COLUMN payments.total_amount IS 'Monto final incluyendo prorrateo. Nunca recalcular.';
