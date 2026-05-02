import { PageHeader } from '@/components/page-header'

export default function CursosPage() {
  return (
    <div>
      <PageHeader 
        title="Cursos" 
        description="Gestion de cursos y capacitaciones"
        color="#C9A96E"
      />
      
      <div className="bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-xl p-8 text-center">
        <p className="text-[#888888]">No hay cursos registrados</p>
      </div>
    </div>
  )
}
