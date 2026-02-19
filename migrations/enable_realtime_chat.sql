-- Enable Realtime for chat_messages table
begin;
  -- Remove if already exists to avoid error (optional, but good practice)
  -- drop publication if exists supabase_realtime; 
  -- In Supabase, 'supabase_realtime' publication usually exists by default.
  -- We just need to add the table to it.
  
  alter publication supabase_realtime add table public.chat_messages;
commit;
