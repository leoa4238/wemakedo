-- Allow hosts to delete their own gatherings
create policy "Hosts can delete their own gatherings." on gatherings
  for delete using ( auth.uid() = host_id );
