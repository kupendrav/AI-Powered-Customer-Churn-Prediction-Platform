CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'analyst' CHECK (role IN ('admin', 'analyst', 'viewer')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(50) UNIQUE NOT NULL,
  age INTEGER,
  gender VARCHAR(20),
  region VARCHAR(50),
  subscription_type VARCHAR(50),
  contract_type VARCHAR(50),
  tenure_months INTEGER,
  monthly_charges DOUBLE PRECISION,
  total_spending DOUBLE PRECISION,
  payment_method VARCHAR(50),
  login_frequency DOUBLE PRECISION,
  feature_usage_count INTEGER,
  session_time_avg DOUBLE PRECISION,
  last_login_days INTEGER,
  email_open_rate DOUBLE PRECISION,
  inactive_days INTEGER,
  support_tickets INTEGER,
  complaint_count INTEGER,
  refund_requests INTEGER,
  customer_satisfaction DOUBLE PRECISION,
  nps_score INTEGER,
  predicted_ltv DOUBLE PRECISION,
  risk_score DOUBLE PRECISION,
  churn_label BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(50) NOT NULL,
  model_version VARCHAR(50) NOT NULL,
  churn_probability DOUBLE PRECISION NOT NULL,
  risk_score DOUBLE PRECISION NOT NULL,
  risk_category VARCHAR(20) NOT NULL CHECK (risk_category IN ('low', 'medium', 'high')),
  shap_values JSONB,
  top_risk_factors JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(50) NOT NULL,
  strategy VARCHAR(255) NOT NULL,
  rationale TEXT,
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')),
  estimated_revenue_saved DOUBLE PRECISION,
  estimated_churn_reduction DOUBLE PRECISION,
  action_items JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.drift_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(50) NOT NULL,
  feature_name VARCHAR(100),
  drift_score DOUBLE PRECISION,
  drift_detected BOOLEAN NOT NULL DEFAULT FALSE,
  test_name VARCHAR(100),
  report_data JSONB,
  model_version VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON public.user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON public.customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_risk ON public.customers(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_customers_churn ON public.customers(churn_label);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_customer ON public.predictions(customer_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON public.predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_customer ON public.recommendations(customer_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON public.recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON public.recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drift_reports_created_at ON public.drift_reports(created_at DESC);

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TRIGGER predictions_updated_at
  BEFORE UPDATE ON public.predictions
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TRIGGER recommendations_updated_at
  BEFORE UPDATE ON public.recommendations
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TRIGGER drift_reports_updated_at
  BEFORE UPDATE ON public.drift_reports
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT role
  FROM public.user_profiles
  WHERE id = (SELECT auth.uid())
    AND is_active = TRUE
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT COALESCE(public.current_user_role() = 'admin', FALSE)
$$;

CREATE OR REPLACE FUNCTION public.current_user_can_write_churn_data()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT COALESCE(public.current_user_role() IN ('admin', 'analyst'), FALSE)
$$;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drift_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR public.current_user_is_admin());

CREATE POLICY "admins can insert profiles" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "admins can update profiles" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "admins can delete profiles" ON public.user_profiles
  FOR DELETE TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "authenticated users can read customers" ON public.customers
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "analysts can insert customers" ON public.customers
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_can_write_churn_data());

CREATE POLICY "analysts can update customers" ON public.customers
  FOR UPDATE TO authenticated
  USING (public.current_user_can_write_churn_data())
  WITH CHECK (public.current_user_can_write_churn_data());

CREATE POLICY "admins can delete customers" ON public.customers
  FOR DELETE TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "authenticated users can read predictions" ON public.predictions
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "analysts can insert predictions" ON public.predictions
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_can_write_churn_data());

CREATE POLICY "analysts can update predictions" ON public.predictions
  FOR UPDATE TO authenticated
  USING (public.current_user_can_write_churn_data())
  WITH CHECK (public.current_user_can_write_churn_data());

CREATE POLICY "admins can delete predictions" ON public.predictions
  FOR DELETE TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "authenticated users can read recommendations" ON public.recommendations
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "analysts can insert recommendations" ON public.recommendations
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_can_write_churn_data());

CREATE POLICY "analysts can update recommendations" ON public.recommendations
  FOR UPDATE TO authenticated
  USING (public.current_user_can_write_churn_data())
  WITH CHECK (public.current_user_can_write_churn_data());

CREATE POLICY "admins can delete recommendations" ON public.recommendations
  FOR DELETE TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "authenticated users can read drift reports" ON public.drift_reports
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "analysts can insert drift reports" ON public.drift_reports
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_can_write_churn_data());

CREATE POLICY "analysts can update drift reports" ON public.drift_reports
  FOR UPDATE TO authenticated
  USING (public.current_user_can_write_churn_data())
  WITH CHECK (public.current_user_can_write_churn_data());

CREATE POLICY "admins can delete drift reports" ON public.drift_reports
  FOR DELETE TO authenticated
  USING (public.current_user_is_admin());

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.customers, public.predictions, public.recommendations, public.drift_reports TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.customers, public.predictions, public.recommendations, public.drift_reports TO authenticated;
