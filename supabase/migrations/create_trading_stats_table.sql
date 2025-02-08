CREATE TABLE trading_stats (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  win_rate numeric,
  total_trades integer,
  profit_factor numeric,
  average_rr numeric,
  monthly_return numeric,
  meetings_hosted integer default 0,
  meetings_participated integer default 0,
  total_meeting_hours integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE trading_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Trading stats are viewable by everyone"
  ON trading_stats FOR SELECT
  USING (true);

CREATE POLICY "Users can update own trading stats"
  ON trading_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update meeting stats
CREATE OR REPLACE FUNCTION update_meeting_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update host stats
    UPDATE trading_stats
    SET meetings_hosted = meetings_hosted + 1
    WHERE user_id = NEW.created_by::uuid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for meetings table
CREATE TRIGGER meeting_stats_trigger
AFTER INSERT ON meetings
FOR EACH ROW
EXECUTE FUNCTION update_meeting_stats(); 