-- Make post-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'post-images';

-- Drop old permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view post images" ON storage.objects;

-- Create RLS-aware SELECT policy for authenticated users
CREATE POLICY "Users can view images from accessible posts"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'post-images'
  AND (
    -- Owner can always access their own images
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Others can access if an accessible post references this image
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.image_url LIKE '%' || storage.filename(name) || '%'
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
  )
);