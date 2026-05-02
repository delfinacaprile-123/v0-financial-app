import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard-shell'

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
  
  if (!usuario) {
    // If no profile exists, create a default one
    const defaultUsuario = {
      id: user.id,
      email: user.email || '',
      nombre: user.email?.split('@')[0] || 'Usuario',
      rol: 'administrativa' as const,
      created_at: new Date().toISOString(),
    }
    
    return <DashboardShell user={defaultUsuario} atrasadosCount={atrasadosCount || 0}>{children}</DashboardShell>
  }
  
  return <DashboardShell user={usuario} atrasadosCount={atrasadosCount || 0}>{children}</DashboardShell>
}
