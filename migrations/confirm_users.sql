-- Confirm all users (Bypass email verification for local/testing)
update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;
