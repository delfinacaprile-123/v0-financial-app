import { PageHeader } from '@/components/page-header'
import { CursosClient } from '@/components/cursos/cursos-client'
import { getCursos, getAlumnos } from '@/lib/actions'
import type { Curso, Alumno } from '@/types/cursos'

export const dynamic = 'force-dynamic'

function mapCurso(c: any): Curso {
  return {
    id: c.id,
    nombre: c.nombre,
    precio_mensual: Number(c.precio_mensual) || 0,
    activo: c.activo ?? true,
    created_at: c.created_at,
  }
}

export default async function CursosPage() {
  const [cursosRaw, alumnosRaw] = await Promise.all([getCursos(), getAlumnos()])

  const cursos: Curso[] = (cursosRaw ?? []).map(mapCurso)

  const alumnos: Alumno[] = (alumnosRaw ?? []).map((a: any) => ({
    id: a.id,
    nombre: a.nombre,
    tipo: a.tipo ?? 'normal',
    descuento_pct: Number(a.descuento_pct) || 0,
    monto_personalizado: a.monto_personalizado != null ? Number(a.monto_personalizado) : null,
    curso_id: a.curso_id,
    estado: a.estado ?? 'activo',
    notas: a.notas ?? null,
    fecha_inscripcion: a.fecha_inscripcion,
    es_reincorporacion: a.es_reincorporacion ?? false,
    fecha_baja: a.fecha_baja ?? null,
    tipo_baja: a.tipo_baja ?? null,
    created_at: a.created_at,
    // La relación viene como `cursos` (nombre de la tabla); el tipo espera `curso`
    curso: a.cursos ? mapCurso(a.cursos) : undefined,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cursos"
        description="Gestion de alumnos y pagos de cursos"
      />
      <CursosClient cursos={cursos} alumnos={alumnos} />
    </div>
  )
}
