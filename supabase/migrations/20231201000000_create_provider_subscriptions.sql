-- Create provider_subscriptions table
CREATE TABLE provider_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  is_admin_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(provider_id, stripe_subscription_id)
);

-- Enable Row Level Security
ALTER TABLE provider_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for provider_subscriptions
CREATE POLICY "Providers can view their own subscriptions" 
ON provider_subscriptions FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM providers WHERE id = provider_id));

CREATE POLICY "Admins can manage all subscriptions"
ON provider_subscriptions FOR ALL 
USING (
  (SELECT is_super_admin FROM auth.users WHERE id = auth.uid()) = true
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_provider_subscriptions_modtime
BEFORE UPDATE ON provider_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
