import { PageHeader } from '@/components/page-header'
import { ClasesClient } from '@/components/clases/clases-client'
import { getHorariosSabado, getMaterias } from '@/lib/actions'
import type { HorarioSabado, Materia } from '@/types/clases'

export const dynamic = 'force-dynamic'

export default async function ClasesPage() {
  const [horariosRaw, materiasRaw] = await Promise.all([getHorariosSabado(), getMaterias()])

  const materias: Materia[] = (materiasRaw ?? []).map((m: any) => ({
    id: m.id,
    numero_clase: m.numero_clase,
    nombre: m.nombre,
    profe: m.profe,
    salon: m.salon,
    created_at: m.created_at,
  }))

  const horarios: HorarioSabado[] = (horariosRaw ?? []).map((h: any) => ({
    id: h.id,
    fecha: h.fecha,
    created_at: h.created_at,
    grupos_sabado: (h.grupos_sabado ?? []).map((g: any) => ({
      id: g.id,
      horario_id: g.horario_id,
      nombre_grupo: g.nombre_grupo,
      numero_clase_inicio: g.numero_clase_inicio,
      created_at: g.created_at,
    })),
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Clases" description="Organizacion de clases de los sabados" color="#7FC9A0" />
      <ClasesClient horarios={horarios} materias={materias} />
    </div>
  )
}
