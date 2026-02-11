
-- Create shared_templates table
CREATE TABLE public.shared_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_data JSONB NOT NULL CHECK (
    template_data ? 'exercises' AND
    jsonb_typeof(template_data->'exercises') = 'array'
  ),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_templates ENABLE ROW LEVEL SECURITY;

-- Sender can insert shares
CREATE POLICY "Users can share templates"
ON public.shared_templates
FOR INSERT
WITH CHECK (auth.uid() = sender_id AND sender_id <> receiver_id);

-- Sender and receiver can view their shares
CREATE POLICY "Users can view own shares"
ON public.shared_templates
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Receiver can update status
CREATE POLICY "Receiver can update share status"
ON public.shared_templates
FOR UPDATE
USING (auth.uid() = receiver_id);

-- Sender can delete their shares
CREATE POLICY "Sender can delete shares"
ON public.shared_templates
FOR DELETE
USING (auth.uid() = sender_id);
