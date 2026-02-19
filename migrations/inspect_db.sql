-- Inspect triggers on users table
select event_object_table, trigger_name, action_statement 
from information_schema.triggers 
where event_object_table = 'users' or event_object_table = 'auth.users';

-- Inspect columns of users table to check for unexpected bigint
select table_name, column_name, data_type 
from information_schema.columns 
where table_name = 'users';
