-- Complete Schema Fix: Convert BIGINT to UUID & Recreate Policies
-- Use this to fix "invalid input syntax for type bigint: 'NaN'" and "column used in policy" errors.

BEGIN;

-- 1. Drop ALL Policies (Dependencies) - Dynamic Approach to catch all names
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('users', 'gatherings', 'participations', 'chat_messages', 'comments', 'likes', 'gathering_applications')
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public."' || r.tablename || '"';
    END LOOP;
END $$;


-- 2. Drop Foreign Keys
ALTER TABLE public.gatherings DROP CONSTRAINT IF EXISTS gatherings_host_id_fkey;
ALTER TABLE public.participations DROP CONSTRAINT IF EXISTS participations_user_id_fkey;
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE public.gathering_applications DROP CONSTRAINT IF EXISTS gathering_applications_user_id_fkey;

-- 3. Clean up invalid data
DELETE FROM public.users WHERE id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
DELETE FROM public.participations WHERE user_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
DELETE FROM public.gatherings WHERE host_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 4. Alter Column Types to UUID
ALTER TABLE public.users ALTER COLUMN id TYPE uuid USING id::text::uuid;
ALTER TABLE public.gatherings ALTER COLUMN host_id TYPE uuid USING host_id::text::uuid;
ALTER TABLE public.participations ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE public.chat_messages ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE public.comments ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE public.likes ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE public.gathering_applications ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;

-- 5. Re-create Foreign Keys
ALTER TABLE public.gatherings ADD CONSTRAINT gatherings_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.participations ADD CONSTRAINT participations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.likes ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.gathering_applications ADD CONSTRAINT gathering_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 6. Re-create Policies
-- Users
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users only" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Gatherings
CREATE POLICY "Anyone can view gatherings." ON public.gatherings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create gatherings." ON public.gatherings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Hosts can update their own gatherings." ON public.gatherings FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete their own gatherings." ON public.gatherings FOR DELETE USING (auth.uid() = host_id);

-- Participations
CREATE POLICY "Anyone can view participations." ON public.participations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join gatherings." ON public.participations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own participation." ON public.participations FOR UPDATE USING (auth.uid() = user_id);

-- Chat
CREATE POLICY "Users can view messages of gatherings they belong to" ON public.chat_messages FOR SELECT USING (
    auth.uid() IN (SELECT host_id FROM public.gatherings WHERE id = gathering_id) OR
    auth.uid() IN (SELECT user_id FROM public.participations WHERE gathering_id = chat_messages.gathering_id AND status = 'joined')
);
CREATE POLICY "Users can send messages to gatherings they belong to" ON public.chat_messages FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT host_id FROM public.gatherings WHERE id = gathering_id) OR
    auth.uid() IN (SELECT user_id FROM public.participations WHERE gathering_id = chat_messages.gathering_id AND status = 'joined')
);

-- Community
CREATE POLICY "Public comments are viewable by everyone." ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments." ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete own comments." ON public.comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public likes are viewable by everyone." ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create likes." ON public.likes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete own likes." ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Applications
CREATE POLICY "Users can view own applications" ON public.gathering_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Hosts can view applications for their gatherings" ON public.gathering_applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.gatherings WHERE id = gathering_applications.gathering_id AND host_id = auth.uid())
);
CREATE POLICY "Authenticated users can apply" ON public.gathering_applications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can cancel own application" ON public.gathering_applications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Hosts can process applications" ON public.gathering_applications FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.gatherings WHERE id = gathering_applications.gathering_id AND host_id = auth.uid())
);

COMMIT;
