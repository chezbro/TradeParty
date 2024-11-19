-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Meetings are viewable by authenticated users" ON meetings;
DROP POLICY IF EXISTS "Users can create meetings" ON meetings;
DROP POLICY IF EXISTS "Users can update their own meetings" ON meetings;

-- Create or replace the table
DROP TABLE IF EXISTS meetings;
CREATE TABLE meetings (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_by text not null,
  call_id text not null unique,
  created_at timestamp with time zone default now(),
  starts_at timestamp with time zone,
  scheduled_for timestamp with time zone,
  status text default 'scheduled' check (status in ('scheduled', 'active', 'completed', 'cancelled'))
);

-- Disable RLS
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY; 