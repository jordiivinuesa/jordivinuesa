-- Add user role system for admin privileges
-- This enables role-based access control (RBAC)

-- Create role enum type
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN role user_role NOT NULL DEFAULT 'user';

-- Create index for efficient role queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- Assign admin role to jordi
-- Try multiple methods to ensure we find the right user
UPDATE profiles 
SET role = 'admin' 
WHERE 
  display_name ILIKE '%jordi%'
  OR user_id IN (
    SELECT id FROM auth.users 
    WHERE email ILIKE '%jordi%' 
      OR raw_user_meta_data->>'display_name' ILIKE '%jordi%'
  );

-- Verify admin assignment
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
  
  IF admin_count = 0 THEN
    RAISE WARNING 'No admin users found. Please manually assign admin role.';
  ELSE
    RAISE NOTICE 'Successfully assigned admin role to % user(s)', admin_count;
  END IF;
END $$;

COMMENT ON TYPE user_role IS 'User role enum for RBAC';
COMMENT ON COLUMN profiles.role IS 'User role: user (default) or admin (full access)';
