import { PageHeader } from '@/components/page-header'

export default function CajaPage() {
  return (
    <div>
      <PageHeader 
        title="Caja Nativa" 
        description="Gestion de ingresos y egresos generales"
        color="#C9A96E"
      />
      
      <div className="bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-xl p-8 text-center">
        <p className="text-[#888888]">No hay movimientos registrados</p>
      </div>
    </div>
  )
}
