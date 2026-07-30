import { PageHeader } from '@/components/page-header'
import { CursosClient } from '@/components/cursos/cursos-client'
import { getCursos, getAlumnos, getAllPagosCursos, getRolActual } from '@/lib/actions'
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

// Convierte "Mayo 2026" en un índice comparable (anio * 12 + mes). Devuelve null si no parsea.
const MESES_ES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
}

function mesCorrespondienteToIndex(value?: string | null): number | null {
  if (!value) return null
  const parts = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
  if (parts.length < 2) return null
  const mes = MESES_ES[parts[0]]
  const anio = parseInt(parts[1], 10)
  if (mes === undefined || Number.isNaN(anio)) return null
  return anio * 12 + mes
}

export default async function CursosPage() {
  const [cursosRaw, alumnosRaw, pagosRaw, rol] = await Promise.all([
    getCursos(),
    getAlumnos(),
    getAllPagosCursos(),
    getRolActual(),
  ])

  const cursos: Curso[] = (cursosRaw ?? []).map(mapCurso)

  // Índice del mes más reciente cubierto por un pago, por alumno
  const ultimoMesPagado = new Map<string, number>()
  for (const p of pagosRaw ?? []) {
    const idx = mesCorrespondienteToIndex(p.mes_correspondiente)
    if (idx === null) continue
    const prev = ultimoMesPagado.get(p.alumno_id)
    if (prev === undefined || idx > prev) ultimoMesPagado.set(p.alumno_id, idx)
  }

  // Mes actual como índice. Un alumno está "al día" si pagó el mes actual o el anterior
  // (es decir, tiene pago dentro de los últimos 2 meses); si no, está "atrasado".
  const now = new Date()
  const mesActualIndex = now.getFullYear() * 12 + now.getMonth()
  const umbralAlDia = mesActualIndex - 1

  const alumnos: Alumno[] = (alumnosRaw ?? []).map((a: any) => {
    const estadoBase = a.estado ?? 'activo'
    // Los alumnos dados de baja conservan su estado; el resto se deriva de los pagos.
    let estado = estadoBase
    if (estadoBase !== 'baja') {
      const ultimo = ultimoMesPagado.get(a.id)
      estado = ultimo !== undefined && ultimo >= umbralAlDia ? 'activo' : 'atrasado'
    }

    return {
      id: a.id,
      nombre: a.nombre,
      tipo: a.tipo ?? 'normal',
      descuento_pct: Number(a.descuento_pct) || 0,
      monto_personalizado: a.monto_personalizado != null ? Number(a.monto_personalizado) : null,
      curso_id: a.curso_id,
      estado,
      notas: a.notas ?? null,
      fecha_inscripcion: a.fecha_inscripcion,
      es_reincorporacion: a.es_reincorporacion ?? false,
      fecha_baja: a.fecha_baja ?? null,
      tipo_baja: a.tipo_baja ?? null,
      created_at: a.created_at,
      // La relación viene como `cursos` (nombre de la tabla); el tipo espera `curso`
      curso: a.cursos ? mapCurso(a.cursos) : undefined,
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cursos"
        description="Gestion de alumnos y pagos de cursos"
      />
      <CursosClient cursos={cursos} alumnos={alumnos} rol={rol} />
    </div>
  )
}
