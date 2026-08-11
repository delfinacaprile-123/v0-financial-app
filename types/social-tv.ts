export type TipoServicioTV = 'desfile' | 'produccion' | 'foto' | 'promo' | 'otro'
export type MetodoPagoTV = 'transferencia' | 'mercadopago' | 'efectivo'
export type TipoClienteTV = 'fijo' | 'no_fijo'

export interface ClienteTV {
  id: string
  nombre: string
  tipo_cliente: TipoClienteTV
  tipo_servicio: TipoServicioTV
  monto_mensual: number
  metodo_habitual: MetodoPagoTV
  activo: boolean
  created_at?: string
}

export interface PagoMensualTV {
  id: string
  cliente_id: string
  mes: string // formato: "2026-05"
  monto: number
  pagado: boolean
  fecha_pago?: string
  metodo_pago?: MetodoPagoTV
  created_at?: string
}

export interface PagoExtraordinarioTV {
  id: string
  cliente_id: string
  cliente_nombre?: string
  descripcion: string
  monto: number
  fecha: string
  metodo_pago: MetodoPagoTV
  created_at?: string
}

export interface ClienteTVConPago extends ClienteTV {
  pago_actual?: PagoMensualTV
}

export type CategoriaGastoTV = 'notas' | 'viaticos' | 'produccion' | 'grabacion_pisos'

export interface GastoSocialTV {
  id: string
  categoria: CategoriaGastoTV
  descripcion?: string | null
  monto: number
  fecha: string
  mes: number
  anio: number
  created_at?: string
}

export const categoriaGastoTVConfig: Record<CategoriaGastoTV, { label: string; color: string }> = {
  notas: { label: 'Notas', color: '#22D3EE' },
  viaticos: { label: 'Viáticos', color: '#A3E635' },
  produccion: { label: 'Producción', color: '#F97316' },
  grabacion_pisos: { label: 'Grabación de pisos', color: '#E879F9' },
}

export interface ResumenTipoServicioTV {
  tipo: TipoServicioTV
  total_ingresado: number
  cantidad_clientes: number
  porcentaje: number
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

// Helper para obtener nombre del mes
export function getNombreMes(mes: string): string {
  const [year, month] = mes.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

// Labels y colores por tipo de servicio
export const tipoServicioTVConfig: Record<TipoServicioTV, { label: string; color: string }> = {
  desfile: { label: 'Desfile', color: '#E879F9' },
  produccion: { label: 'Producción', color: '#F97316' },
  foto: { label: 'Foto', color: '#22D3EE' },
  promo: { label: 'Promo', color: '#A3E635' },
  otro: { label: 'Otro', color: '#94A3B8' },
}

export const metodoPagoTVConfig: Record<MetodoPagoTV, { label: string }> = {
  transferencia: { label: 'Transferencia' },
  mercadopago: { label: 'Mercado Pago' },
  efectivo: { label: 'Efectivo' },
}

export const tipoClienteTVConfig: Record<TipoClienteTV, { label: string }> = {
  fijo: { label: 'Fijo' },
  no_fijo: { label: 'No fijo' },
}
