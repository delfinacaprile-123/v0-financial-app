import { createClient } from '@/lib/supabase/server'

// Verifica que el usuario autenticado tenga rol admin.
// Devuelve true solo para admin; se usa para proteger las rutas de backup.
export async function esAdminActual(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()

  return data?.rol === 'admin'
}
