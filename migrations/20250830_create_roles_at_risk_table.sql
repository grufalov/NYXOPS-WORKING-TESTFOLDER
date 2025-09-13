-- Create roles_at_risk table
CREATE TABLE IF NOT EXISTS roles_at_risk (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    req_id TEXT,
    practice TEXT NOT NULL,
    gcm TEXT,
    hiring_manager TEXT,
    recruiter TEXT,
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'monitoring' CHECK (status IN ('monitoring', 'escalated', 'resolved')),
    summary TEXT,
    open_date DATE NOT NULL DEFAULT CURRENT_DATE,
    my_input TEXT,
    team_lead_updates JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on roles_at_risk table
ALTER TABLE roles_at_risk ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own roles at risk
CREATE POLICY "Users can view own roles at risk" ON roles_at_risk FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own roles at risk
CREATE POLICY "Users can insert own roles at risk" ON roles_at_risk FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own roles at risk
CREATE POLICY "Users can update own roles at risk" ON roles_at_risk FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own roles at risk
CREATE POLICY "Users can delete own roles at risk" ON roles_at_risk FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_roles_at_risk_user_id ON roles_at_risk(user_id);
CREATE INDEX idx_roles_at_risk_created_at ON roles_at_risk(created_at);
CREATE INDEX idx_roles_at_risk_status ON roles_at_risk(status);
CREATE INDEX idx_roles_at_risk_risk_level ON roles_at_risk(risk_level);
CREATE INDEX idx_roles_at_risk_practice ON roles_at_risk(practice);
CREATE INDEX idx_roles_at_risk_open_date ON roles_at_risk(open_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_roles_at_risk_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_roles_at_risk_updated_at
    BEFORE UPDATE ON roles_at_risk
    FOR EACH ROW
    EXECUTE FUNCTION update_roles_at_risk_updated_at();
