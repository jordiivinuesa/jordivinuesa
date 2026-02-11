
-- 1. Shared templates table
CREATE TABLE public.shared_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    template_data JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.shared_templates ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can view shared templates they sent or received"
    ON public.shared_templates
    FOR SELECT
    TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can share templates with others"
    ON public.shared_templates
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update the status of shared templates"
    ON public.shared_templates
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = receiver_id)
    WITH CHECK (status IN ('accepted', 'rejected'));

-- 4. Indexes
CREATE INDEX idx_shared_templates_sender_id ON public.shared_templates(sender_id);
CREATE INDEX idx_shared_templates_receiver_id ON public.shared_templates(receiver_id);
CREATE INDEX idx_shared_templates_status ON public.shared_templates(status);
