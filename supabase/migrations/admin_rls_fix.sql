-- 1. Crear función para verificar si es admin sin causar recursión
-- SECURITY DEFINER hace que la función se ejecute con los permisos del creador (bypass RLS)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Eliminar la política anterior que causaba el bucle
DROP POLICY IF EXISTS "Profiles are viewable by owners or admins" ON public.profiles;

-- 3. Crear la nueva política usando la función
CREATE POLICY "Profiles are viewable by owners or admins" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  check_is_admin()
);

-- 4. Asegurarnos de que tu usuario tiene el rol correcto (por si acaso)
UPDATE public.profiles 
SET role = 'admin' 
WHERE display_name ILIKE '%jordi%' 
   OR user_id = auth.uid(); -- También lo aplicamos a tu sesión actual
