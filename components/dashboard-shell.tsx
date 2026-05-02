'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { createClient } from '@/lib/supabase/client'
import type { Usuario } from '@/types/user'

interface DashboardShellProps {
  children: React.ReactNode
  user: Usuario
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
  
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="ml-60 p-10 min-h-screen">
        {children}
      </main>
    </div>
  )
}
