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
  
  // Get user profile from usuarios table
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (!usuario) {
    // If no profile exists, create a default one
    const defaultUsuario = {
      id: user.id,
      email: user.email || '',
      nombre: user.email?.split('@')[0] || 'Usuario',
      rol: 'administrativa' as const,
      created_at: new Date().toISOString(),
    }
    
    return <DashboardShell user={defaultUsuario}>{children}</DashboardShell>
  }
  
  return <DashboardShell user={usuario}>{children}</DashboardShell>
}
