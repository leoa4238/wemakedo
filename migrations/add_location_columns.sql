-- Add latitude and longitude columns to gatherings table
ALTER TABLE public.gatherings ADD COLUMN latitude float8;
ALTER TABLE public.gatherings ADD COLUMN longitude float8;
