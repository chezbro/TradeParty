-- First drop ALL existing policies
DROP POLICY IF EXISTS "Meetings are viewable by authenticated users" ON meetings;
DROP POLICY IF EXISTS "Users can create meetings" ON meetings;
DROP POLICY IF EXISTS "Users can update their own meetings" ON meetings;
DROP POLICY IF EXISTS "Enable update for meeting creators" ON meetings;

-- Temporarily disable RLS
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;

-- Add missing call_id column
ALTER TABLE meetings 
ADD COLUMN call_id text NOT NULL UNIQUE;

-- Update created_by column type
ALTER TABLE meetings 
ALTER COLUMN created_by TYPE uuid USING created_by::uuid;

-- Re-enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Recreate the policies
-- Allow any authenticated user to read meetings
CREATE POLICY "Meetings are viewable by authenticated users"
  ON meetings FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to create meetings
CREATE POLICY "Users can create meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own meetings
CREATE POLICY "Users can update their own meetings"
  ON meetings FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);