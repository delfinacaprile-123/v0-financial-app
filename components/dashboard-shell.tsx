'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { createClient } from '@/lib/supabase/client'
import type { Usuario } from '@/types/user'

interface DashboardShellProps {
  children: React.ReactNode
  user: Usuario
  atrasadosCount?: number
  solicitudesCount?: number
}

export function DashboardShell({ children, user, atrasadosCount = 0, solicitudesCount = 0 }: DashboardShellProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
  
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Sidebar user={user} onLogout={handleLogout} atrasadosCount={atrasadosCount} solicitudesCount={solicitudesCount} />
      <main className="ml-60 p-10 min-h-screen">
        {children}
      </main>
    </div>
  )
}
