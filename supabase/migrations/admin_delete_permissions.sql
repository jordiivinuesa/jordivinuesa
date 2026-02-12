-- 1. Permitir que los administradores borren cualquier perfil
-- Usamos la función check_is_admin() que creamos antes para evitar recursión
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;

CREATE POLICY "Admins can delete any profile" 
ON public.profiles 
FOR DELETE 
USING (
  check_is_admin()
);

-- Nota: La tabla custom_foods ya tiene una política de "Admins can manage all custom foods"
-- que permite el borrado (FOR ALL).
