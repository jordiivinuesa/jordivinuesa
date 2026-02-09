
-- Fix: Restrict follows SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can see follows" ON public.follows;

CREATE POLICY "Authenticated users can see follows"
ON public.follows
FOR SELECT
TO authenticated
USING (true);
