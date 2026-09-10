import { createClient } from '@supabase/supabase-js'

/**
 * Cliente con service role: evita RLS para poder respaldar/restaurar TODAS las
 * filas de todas las tablas. SOLO debe usarse en el servidor y detras de un
 * chequeo de rol admin. Nunca exponer la service role key al cliente.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
