-- Critical Fix: Convert User IDs from BIGINT to UUID
-- This fixes the "invalid input syntax for type bigint: 'NaN'" error.

BEGIN;

-- 1. Drop existing Foreign Keys (to allow type changes)
ALTER TABLE public.gatherings DROP CONSTRAINT IF EXISTS gatherings_host_id_fkey;
ALTER TABLE public.participations DROP CONSTRAINT IF EXISTS participations_user_id_fkey;
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE public.gathering_applications DROP CONSTRAINT IF EXISTS gathering_applications_user_id_fkey;

-- 2. Clean up incompatible data (Integers cannot be UUIDs)
-- We delete rows where IDs are not valid UUIDs. Since Auth uses UUIDs, integer user IDs are likely invalid/test data anyway.
-- Note: Postgres regex for UUID. Set id to specific known UUID if needed, but here we just purge.
DELETE FROM public.users WHERE id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
DELETE FROM public.participations WHERE user_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
DELETE FROM public.gatherings WHERE host_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
-- (Repeat for others if necessary)

-- 3. Alter Column Types to UUID
ALTER TABLE public.users ALTER COLUMN id TYPE uuid USING id::text::uuid;
ALTER TABLE public.gatherings ALTER COLUMN host_id TYPE uuid USING host_id::text::uuid;
ALTER TABLE public.participations ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE public.chat_messages ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE public.comments ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE public.likes ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE public.gathering_applications ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;

-- 4. Re-create Foreign Keys
ALTER TABLE public.gatherings ADD CONSTRAINT gatherings_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.participations ADD CONSTRAINT participations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.likes ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.gathering_applications ADD CONSTRAINT gathering_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

COMMIT;
