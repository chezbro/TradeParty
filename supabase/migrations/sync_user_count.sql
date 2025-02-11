-- Reset the count to 0
UPDATE user_limits SET total_users = 0 WHERE id = 1;

-- Set the correct count based on existing users
WITH user_count AS (
  SELECT COUNT(*) as count 
  FROM auth.users
)
UPDATE user_limits 
SET 
  total_users = user_count.count,
  last_updated = NOW()
FROM user_count
WHERE user_limits.id = 1; 