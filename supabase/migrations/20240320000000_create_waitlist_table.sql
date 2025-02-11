create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected'))
);

-- Enable RLS
alter table public.waitlist enable row level security;

-- Create policy to allow anyone to insert
create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true); 