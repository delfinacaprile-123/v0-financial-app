'use client'

import { useMemo } from 'react'
import { GraduationCap, Users, CalendarDays, Receipt } from 'lucide-react'
import type { Curso, Alumno } from '@/types/cursos'

interface ResumenCursosProps {
  cursos: Curso[]
  alumnos: Alumno[]
}

interface ResumenCurso {
  id: string
  nombre: string
  alumnosActivos: number
  fechaInicio: Date | null
  cuotaActual: number
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// Cantidad de meses transcurridos desde la fecha de inicio (inclusive) = numero de cuota actual.
// Ej: inicio enero 2026, hoy agosto 2026 => cuota nº 8.
function calcularCuota(fechaInicio: Date | null): number {
  if (!fechaInicio) return 0
  const hoy = new Date()
  const meses =
    (hoy.getFullYear() - fechaInicio.getFullYear()) * 12 +
    (hoy.getMonth() - fechaInicio.getMonth())
  return Math.max(1, meses + 1)
}

export function ResumenCursos({ cursos, alumnos }: ResumenCursosProps) {
  const resumen = useMemo<ResumenCurso[]>(() => {
    return cursos
      .map((curso) => {
        const alumnosCurso = alumnos.filter((a) => a.curso_id === curso.id)
        const alumnosActivos = alumnosCurso.filter((a) => a.estado === 'activo').length

        // Fecha de inicio = inscripcion mas antigua del curso
        const fechas = alumnosCurso
          .map((a) => a.fecha_inscripcion)
          .filter(Boolean)
          .map((f) => new Date(f))
          .filter((d) => !isNaN(d.getTime()))
        const fechaInicio =
          fechas.length > 0
            ? new Date(Math.min(...fechas.map((d) => d.getTime())))
            : null

        return {
          id: curso.id,
          nombre: curso.nombre,
          alumnosActivos,
          fechaInicio,
          cuotaActual: calcularCuota(fechaInicio),
        }
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [cursos, alumnos])

  if (resumen.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card px-4 py-12 text-center text-muted-foreground">
        No hay cursos para mostrar.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resumen.map((curso) => (
        <div
          key={curso.id}
          className="rounded-xl border border-border/50 bg-card p-5 transition-colors hover:border-primary/40"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground text-balance">
              {curso.nombre}
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Alumnos activos:</span>
              <span className="font-medium text-foreground">{curso.alumnosActivos}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Inicio:</span>
              <span className="font-medium text-foreground">
                {curso.fechaInicio
                  ? capitalize(
                      curso.fechaInicio.toLocaleDateString('es-AR', {
                        month: 'long',
                        year: 'numeric',
                      })
                    )
                  : 'Sin inscripciones'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Cuota actual:</span>
              <span className="font-medium text-primary">
                {curso.cuotaActual > 0 ? `Nº ${curso.cuotaActual}` : '—'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
