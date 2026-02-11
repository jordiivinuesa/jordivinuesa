
-- Add 'share' and 'comment' to notification_type enum
-- Note: we use COMMIT to ensure the type is updated before using it in triggers
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'share';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'comment';

-- Trigger function for shared templates
CREATE OR REPLACE FUNCTION public.notify_shared_template()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type)
  VALUES (NEW.receiver_id, NEW.sender_id, 'share');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE OR REPLACE TRIGGER on_template_shared
AFTER INSERT ON public.shared_templates
FOR EACH ROW EXECUTE FUNCTION public.notify_shared_template();
