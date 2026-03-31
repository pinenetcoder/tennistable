-- Supabase SQL schema for Tennis Club Booking
-- Run this in the Supabase SQL editor

-- Bookings table
create table if not exists bookings (
  id uuid default gen_random_uuid() primary key,
  court_id integer not null check (court_id between 1 and 5),
  user_id uuid not null references auth.users(id),
  user_name text not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  created_at timestamptz default now()
);

-- Indexes for fast queries
create index if not exists idx_bookings_date_status on bookings (date, status);
create index if not exists idx_bookings_court_date on bookings (court_id, date, status);
create index if not exists idx_bookings_user on bookings (user_id, date desc);

-- Note: double-booking prevention is handled in application logic
-- since bookings can span variable durations (30min, 1h, 1.5h, etc.)
-- and overlap detection requires comparing start_time/end_time ranges.

-- Enable Row Level Security
alter table bookings enable row level security;

-- Anyone can read bookings (including anonymous users)
create policy "Bookings are viewable by everyone"
  on bookings for select
  to anon, authenticated
  using (true);

-- Users can only create their own bookings
create policy "Users can create own bookings"
  on bookings for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can only update their own bookings (cancel)
create policy "Users can update own bookings"
  on bookings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
