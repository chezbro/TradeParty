-- Create user_profiles table if it doesn't exist
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Create policy to allow users to read their own profile
create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

-- Create policy to allow admin to read all profiles
create policy "Admins can read all profiles"
  on public.user_profiles for select
  using (
    auth.uid() in (
      select id from public.user_profiles where role = 'admin'
    )
  );

-- Function to handle new user creation
create or replace function public.handle_new_user_profile()
returns trigger as $$
begin
  insert into public.user_profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile(); 