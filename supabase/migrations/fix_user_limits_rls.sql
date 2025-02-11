-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Only system can update user limits" ON user_limits;

-- Create a new policy that allows service role to update
CREATE POLICY "Service role can update user limits"
  ON user_limits FOR UPDATE
  USING (auth.jwt()->>'role' = 'service_role');

-- Ensure everyone can still read
DROP POLICY IF EXISTS "Anyone can read user limits" ON user_limits;
CREATE POLICY "Anyone can read user limits"
  ON user_limits FOR SELECT
  USING (true); 