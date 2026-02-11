-- 1. Añadir restricción UNIQUE al nombre
ALTER TABLE custom_foods ADD CONSTRAINT custom_foods_name_key UNIQUE (name);

-- 2. Actualizar políticas RLS
-- Permitir que TODOS vean todos los alimentos
DROP POLICY IF EXISTS "Users can view own custom foods" ON custom_foods;
CREATE POLICY "Everyone can view custom foods" ON custom_foods FOR SELECT USING (true);

-- Mantener la política de inserción (solo usuarios autenticados, y deben asignar su user_id)
-- "Users can insert own custom foods" ya existe: with check (auth.uid() = user_id)

-- 3. Crear índice para búsquedas por nombre (si no existe)
CREATE INDEX IF NOT EXISTS idx_custom_foods_name_search ON custom_foods(name);
