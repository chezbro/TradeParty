CREATE TABLE user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  first_name text,
  last_name text,
  bio text,
  avatar_url text,
  twitter_url text,
  website_url text,
  linkedin_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id); 