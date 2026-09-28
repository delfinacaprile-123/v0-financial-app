// Logica de generacion del horario de los sabados.
// Cada grupo recibe 4 materias consecutivas del programa, empezando desde su
// numero_clase_inicio. Hay 4 turnos fijos; el sistema asigna los turnos de
// forma que ningun profe repita turno. Si hay conflicto, se corre el grupo
// al siguiente turno disponible.

import type { AsignacionTurno, GrupoSabado, Materia } from '@/types/clases'

export const TURNOS = ['9:00', '10:00', '11:00', '12:00'] as const

// Devuelve las 4 materias consecutivas del programa para un grupo, en orden.
// El programa se recorre ciclicamente si el numero de clase excede el total.
function materiasDelGrupo(numeroClaseInicio: number, materias: Materia[]): Materia[] {
  if (materias.length === 0) return []
  const ordenadas = [...materias].sort((a, b) => a.numero_clase - b.numero_clase)
  const total = ordenadas.length

  const indiceInicio = ordenadas.findIndex((m) => m.numero_clase === numeroClaseInicio)
  const desde = indiceInicio >= 0 ? indiceInicio : 0

  const resultado: Materia[] = []
  for (let i = 0; i < 4; i++) {
    resultado.push(ordenadas[(desde + i) % total])
  }
  return resultado
}

export function generarHorario(grupos: GrupoSabado[], materias: Materia[]): AsignacionTurno[] {
  const asignaciones: AsignacionTurno[] = []
  // profeOcupado[turno] = Set de profes ya asignados en ese turno
  const profeOcupadoPorTurno: Record<string, Set<string>> = {}
  for (const turno of TURNOS) profeOcupadoPorTurno[turno] = new Set()

  const gruposOrdenados = [...grupos].sort((a, b) => a.nombre_grupo.localeCompare(b.nombre_grupo))

  for (const grupo of gruposOrdenados) {
    const materiasGrupo = materiasDelGrupo(grupo.numero_clase_inicio, materias)

    // El grupo recorre sus 4 materias en los 4 turnos, en orden, pero si el profe
    // de la materia que le toca en un turno ya esta ocupado en ese turno,
    // se corre al siguiente turno disponible para ese profe.
    const turnosDisponibles = [...TURNOS]

    materiasGrupo.forEach((materia) => {
      let turnoAsignado: (typeof TURNOS)[number] | null = null
      let conflicto = false

      // Buscar el primer turno disponible (de los que quedan) donde el profe este libre
      for (const turno of turnosDisponibles) {
        if (!profeOcupadoPorTurno[turno].has(materia.profe)) {
          turnoAsignado = turno
          break
        }
      }

      // Si todos los turnos disponibles tienen a ese profe ocupado, se marca conflicto
      // y se usa el primer turno disponible igual (para no dejar el grupo sin horario).
      if (!turnoAsignado) {
        turnoAsignado = turnosDisponibles[0]
        conflicto = true
      }

      profeOcupadoPorTurno[turnoAsignado].add(materia.profe)
      turnosDisponibles.splice(turnosDisponibles.indexOf(turnoAsignado), 1)

      asignaciones.push({
        grupoId: grupo.id,
        nombreGrupo: grupo.nombre_grupo,
        hora: turnoAsignado,
        clase: materia.nombre,
        salon: materia.salon,
        profe: materia.profe,
        conflicto,
      })
    })
  }

  return asignaciones
}
