export type TipoServicio = 'desfile' | 'produccion' | 'foto' | 'promo' | 'otro'
export type EstadoTrabajo = 'cobrado' | 'facturado' | 'pendiente'
export type MetodoPago = 'transferencia' | 'mercadopago' | 'efectivo'

export interface ModeloAsignada {
  id: string
  nombre: string
  cachet: number
}

export interface Trabajo {
  id: string
  cliente_id: string
  cliente: Cliente
  tipo: TipoServicio
  fecha: string
  monto_cobrado: number
  estado: EstadoTrabajo
  metodo_pago: MetodoPago
  notas?: string
  modelos: ModeloAsignada[]
  created_at?: string
}

export interface Cliente {
  id: string
  nombre: string
  activo: boolean
  created_at?: string
}

export interface TrabajoConGanancia extends Trabajo {
  total_cachets: number
  ganancia_neta: number
}

export interface ResumenTipoServicio {
  tipo: TipoServicio
  total_ingresado: number
  cantidad_trabajos: number
  ganancia_neta: number
}

export interface ClienteConEstadisticas extends Cliente {
  cantidad_trabajos: number
  total_generado: number
  ganancia_neta: number
}

// Helper para formatear montos en ARS
export function formatARS(monto: number): string {
  return `$ ${monto.toLocaleString('es-AR')}`
}

// Helper para formatear fechas
export function formatFecha(fecha: string): string {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Labels y colores por tipo de servicio
export const tipoServicioConfig: Record<TipoServicio, { label: string; icon: string; color: string }> = {
  desfile: { label: 'Desfile', icon: '🎭', color: '#E879F9' },
  produccion: { label: 'Producción', icon: '🎬', color: '#F97316' },
  foto: { label: 'Foto', icon: '📷', color: '#22D3EE' },
  promo: { label: 'Promo', icon: '📢', color: '#A3E635' },
  otro: { label: 'Otro', icon: '📋', color: '#94A3B8' },
}

export const estadoTrabajoConfig: Record<EstadoTrabajo, { label: string; color: string }> = {
  cobrado: { label: 'Cobrado', color: '#4ADE80' },
  facturado: { label: 'Facturado', color: '#60A5FA' },
  pendiente: { label: 'Pendiente', color: '#C9A96E' },
}

export const metodoPagoConfig: Record<MetodoPago, { label: string }> = {
  transferencia: { label: 'Transferencia' },
  mercadopago: { label: 'Mercado Pago' },
  efectivo: { label: 'Efectivo' },
}
