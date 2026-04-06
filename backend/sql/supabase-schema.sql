CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'ANALYST', 'VIEWER')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    type VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'Salary', 'Rent', 'Food', 'Transport', 'Utilities',
        'Freelance', 'Healthcare', 'Education', 'Entertainment',
        'Shopping', 'Investment', 'Other'
    )),
    record_date DATE NOT NULL,
    description TEXT,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_financial_records_user_id ON financial_records(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_type ON financial_records(type);
CREATE INDEX IF NOT EXISTS idx_financial_records_category ON financial_records(category);
CREATE INDEX IF NOT EXISTS idx_financial_records_date ON financial_records(record_date);
CREATE INDEX IF NOT EXISTS idx_financial_records_deleted ON financial_records(deleted);

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_records_updated_at BEFORE UPDATE ON financial_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed users (password = "admin123" for all)
INSERT INTO users (first_name, last_name, email, password, role, status) VALUES
('Admin',   'User', 'admin@finance.com',   '$2a$10$5c0846MIzIfSknmPZZVCEuSyHizzhVCyBiM.khqNvSaPYuJ9XTkMe', 'ADMIN',   'ACTIVE'),
('Analyst', 'User', 'analyst@finance.com', '$2a$10$5c0846MIzIfSknmPZZVCEuSyHizzhVCyBiM.khqNvSaPYuJ9XTkMe', 'ANALYST', 'ACTIVE'),
('Viewer',  'User', 'viewer@finance.com',  '$2a$10$5c0846MIzIfSknmPZZVCEuSyHizzhVCyBiM.khqNvSaPYuJ9XTkMe', 'VIEWER',  'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Seed financial records using subquery for safe user_id reference
INSERT INTO financial_records (user_id, amount, type, category, record_date, description)
SELECT u.id, v.amount, v.type, v.category, v.record_date::DATE, v.description
FROM users u
CROSS JOIN (VALUES
    ('admin@finance.com', 50000.00, 'INCOME',  'Salary',     '2026-01-01', 'January salary'),
    ('admin@finance.com', 15000.00, 'EXPENSE', 'Rent',       '2026-01-05', 'Monthly rent'),
    ('admin@finance.com',  3000.00, 'EXPENSE', 'Food',       '2026-01-10', 'Groceries'),
    ('admin@finance.com',  2000.00, 'EXPENSE', 'Transport',  '2026-01-15', 'Travel expenses'),
    ('admin@finance.com', 52000.00, 'INCOME',  'Salary',     '2026-02-01', 'February salary'),
    ('admin@finance.com', 15000.00, 'EXPENSE', 'Rent',       '2026-02-05', 'Monthly rent'),
    ('admin@finance.com',  8000.00, 'INCOME',  'Freelance',  '2026-02-15', 'Client project'),
    ('admin@finance.com',  2500.00, 'EXPENSE', 'Transport',  '2026-02-20', 'Travel expenses'),
    ('admin@finance.com',  4000.00, 'EXPENSE', 'Food',       '2026-02-22', 'Groceries + dining'),
    ('admin@finance.com', 50000.00, 'INCOME',  'Salary',     '2026-03-01', 'March salary'),
    ('admin@finance.com', 15000.00, 'EXPENSE', 'Rent',       '2026-03-05', 'Monthly rent'),
    ('admin@finance.com',  4500.00, 'EXPENSE', 'Utilities',  '2026-03-12', 'Electricity + internet'),
    ('admin@finance.com', 12000.00, 'INCOME',  'Freelance',  '2026-03-20', 'Design project'),
    ('admin@finance.com',  3200.00, 'EXPENSE', 'Food',       '2026-03-25', 'Dining out'),
    ('admin@finance.com',  5000.00, 'EXPENSE', 'Healthcare', '2026-03-28', 'Medical checkup'),
    ('admin@finance.com', 50000.00, 'INCOME',  'Salary',     '2026-04-01', 'April salary'),
    ('admin@finance.com', 15000.00, 'EXPENSE', 'Rent',       '2026-04-03', 'Monthly rent'),
    ('admin@finance.com',  6000.00, 'INCOME',  'Freelance',  '2026-04-04', 'Consulting work'),
    ('analyst@finance.com', 45000.00, 'INCOME',  'Salary',    '2026-01-01', 'January salary'),
    ('analyst@finance.com', 12000.00, 'EXPENSE', 'Rent',      '2026-01-05', 'Monthly rent'),
    ('analyst@finance.com',  2500.00, 'EXPENSE', 'Food',      '2026-01-12', 'Groceries'),
    ('analyst@finance.com', 45000.00, 'INCOME',  'Salary',    '2026-02-01', 'February salary'),
    ('analyst@finance.com', 12000.00, 'EXPENSE', 'Rent',      '2026-02-05', 'Monthly rent'),
    ('analyst@finance.com',  5000.00, 'INCOME',  'Freelance', '2026-02-18', 'Side project'),
    ('analyst@finance.com',  3000.00, 'EXPENSE', 'Shopping',  '2026-02-25', 'Clothing'),
    ('analyst@finance.com', 45000.00, 'INCOME',  'Salary',    '2026-03-01', 'March salary'),
    ('analyst@finance.com', 12000.00, 'EXPENSE', 'Rent',      '2026-03-05', 'Monthly rent'),
    ('analyst@finance.com',  2000.00, 'EXPENSE', 'Utilities', '2026-03-10', 'Bills')
) AS v(email, amount, type, category, record_date, description)
WHERE u.email = v.email;