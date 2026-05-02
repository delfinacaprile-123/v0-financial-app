export interface UsuarioConfig {
  id: string
  nombre: string
  email: string
  rol: 'admin' | 'administrativa'
  created_at: string
}

export interface CursoConfig {
  id: string
  nombre: string
  precio_mensual: number
  activo: boolean
  alumnos_activos: number
}

export interface ClienteConfig {
  id: string
  nombre: string
  unidad: 'agencia' | 'social_tv'
  activo: boolean
  // For Agencia
  trabajos_count?: number
  // For Social TV
  monto_mensual?: number
  metodo_pago?: 'transferencia' | 'mercadopago' | 'efectivo'
}
