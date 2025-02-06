create table public.follows (
    id uuid default uuid_generate_v4() primary key,
    follower_id uuid references auth.users(id) on delete cascade,
    following_id uuid references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(follower_id, following_id)
);

-- Add RLS policies
alter table public.follows enable row level security;

create policy "Users can see who follows who"
    on follows for select
    to authenticated
    using (true);

create policy "Users can follow/unfollow"
    on follows for insert
    to authenticated
    using (follower_id = auth.uid());

create policy "Users can unfollow"
    on follows for delete
    to authenticated
    using (follower_id = auth.uid()); 