import { PageHeader } from '@/components/page-header'

export default function AgenciaPage() {
  return (
    <div>
      <PageHeader 
        title="Agencia" 
        description="Gestion de modelos y contratos de agencia"
        color="#8FB3C9"
      />
      
      <div className="bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-xl p-8 text-center">
        <p className="text-[#888888]">No hay modelos registradas</p>
      </div>
    </div>
  )
}
