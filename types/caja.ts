export type TipoMovimiento = 'ingreso' | 'egreso' | 'transferencia'
export type PersonaCaja = 'secretaria' | 'mama'

// Categorias/etiquetas opcionales para clasificar y filtrar movimientos
export type CategoriaMovimiento = 'pago_profesores' | 'pago_cuotas' | 'el_social_tv'
export const CATEGORIA_LABELS: Record<CategoriaMovimiento, string> = {
  pago_profesores: 'Pago profesores',
  pago_cuotas: 'Pago cuotas',
  el_social_tv: 'El Social TV',
}

export interface Movimiento {
  id: string
  fecha: string
  tipo: TipoMovimiento
  descripcion: string
  monto: number
  enPoderDe: PersonaCaja
  // Etiqueta opcional (ej: "Pago profesores")
  categoria?: CategoriaMovimiento | null
  // Para transferencias
  de?: PersonaCaja
  para?: PersonaCaja
  // Metadata
  registradoPor: string
  created_at: string
}

export interface SaldoPersona {
  persona: PersonaCaja
  nombre: string
  saldo: number
  ultimoMovimiento?: Movimiento
}

export interface ResumenMensual {
  mes: string
  anio: number
  ingresos: number
  egresos: number
  transferencias: number
  saldoFinal: number
}
