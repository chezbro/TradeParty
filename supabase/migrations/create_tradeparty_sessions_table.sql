-- Create TradeParty sessions table
CREATE TABLE tradeparty_sessions (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid references meetings(id) on delete cascade,
  name text not null,
  created_by uuid references auth.users(id) on delete cascade,
  started_at timestamp with time zone default now(),
  ended_at timestamp with time zone,
  duration_minutes integer,
  participant_count integer default 0,
  charts_shared jsonb default '[]',
  trades_taken jsonb default '[]',
  participants jsonb default '[]',
  recording_url text,
  status text default 'completed' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE tradeparty_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "TradeParty sessions are viewable by participants"
  ON tradeparty_sessions FOR SELECT
  USING (
    auth.uid() = created_by OR
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(participants->'user_ids'))
  );

-- Create index for better query performance
CREATE INDEX idx_tradeparty_sessions_created_by ON tradeparty_sessions(created_by);
CREATE INDEX idx_tradeparty_sessions_started_at ON tradeparty_sessions(started_at); 