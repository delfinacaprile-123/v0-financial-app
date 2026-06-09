export type CategoriaGasto = 'sueldo' | 'impuesto' | 'gasto_fijo' | 'otro'
export type FrecuenciaGasto = 'mensual' | 'trimestral' | 'anual' | 'unico'
export type MetodoGasto = 'debito_automatico' | 'transferencia' | 'efectivo' | 'tarjeta'

export interface Gasto {
  id: string
  nombre: string
  categoria: CategoriaGasto
  monto: number
  frecuencia: FrecuenciaGasto
  metodo: MetodoGasto
  fecha_pago: string
  mes_correspondiente?: string | null
  pagado: boolean
  notas?: string | null
  registradoPor?: string
  created_at?: string
}

export const CATEGORIA_LABELS: Record<CategoriaGasto, string> = {
  sueldo: 'Sueldo',
  impuesto: 'Impuesto',
  gasto_fijo: 'Gasto fijo',
  otro: 'Otro',
}

export const FRECUENCIA_LABELS: Record<FrecuenciaGasto, string> = {
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  anual: 'Anual',
  unico: 'Único',
}

export const METODO_LABELS: Record<MetodoGasto, string> = {
  debito_automatico: 'Débito automático',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
}
