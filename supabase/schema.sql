-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for generated love letters
create table letters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  content text,
  prompt_data jsonb,
  is_paid boolean default false,
  transaction_ref text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for letters
alter table letters enable row level security;

create policy "Users can view their own letters." on letters
  for select using (auth.uid() = user_id);

create policy "Users can insert their own letters." on letters
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own letters." on letters
  for update using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
