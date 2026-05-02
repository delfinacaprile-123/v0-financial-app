import { DashboardShell } from '@/components/dashboard-shell'

// Mock user data for development
const mockUsuario = {
  id: 'mock-user-id',
  email: 'admin@nativamodels.com',
  nombre: 'Administrador',
  rol: 'admin' as const,
  created_at: new Date().toISOString(),
}

// Mock atrasados count
const mockAtrasadosCount = 3

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell user={mockUsuario} atrasadosCount={mockAtrasadosCount}>
      {children}
    </DashboardShell>
  )
}
