
-- Function to check if a display_name is already taken (excluding current user)
CREATE OR REPLACE FUNCTION public.is_display_name_taken(check_name text, exclude_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE LOWER(TRIM(display_name)) = LOWER(TRIM(check_name))
      AND user_id <> exclude_user_id
  );
$$;
