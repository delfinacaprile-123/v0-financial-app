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

export type TabCurso = 'todos' | 'activos' | 'atrasados' | 'bajas'
