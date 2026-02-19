-- 1. Clean up potential misplaced triggers
-- Try to drop from public.users if it exists there erroneously
drop trigger if exists on_auth_user_created on public.users;

-- Drop from auth.users to ensure fresh start
drop trigger if exists on_auth_user_created on auth.users;

-- 2. Clean up function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name', 
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

-- 3. Re-create Trigger on AUTH.USERS (Crucial step)
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Verify/Fix public.users table schema (if needed)
-- We can't easily alter columns if they have data, but we can try to ensure types.
-- Ignoring for now as DROP/CREATE is too destructive. 
-- Assuming public.users.id is UUID.

-- 5. Backfill any missing users from auth.users (Just in case)
INSERT INTO public.users (id, email, name, avatar_url)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'name', 
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
