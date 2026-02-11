-- Fix custom_foods RLS policies to prevent privilege escalation
-- This ensures users can ONLY modify/delete their OWN custom foods

-- Drop existing UPDATE and DELETE policies
DROP POLICY IF EXISTS "Users can update own custom foods" ON custom_foods;
DROP POLICY IF EXISTS "Users can delete own custom foods" ON custom_foods;

-- Recreate UPDATE policy with strict user_id check
-- USING clause: who can attempt the update (only resource owner)
-- WITH CHECK clause: what they can update to (must remain their user_id)
CREATE POLICY "Users can update own custom foods" 
  ON custom_foods 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Recreate DELETE policy with strict user_id check
-- Only the creator can delete their own foods
CREATE POLICY "Users can delete own custom foods" 
  ON custom_foods 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Verify policies are correctly applied
COMMENT ON POLICY "Users can update own custom foods" ON custom_foods IS 
  'Security fix: Prevents users from modifying foods created by others';
COMMENT ON POLICY "Users can delete own custom foods" ON custom_foods IS 
  'Security fix: Prevents users from deleting foods created by others';
