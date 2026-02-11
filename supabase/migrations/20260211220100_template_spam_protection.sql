-- Add spam protection for shared templates
-- Limit users to 10 template shares per hour

-- Function to check share rate limit
CREATE OR REPLACE FUNCTION check_share_limit()
RETURNS TRIGGER AS $$
DECLARE
  share_count INTEGER;
BEGIN
  -- Count shares from this sender in the last hour
  SELECT COUNT(*) INTO share_count
  FROM shared_templates 
  WHERE sender_id = NEW.sender_id 
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- If limit exceeded, reject the share
  IF share_count >= 10 THEN
    RAISE EXCEPTION 'Share limit exceeded. You can only share 10 templates per hour.'
      USING ERRCODE = '23514'; -- check_violation
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce the limit
DROP TRIGGER IF EXISTS enforce_share_limit ON shared_templates;
CREATE TRIGGER enforce_share_limit
  BEFORE INSERT ON shared_templates
  FOR EACH ROW 
  EXECUTE FUNCTION check_share_limit();

COMMENT ON FUNCTION check_share_limit() IS 
  'Security: Prevents spam by limiting template shares to 10 per hour per user';
