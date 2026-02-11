
-- Create workout_templates table
CREATE TABLE public.workout_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates" ON public.workout_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON public.workout_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.workout_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.workout_templates FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_workout_templates_updated_at
  BEFORE UPDATE ON public.workout_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create template_exercises table
CREATE TABLE public.template_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.template_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own template exercises" ON public.template_exercises FOR SELECT
  USING (EXISTS (SELECT 1 FROM workout_templates t WHERE t.id = template_exercises.template_id AND t.user_id = auth.uid()));
CREATE POLICY "Users can insert own template exercises" ON public.template_exercises FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM workout_templates t WHERE t.id = template_exercises.template_id AND t.user_id = auth.uid()));
CREATE POLICY "Users can update own template exercises" ON public.template_exercises FOR UPDATE
  USING (EXISTS (SELECT 1 FROM workout_templates t WHERE t.id = template_exercises.template_id AND t.user_id = auth.uid()));
CREATE POLICY "Users can delete own template exercises" ON public.template_exercises FOR DELETE
  USING (EXISTS (SELECT 1 FROM workout_templates t WHERE t.id = template_exercises.template_id AND t.user_id = auth.uid()));

-- Create template_sets table
CREATE TABLE public.template_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_exercise_id UUID NOT NULL REFERENCES public.template_exercises(id) ON DELETE CASCADE,
  set_index INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  weight NUMERIC NOT NULL DEFAULT 0
);

ALTER TABLE public.template_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own template sets" ON public.template_sets FOR SELECT
  USING (EXISTS (SELECT 1 FROM template_exercises te JOIN workout_templates t ON t.id = te.template_id WHERE te.id = template_sets.template_exercise_id AND t.user_id = auth.uid()));
CREATE POLICY "Users can insert own template sets" ON public.template_sets FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM template_exercises te JOIN workout_templates t ON t.id = te.template_id WHERE te.id = template_sets.template_exercise_id AND t.user_id = auth.uid()));
CREATE POLICY "Users can update own template sets" ON public.template_sets FOR UPDATE
  USING (EXISTS (SELECT 1 FROM template_exercises te JOIN workout_templates t ON t.id = te.template_id WHERE te.id = template_sets.template_exercise_id AND t.user_id = auth.uid()));
CREATE POLICY "Users can delete own template sets" ON public.template_sets FOR DELETE
  USING (EXISTS (SELECT 1 FROM template_exercises te JOIN workout_templates t ON t.id = te.template_id WHERE te.id = template_sets.template_exercise_id AND t.user_id = auth.uid()));
