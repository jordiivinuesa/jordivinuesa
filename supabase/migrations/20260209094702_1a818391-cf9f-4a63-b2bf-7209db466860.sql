-- Drop the overly permissive comment SELECT policy
DROP POLICY IF EXISTS "Users can view comments" ON public.post_comments;

-- Create a new policy that aligns comment visibility with post visibility
CREATE POLICY "Users can view comments on accessible posts"
ON public.post_comments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = post_comments.post_id
    AND (
      p.is_public = true
      OR p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.follows f
        WHERE f.follower_id = auth.uid()
        AND f.following_id = p.user_id
      )
    )
  )
);