-- ChurnAI Database Schema
-- Run: psql -U postgres -d churn_db -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'analyst' CHECK (role IN ('admin', 'analyst', 'viewer')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(50) UNIQUE NOT NULL,
    age INTEGER,
    gender VARCHAR(20),
    region VARCHAR(50),
    subscription_type VARCHAR(50),
    contract_type VARCHAR(50),
    tenure_months INTEGER,
    monthly_charges FLOAT,
    total_spending FLOAT,
    payment_method VARCHAR(50),
    login_frequency FLOAT,
    feature_usage_count INTEGER,
    session_time_avg FLOAT,
    last_login_days INTEGER,
    email_open_rate FLOAT,
    inactive_days INTEGER,
    support_tickets INTEGER,
    complaint_count INTEGER,
    refund_requests INTEGER,
    customer_satisfaction FLOAT,
    nps_score INTEGER,
    predicted_ltv FLOAT,
    risk_score FLOAT,
    churn_label BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_risk ON customers(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_customers_churn ON customers(churn_label);

-- Predictions
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(50) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    churn_probability FLOAT NOT NULL,
    risk_score FLOAT NOT NULL,
    risk_category VARCHAR(20) NOT NULL,
    shap_values JSONB,
    top_risk_factors JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_customer ON predictions(customer_id);

-- Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(50) NOT NULL,
    strategy VARCHAR(255) NOT NULL,
    rationale TEXT,
    priority VARCHAR(20),
    estimated_revenue_saved FLOAT,
    estimated_churn_reduction FLOAT,
    action_items JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drift reports
CREATE TABLE IF NOT EXISTS drift_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(50) NOT NULL,
    feature_name VARCHAR(100),
    drift_score FLOAT,
    drift_detected BOOLEAN DEFAULT FALSE,
    test_name VARCHAR(100),
    report_data JSONB,
    model_version VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
