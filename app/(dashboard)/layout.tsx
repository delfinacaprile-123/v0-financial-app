import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard-shell'
import { getSolicitudesPendientesCount } from '@/lib/actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile and atrasados count in parallel
  const [{ data: usuario }, { count: atrasadosCount }] = await Promise.all([
    supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('alumnos')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'atrasado')
  ])

  // Default user if profile doesn't exist yet
  const defaultUsuario = {
    id: user.id,
    email: user.email || '',
    nombre: user.email?.split('@')[0] || 'Usuario',
    rol: 'administrativa' as const,
    created_at: new Date().toISOString(),
  }

  // Solo la admin (Maria) ve el badge de solicitudes de correccion pendientes
  const solicitudesCount =
    usuario?.rol === 'admin' ? await getSolicitudesPendientesCount() : 0

  return (
    <DashboardShell 
      user={usuario || defaultUsuario} 
      atrasadosCount={atrasadosCount || 0}
      solicitudesCount={solicitudesCount}
    >
      {children}
    </DashboardShell>
  )
}
