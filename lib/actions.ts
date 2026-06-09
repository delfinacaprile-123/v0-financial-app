'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============ CURSOS ============

export async function getAlumnos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('alumnos')
    .select('*, cursos(*)')
    .order('nombre')
  
  if (error) throw error
  return data
}

export async function getCursos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cursos')
    .select('*')
    .order('nombre')
  
  if (error) throw error
  return data
}

export async function createAlumno(formData: {
  nombre: string
  tipo: string
  descuento_pct?: number
  monto_personalizado?: number
  curso_id: string
  notas?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('alumnos').insert(formData)
  
  if (error) throw error
  revalidatePath('/cursos')
}

export async function updateAlumno(id: string, formData: {
  nombre?: string
  tipo?: string
  descuento_pct?: number
  monto_personalizado?: number
  curso_id?: string
  estado?: string
  notas?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('alumnos').update(formData).eq('id', id)
  
  if (error) throw error
  revalidatePath('/cursos')
}

export async function darBajaAlumno(id: string, tipo_baja: 'definitiva' | 'temporal') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('alumnos')
    .update({ 
      estado: 'baja', 
      tipo_baja, 
      fecha_baja: new Date().toISOString().split('T')[0] 
    })
    .eq('id', id)
  
  if (error) throw error
  revalidatePath('/cursos')
}

export async function reincorporarAlumno(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('alumnos')
    .update({ 
      estado: 'activo', 
      es_reincorporacion: true,
      tipo_baja: null,
      fecha_baja: null
    })
    .eq('id', id)
  
  if (error) throw error
  revalidatePath('/cursos')
}

export async function registrarPagoCurso(formData: {
  alumno_id: string
  fecha_pago: string
  concepto: string
  monto: number
  metodo: string
  mes_correspondiente: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { error } = await supabase.from('pagos_cursos').insert({
    ...formData,
    registrado_por: user?.id
  })
  
  if (error) throw error
  revalidatePath('/cursos')
}

export async function getPagosCurso(alumno_id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pagos_cursos')
    .select('*')
    .eq('alumno_id', alumno_id)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// ============ AGENCIA ============

export async function getClientesAgencia() {
  const supabase = await createClient()
  const { data: unidad } = await supabase
    .from('unidades_negocio')
    .select('id')
    .eq('nombre', 'Agencia')
    .single()
  
  if (!unidad) return []
  
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('unidad_negocio_id', unidad.id)
    .order('nombre')
  
  if (error) throw error
  return data
}

export async function getTrabajos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('trabajos')
    .select('*, clientes(*), modelos_trabajo(*)')
    .order('fecha', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createTrabajo(formData: {
  cliente_id: string
  tipo: string
  fecha: string
  concepto?: string
  monto_cobrado: number
  estado: string
  notas?: string
  modelos: { nombre_modelo: string; cachet: number }[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: unidad } = await supabase
    .from('unidades_negocio')
    .select('id')
    .eq('nombre', 'Agencia')
    .single()
  
  const { modelos, ...trabajoData } = formData
  
  const { data: trabajo, error } = await supabase
    .from('trabajos')
    .insert({
      ...trabajoData,
      unidad_negocio_id: unidad?.id,
      registrado_por: user?.id
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Insert modelos
  if (modelos.length > 0 && trabajo) {
    const { error: modelosError } = await supabase
      .from('modelos_trabajo')
      .insert(modelos.map(m => ({ ...m, trabajo_id: trabajo.id })))
    
    if (modelosError) throw modelosError
  }
  
  revalidatePath('/agencia')
}

export async function updateTrabajo(id: string, formData: {
  cliente_id?: string
  tipo?: string
  fecha?: string
  concepto?: string
  monto_cobrado?: number
  estado?: string
  metodo?: string
  notas?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('trabajos').update(formData).eq('id', id)
  
  if (error) throw error
  revalidatePath('/agencia')
}

export async function deleteTrabajo(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('trabajos').delete().eq('id', id)
  
  if (error) throw error
  revalidatePath('/agencia')
}

// ============ SOCIAL TV ============

export async function getClientesSocialTV() {
  const supabase = await createClient()
  const { data: unidad } = await supabase
    .from('unidades_negocio')
    .select('id')
    .eq('nombre', 'Social TV')
    .single()
  
  if (!unidad) return []
  
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('unidad_negocio_id', unidad.id)
    .eq('activo', true)
    .order('nombre')
  
  if (error) throw error
  return data
}

export async function getPagosSocialTV(mes: string, anio: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pagos_social_tv')
    .select('*, clientes(*)')
    .eq('mes', mes)
    .eq('anio', anio)
  
  if (error) throw error
  return data
}

export async function togglePagoSocialTV(cliente_id: string, mes: string, anio: number, pagado: boolean, metodo?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if record exists
  const { data: existing } = await supabase
    .from('pagos_social_tv')
    .select('id')
    .eq('cliente_id', cliente_id)
    .eq('mes', mes)
    .eq('anio', anio)
    .single()
  
  if (existing) {
    const { error } = await supabase
      .from('pagos_social_tv')
      .update({ 
        pagado, 
        fecha_pago: pagado ? new Date().toISOString().split('T')[0] : null,
        metodo: pagado ? metodo : null
      })
      .eq('id', existing.id)
    
    if (error) throw error
  } else {
    const { error } = await supabase.from('pagos_social_tv').insert({
      cliente_id,
      mes,
      anio,
      pagado,
      fecha_pago: pagado ? new Date().toISOString().split('T')[0] : null,
      metodo: pagado ? metodo : null,
      registrado_por: user?.id
    })
    
    if (error) throw error
  }
  
  revalidatePath('/social-tv')
}

export async function createPagoExtraordinario(formData: {
  cliente_id: string
  mes: string
  anio: number
  monto_extra: number
  descripcion_extra: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { error } = await supabase.from('pagos_social_tv').insert({
    ...formData,
    pagado: true,
    fecha_pago: new Date().toISOString().split('T')[0],
    registrado_por: user?.id
  })
  
  if (error) throw error
  revalidatePath('/social-tv')
}

// ============ CAJA ============

export async function getMovimientosCaja(mes?: string, anio?: number) {
  const supabase = await createClient()
  let query = supabase
    .from('caja')
    .select('*, usuarios(*)')
    .order('fecha', { ascending: false })
  
  if (mes && anio) {
    const startDate = `${anio}-${mes.padStart(2, '0')}-01`
    const endDate = `${anio}-${mes.padStart(2, '0')}-31`
    query = query.gte('fecha', startDate).lte('fecha', endDate)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

// Forma que envía el cliente (componente Caja)
export interface MovimientoInput {
  tipo: 'ingreso' | 'egreso' | 'transferencia'
  monto: number
  enPoderDe: 'secretaria' | 'mama'
  de?: 'secretaria' | 'mama'
  para?: 'secretaria' | 'mama'
  descripcion?: string
  fecha: string
}

// Mapea la forma del cliente al esquema de la tabla `caja`
function mapMovimientoToRow(input: MovimientoInput) {
  const isTransfer = input.tipo === 'transferencia'
  return {
    tipo: isTransfer ? 'transferencia_interna' : input.tipo,
    monto: input.monto,
    // Para transferencias guardamos el ORIGEN en `en_poder_de`
    en_poder_de: isTransfer ? (input.de ?? input.enPoderDe) : input.enPoderDe,
    descripcion: input.descripcion ?? null,
    fecha: input.fecha,
  }
}

export async function createMovimientoCaja(input: MovimientoInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('caja').insert({
    ...mapMovimientoToRow(input),
    registrado_por: user?.id ?? null,
  })

  if (error) throw error
  revalidatePath('/caja')
}

export async function updateMovimientoCaja(id: string, input: MovimientoInput) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('caja')
    .update(mapMovimientoToRow(input))
    .eq('id', id)

  if (error) throw error
  revalidatePath('/caja')
}

export async function deleteMovimientoCaja(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('caja').delete().eq('id', id)
  
  if (error) throw error
  revalidatePath('/caja')
}

export async function getSaldosCaja() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('caja')
    .select('tipo, monto, en_poder_de')
  
  if (error) throw error
  
  // Calculate balances
  const saldos = { secretaria: 0, mama: 0 }
  
  data?.forEach(mov => {
    const monto = Number(mov.monto)
    if (mov.tipo === 'ingreso') {
      saldos[mov.en_poder_de as keyof typeof saldos] += monto
    } else if (mov.tipo === 'egreso') {
      saldos[mov.en_poder_de as keyof typeof saldos] -= monto
    } else if (mov.tipo === 'transferencia_interna') {
      // For transfers, money leaves one person and goes to the other
      const destino = mov.en_poder_de === 'secretaria' ? 'mama' : 'secretaria'
      saldos[mov.en_poder_de as keyof typeof saldos] -= monto
      saldos[destino] += monto
    }
  })
  
  return saldos
}

// ============ CONFIGURACION ============

export async function getUsuarios() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('nombre')
  
  if (error) throw error
  return data
}

export async function updateUsuario(id: string, formData: {
  nombre?: string
  rol?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('usuarios').update(formData).eq('id', id)
  
  if (error) throw error
  revalidatePath('/configuracion')
}

export async function updateCurso(id: string, formData: {
  nombre?: string
  precio_mensual?: number
  activo?: boolean
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('cursos').update(formData).eq('id', id)
  
  if (error) throw error
  revalidatePath('/configuracion')
  revalidatePath('/cursos')
}

export async function createCurso(formData: {
  nombre: string
  precio_mensual: number
  activo: boolean
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('cursos').insert(formData)
  
  if (error) throw error
  revalidatePath('/configuracion')
  revalidatePath('/cursos')
}

export async function createCliente(formData: {
  nombre: string
  unidad: 'Agencia' | 'Social TV'
  contacto?: string
  telefono?: string
  email?: string
  tipo_servicio?: string
  monto_mensual?: number
  activo: boolean
}) {
  const supabase = await createClient()
  
  const { data: unidad } = await supabase
    .from('unidades_negocio')
    .select('id')
    .eq('nombre', formData.unidad)
    .single()
  
  const { unidad: _, ...clienteData } = formData
  
  const { error } = await supabase.from('clientes').insert({
    ...clienteData,
    unidad_negocio_id: unidad?.id
  })
  
  if (error) throw error
  revalidatePath('/configuracion')
  revalidatePath('/agencia')
  revalidatePath('/social-tv')
}

export async function updateCliente(id: string, formData: {
  nombre?: string
  contacto?: string
  telefono?: string
  email?: string
  tipo_servicio?: string
  monto_mensual?: number
  activo?: boolean
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('clientes').update(formData).eq('id', id)
  
  if (error) throw error
  revalidatePath('/configuracion')
  revalidatePath('/agencia')
  revalidatePath('/social-tv')
}

export async function getAllClientes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*, unidades_negocio(*)')
    .order('nombre')
  
  if (error) throw error
  return data
}

// ============ DASHBOARD ============

export async function getDashboardStats() {
  const supabase = await createClient()
  
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentYear = new Date().getFullYear()
  
  const [
    { count: alumnosActivos },
    { data: pagosCursos },
    { data: trabajos },
    { data: pagosSocialTV },
    { data: movimientosCaja }
  ] = await Promise.all([
    supabase.from('alumnos').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),
    supabase.from('pagos_cursos').select('monto').gte('created_at', `${currentMonth}-01`),
    supabase.from('trabajos').select('monto_cobrado, estado').gte('fecha', `${currentMonth}-01`),
    supabase.from('pagos_social_tv').select('*, clientes(monto_mensual)').eq('mes', currentMonth.split('-')[1]).eq('anio', currentYear),
    supabase.from('caja').select('tipo, monto, en_poder_de')
  ])
  
  const totalCursos = pagosCursos?.reduce((sum, p) => sum + Number(p.monto), 0) || 0
  const totalAgencia = trabajos?.filter(t => t.estado === 'pagado').reduce((sum, t) => sum + Number(t.monto_cobrado), 0) || 0
  const totalSocialTV = pagosSocialTV?.filter(p => p.pagado).reduce((sum, p) => sum + Number(p.clientes?.monto_mensual || 0) + Number(p.monto_extra || 0), 0) || 0
  
  // Calculate caja balances
  const saldos = { secretaria: 0, mama: 0 }
  movimientosCaja?.forEach(mov => {
    const monto = Number(mov.monto)
    if (mov.tipo === 'ingreso') {
      saldos[mov.en_poder_de as keyof typeof saldos] += monto
    } else if (mov.tipo === 'egreso') {
      saldos[mov.en_poder_de as keyof typeof saldos] -= monto
    }
  })
  
  return {
    totalGeneral: totalCursos + totalAgencia + totalSocialTV,
    cursos: { total: totalCursos, alumnos: alumnosActivos || 0 },
    agencia: { total: totalAgencia, trabajos: trabajos?.length || 0 },
    socialTV: { total: totalSocialTV, clientes: pagosSocialTV?.length || 0 },
    caja: { secretaria: saldos.secretaria, mama: saldos.mama, total: saldos.secretaria + saldos.mama }
  }
}
