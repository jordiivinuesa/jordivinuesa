-- Add unique constraint to workout_templates name per user
ALTER TABLE public.workout_templates
ADD CONSTRAINT workout_templates_name_user_id_key UNIQUE (name, user_id);
