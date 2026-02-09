-- Replace search_public_profiles with a sanitized version that escapes ILIKE wildcards
CREATE OR REPLACE FUNCTION public.search_public_profiles(
  search_query text,
  exclude_user_id uuid,
  result_limit integer DEFAULT 20
)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sanitized_query text;
BEGIN
  -- Validate input length
  IF search_query IS NULL OR LENGTH(TRIM(search_query)) < 2 OR LENGTH(search_query) > 100 THEN
    RETURN;
  END IF;

  -- Escape ILIKE special characters (% and _) to prevent wildcard injection
  sanitized_query := REPLACE(REPLACE(TRIM(search_query), '%', '\%'), '_', '\_');

  RETURN QUERY
  SELECT p.user_id, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE p.display_name ILIKE '%' || sanitized_query || '%' ESCAPE '\'
    AND p.user_id <> exclude_user_id
  LIMIT LEAST(result_limit, 50);
END;
$$;