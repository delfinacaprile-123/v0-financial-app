export interface Curso {
  id: string
  nombre: string
  precio_mensual: number
  activo: boolean
  created_at: string
}

export interface Alumno {
  id: string
  nombre: string
  tipo: 'normal' | 'beca' | 'descuento'
  descuento_pct: number
  monto_personalizado: number | null
  curso_id: string
  estado: 'activo' | 'atrasado' | 'baja'
  notas: string | null
  fecha_inscripcion: string
  es_reincorporacion: boolean
  fecha_baja: string | null
  tipo_baja: 'definitiva' | 'temporal' | null
  created_at: string
  // Joined data
  curso?: Curso
}

export interface PagoCurso {
  id: string
  alumno_id: string
  fecha_pago: string
  concepto: string
  monto: number
  metodo: 'transferencia' | 'mercadopago' | 'efectivo'
  mes_correspondiente: string
  registrado_por: string | null
  created_at: string
}

export type TipoSeguimiento = 'llamado' | 'mensaje' | 'visita' | 'otro'
export type ResultadoSeguimiento = 'no_contesta' | 'promete_volver' | 'no_vuelve' | 'vuelve' | 'otro'

export interface Seguimiento {
  id: string
  alumno_id: string
  tipo: TipoSeguimiento
  resultado: ResultadoSeguimiento
  notas: string | null
  quien: string
  fecha: string
  registrado_por: string | null
  created_at: string
}

export const tipoSeguimientoConfig: Record<TipoSeguimiento, { label: string }> = {
  llamado: { label: 'Llamado' },
  mensaje: { label: 'Mensaje' },
  visita: { label: 'Visita' },
  otro: { label: 'Otro' },
}

export const resultadoSeguimientoConfig: Record<ResultadoSeguimiento, { label: string }> = {
  no_contesta: { label: 'No contesta' },
  promete_volver: { label: 'Promete volver' },
  no_vuelve: { label: 'No vuelve' },
  vuelve: { label: 'Vuelve' },
  otro: { label: 'Otro' },
}

export type TabCurso = 'todos' | 'activos' | 'atrasados' | 'bajas' | 'resumen'
