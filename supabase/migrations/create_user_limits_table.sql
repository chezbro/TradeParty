CREATE TABLE user_limits (
  id SERIAL PRIMARY KEY,
  total_users BIGINT DEFAULT 0,
  max_users BIGINT DEFAULT 1000,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert initial record
INSERT INTO user_limits (total_users, max_users) VALUES (0, 1000);

-- Enable RLS
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the limits
CREATE POLICY "Anyone can read user limits" 
  ON user_limits FOR SELECT 
  USING (true);

-- Only allow system to update (using service role)
CREATE POLICY "Only system can update user limits" 
  ON user_limits FOR UPDATE 
  USING (false); 