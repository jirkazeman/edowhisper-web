-- Create tables for EDO Whisper

-- Paro Records Table
CREATE TABLE IF NOT EXISTS paro_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  form_data JSONB NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Roles Table
CREATE TABLE IF NOT EXISTS ai_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE paro_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_roles ENABLE ROW LEVEL SECURITY;

-- Policies for paro_records
CREATE POLICY "Users can view all records" ON paro_records
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own records" ON paro_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records" ON paro_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records" ON paro_records
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for ai_roles
CREATE POLICY "Users can view all AI roles" ON ai_roles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own AI roles" ON ai_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI roles" ON ai_roles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI roles" ON ai_roles
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_paro_records_user_id ON paro_records(user_id);
CREATE INDEX IF NOT EXISTS idx_paro_records_timestamp ON paro_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_roles_user_id ON ai_roles(user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE paro_records;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_roles;
