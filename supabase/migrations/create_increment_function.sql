CREATE OR REPLACE FUNCTION increment_counter(row_id int)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE user_limits 
  SET total_users = total_users + 1 
  WHERE id = row_id 
  RETURNING total_users;
$$; 