// Tipos del modulo Clases: organizacion de clases de los sabados

export interface Materia {
  id: string
  numero_clase: number
  nombre: string
  profe: string
  salon: string
  created_at?: string
}

export interface GrupoSabado {
  id: string
  horario_id: string
  nombre_grupo: string
  numero_clase_inicio: number
  created_at?: string
}

export interface HorarioSabado {
  id: string
  fecha: string // 'YYYY-MM-DD'
  created_at?: string
  grupos_sabado?: GrupoSabado[]
}

// Un turno asignado a un grupo dentro del horario generado
export interface AsignacionTurno {
  grupoId: string
  nombreGrupo: string
  hora: string
  clase: string
  salon: string
  profe: string
  conflicto?: boolean
}
