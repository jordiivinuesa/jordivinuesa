
-- Drop the recursive policy
DROP POLICY IF EXISTS "Profiles are viewable by owners or admins" ON public.profiles;

-- Ensure the security definer function exists (bypasses RLS)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate policy using the function (no recursion)
CREATE POLICY "Profiles are viewable by owners or admins" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  public.check_is_admin()
);
