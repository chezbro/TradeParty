create table meetings (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_by uuid references auth.users(id),
  call_id text not null unique,
  created_at timestamp with time zone default now(),
  scheduled_for timestamp with time zone,
  status text default 'scheduled' check (status in ('scheduled', 'active', 'completed', 'cancelled'))
);

-- Create RLS policies
alter table meetings enable row level security;

-- Allow any authenticated user to read meetings
create policy "Meetings are viewable by authenticated users"
  on meetings for select
  to authenticated
  using (true);

-- Allow users to create meetings
create policy "Users can create meetings"
  on meetings for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Allow users to update their own meetings
create policy "Users can update their own meetings"
  on meetings for update
  to authenticated
  using (auth.uid() = created_by); 