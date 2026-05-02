export type TipoMovimiento = 'ingreso' | 'egreso' | 'transferencia'
export type PersonaCaja = 'secretaria' | 'mama'

export interface Movimiento {
  id: string
  fecha: string
  tipo: TipoMovimiento
  descripcion: string
  monto: number
  enPoderDe: PersonaCaja
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
