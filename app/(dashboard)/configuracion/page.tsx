import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Check if user is admin
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()
  
  if (usuario?.rol !== 'admin') {
    redirect('/')
  }
  
  return (
    <div>
      <PageHeader 
        title="Configuracion" 
        description="Administracion del sistema"
        color="#C9A96E"
      />
      
      <div className="bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-xl p-8 text-center">
        <p className="text-[#888888]">Panel de configuracion del sistema</p>
      </div>
    </div>
  )
}
