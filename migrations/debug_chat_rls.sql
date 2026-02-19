-- Temporarily relax RLS to debug Realtime issue
drop policy if exists "Users can view messages of gatherings they belong to" on public.chat_messages;

create policy "Debug: Allow all authenticated to view"
  on public.chat_messages for select
  using ( auth.role() = 'authenticated' );
