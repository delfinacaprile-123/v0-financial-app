import { PageHeader } from '@/components/page-header'

export default function DashboardPage() {
  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Resumen general de todas las unidades de negocio"
      />
      
      <div className="grid grid-cols-3 gap-6">
        {/* Placeholder cards */}
        <div className="bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-xl p-6">
          <p className="text-[#888888] text-sm">Ingresos del mes</p>
          <p className="font-serif text-2xl text-[#E8E8E8] mt-2">$ 0</p>
        </div>
        <div className="bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-xl p-6">
          <p className="text-[#888888] text-sm">Egresos del mes</p>
          <p className="font-serif text-2xl text-[#E8E8E8] mt-2">$ 0</p>
        </div>
        <div className="bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-xl p-6">
          <p className="text-[#888888] text-sm">Balance</p>
          <p className="font-serif text-2xl text-[#C9A96E] mt-2">$ 0</p>
        </div>
      </div>
    </div>
  )
}
