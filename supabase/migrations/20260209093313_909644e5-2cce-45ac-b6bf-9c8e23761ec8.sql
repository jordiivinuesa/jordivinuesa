
-- 1. Drop the overly permissive profiles SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- 2. Create restrictive policy: users can only read their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 3. Create a security definer function to fetch public profile fields for social features
CREATE OR REPLACE FUNCTION public.get_public_profiles(user_ids uuid[])
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE p.user_id = ANY(user_ids);
$$;

-- 4. Create a security definer function to search users by display name (for social search)
CREATE OR REPLACE FUNCTION public.search_public_profiles(search_query text, exclude_user_id uuid, result_limit int DEFAULT 20)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE p.display_name ILIKE '%' || search_query || '%'
    AND p.user_id <> exclude_user_id
  LIMIT result_limit;
$$;
