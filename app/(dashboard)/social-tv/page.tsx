import { PageHeader } from '@/components/page-header'

export default function SocialTVPage() {
  return (
    <div>
      <PageHeader 
        title="Social TV" 
        description="Gestion de contenido y redes sociales"
        color="#B09EC9"
      />
      
      <div className="bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-xl p-8 text-center">
        <p className="text-[#888888]">No hay contenido registrado</p>
      </div>
    </div>
  )
}
