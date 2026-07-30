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

// Devuelve todos los pagos de cursos (solo campos necesarios) para calcular
// qué alumnos están al día vs. atrasados según el mes que cubre cada pago.
export async function getAllPagosCursos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pagos_cursos')
    .select('alumno_id, mes_correspondiente, fecha_pago')

  if (error) throw error
  return data
}

// ---- Seguimiento de alumnos (llamados, mensajes, visitas) ----
export async function getSeguimientos(alumno_id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('seguimiento_alumnos')
    .select('*')
    .eq('alumno_id', alumno_id)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createSeguimiento(formData: {
  alumno_id: string
  tipo: string
  resultado: string
  quien: string
  fecha: string
  notas?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('seguimiento_alumnos').insert({
    ...formData,
    registrado_por: user?.id,
  })

  if (error) throw error
  revalidatePath('/cursos')
}

// ============ AGENCIA ============

// Resuelve el id de la unidad de negocio 'Agencia' de forma determinista.
// Tolera nombres duplicados/variantes ('agencia' y 'Agencia') eligiendo siempre
// la misma fila (ordenada por id) para que lecturas y escrituras sean consistentes.
async function getUnidadAgenciaId(supabase: any): Promise<string | undefined> {
  const { data: unidades } = await supabase.from('unidades_negocio').select('id, nombre')
  const matches = (unidades ?? [])
    .filter((u: any) => u.nombre?.toLowerCase().replace(/[\s_]/g, '') === 'agencia')
    .sort((a: any, b: any) => String(a.id).localeCompare(String(b.id)))
  return matches[0]?.id
}

export async function getClientesAgencia() {
  const supabase = await createClient()
  const unidadId = await getUnidadAgenciaId(supabase)

  if (!unidadId) return []

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('unidad_negocio_id', unidadId)
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

// Crea un cliente de Agencia y devuelve su id
export async function createClienteAgencia(nombre: string): Promise<string> {
  const supabase = await createClient()
  const unidadId = await getUnidadAgenciaId(supabase)

  const { data, error } = await supabase
    .from('clientes')
    .insert({
      nombre,
      activo: true,
      tipo_cliente: 'no_fijo', // los clientes de agencia no son de cuota fija
      unidad_negocio_id: unidadId,
    })
    .select('id')
    .single()

  if (error) throw error
  revalidatePath('/agencia')
  return data.id
}

export async function createTrabajo(formData: {
  cliente_id: string
  tipo: string
  fecha: string
  monto_cobrado: number
  estado: string
  metodo: string
  notas?: string
  modelos: { nombre_modelo: string; cachet: number }[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const unidadId = await getUnidadAgenciaId(supabase)

  const { modelos, ...trabajoData } = formData

  const { data: trabajo, error } = await supabase
    .from('trabajos')
    .insert({
      ...trabajoData,
      unidad_negocio_id: unidadId,
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
  monto_cobrado?: number
  estado?: string
  metodo?: string
  notas?: string
  modelos?: { nombre_modelo: string; cachet: number }[]
}) {
  const supabase = await createClient()
  const { modelos, ...trabajoData } = formData

  const { error } = await supabase.from('trabajos').update(trabajoData).eq('id', id)
  if (error) throw error

  // Si se pasaron modelos, reemplazamos el set completo (borrar + insertar)
  if (modelos) {
    const { error: delError } = await supabase
      .from('modelos_trabajo')
      .delete()
      .eq('trabajo_id', id)
    if (delError) throw delError

    if (modelos.length > 0) {
      const { error: insError } = await supabase
        .from('modelos_trabajo')
        .insert(modelos.map(m => ({ ...m, trabajo_id: id })))
      if (insError) throw insError
    }
  }

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

// Devuelve los clientes ACTIVOS de Social TV que NO tienen registrado el pago
// mensual del mes/año indicado. Tolera la unidad duplicada ('social_tv' / 'Social TV')
// y el formato inconsistente del campo `mes` ("2026-07" o "07").
export async function getClientesTVSinPago(mes: number, anio: number) {
  const supabase = await createClient()

  // Resolver la(s) unidad(es) de Social TV
  const { data: unidades } = await supabase.from('unidades_negocio').select('id, nombre')
  const unidadIds = (unidades ?? [])
    .filter((u: any) => u.nombre?.toLowerCase().replace(/[\s_]/g, '') === 'socialtv')
    .map((u: any) => u.id)

  if (unidadIds.length === 0) return []

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nombre')
    .in('unidad_negocio_id', unidadIds)
    .eq('activo', true)
    .order('nombre')

  if (!clientes || clientes.length === 0) return []

  // Pagos mensuales (no extraordinarios) pagados del año indicado
  const { data: pagos } = await supabase
    .from('pagos_social_tv')
    .select('cliente_id, mes, monto_extra, pagado')
    .eq('anio', anio)
    .eq('pagado', true)

  const mm = String(mes).padStart(2, '0')
  const clientesPagados = new Set(
    (pagos ?? [])
      .filter(
        (p: any) =>
          !(p.monto_extra && Number(p.monto_extra) > 0) &&
          String(p.mes).split('-').pop()!.padStart(2, '0') === mm
      )
      .map((p: any) => p.cliente_id)
  )

  return clientes.filter((c: any) => !clientesPagados.has(c.id))
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

  // El `mes` en la DB viene inconsistente ("2026-04" o "04"); comparamos por número de mes.
  const mm = String(mes).split('-').pop()!.padStart(2, '0')
  const mesNorm = `${anio}-${mm}`

  // Buscamos un pago MENSUAL existente (no extraordinario) para este cliente/anio/mes,
  // sin importar el formato en que esté guardado el `mes`.
  const { data: rows } = await supabase
    .from('pagos_social_tv')
    .select('id, mes, monto_extra')
    .eq('cliente_id', cliente_id)
    .eq('anio', anio)

  const existing = (rows ?? []).find(
    (r: any) =>
      !(r.monto_extra && Number(r.monto_extra) > 0) &&
      String(r.mes).split('-').pop()!.padStart(2, '0') === mm
  )

  if (existing) {
    const { error } = await supabase
      .from('pagos_social_tv')
      .update({
        mes: mesNorm,
        pagado,
        fecha_pago: pagado ? new Date().toISOString().split('T')[0] : null,
        metodo: pagado ? metodo : null,
      })
      .eq('id', existing.id)

    if (error) throw error
  } else {
    const { error } = await supabase.from('pagos_social_tv').insert({
      cliente_id,
      mes: mesNorm,
      anio,
      pagado,
      fecha_pago: pagado ? new Date().toISOString().split('T')[0] : null,
      metodo: pagado ? metodo : null,
      registrado_por: user?.id,
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

export async function updatePagoExtraordinario(id: string, formData: {
  cliente_id: string
  monto_extra: number
  descripcion_extra: string
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('pagos_social_tv')
    .update({
      cliente_id: formData.cliente_id,
      monto_extra: formData.monto_extra,
      descripcion_extra: formData.descripcion_extra,
    })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/social-tv')
}

export async function deletePagoSocialTV(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('pagos_social_tv').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/social-tv')
}

// Forma del cliente de Social TV (UI) que mapeamos al esquema real de `clientes`
export interface ClienteTVInput {
  nombre: string
  // 'fijo' | 'no_fijo' (valores válidos del CHECK de clientes.tipo_cliente)
  tipo_cliente: string
  monto_mensual: number
  // En la UI es 'metodo_habitual' (transferencia | mercadopago | efectivo)
  metodo_default: string
  activo: boolean
}

// Resuelve el id de la unidad de negocio 'Social TV' (tolera 'social_tv' / 'Social TV')
async function getUnidadSocialTVId(supabase: any): Promise<string | undefined> {
  const { data: unidades } = await supabase.from('unidades_negocio').select('id, nombre')
  const unidad = (unidades ?? []).find((u: any) =>
    u.nombre?.toLowerCase().replace(/[\s_]/g, '').includes('socialtv')
  )
  return unidad?.id
}

export async function createClienteTV(input: ClienteTVInput) {
  const supabase = await createClient()
  const unidadId = await getUnidadSocialTVId(supabase)

  const { error } = await supabase.from('clientes').insert({
    nombre: input.nombre,
    monto_mensual: input.monto_mensual,
    metodo_default: input.metodo_default,
    activo: input.activo,
    tipo_cliente: input.tipo_cliente || 'fijo',
    unidad_negocio_id: unidadId,
  })

  if (error) throw error
  revalidatePath('/social-tv')
}

export async function updateClienteTV(id: string, input: ClienteTVInput) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('clientes')
    .update({
      nombre: input.nombre,
      tipo_cliente: input.tipo_cliente || 'fijo',
      monto_mensual: input.monto_mensual,
      metodo_default: input.metodo_default,
      activo: input.activo,
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/social-tv')
}

export async function setClienteTVActivo(id: string, activo: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('clientes').update({ activo }).eq('id', id)
  if (error) throw error
  revalidatePath('/social-tv')
}

// ============ CAJA ============

export async function getMovimientosCaja(mes?: string, anio?: number) {
  const supabase = await createClient()
  let query = supabase
    .from('caja')
    .select('*')
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

// Normaliza cualquier valor de persona a los valores canónicos que acepta
// el CHECK de la columna `en_poder_de` ('secretaria' | 'mama').
// Tolera acentos, mayúsculas y etiquetas visibles (ej: 'María', 'Mamá', 'Secretaría').
function normalizePersona(value?: string | null): 'secretaria' | 'mama' {
  const normalized = (value ?? '')
    .normalize('NFD')              // separa los acentos de las letras
    .replace(/[\u0300-\u036f]/g, '') // elimina los diacríticos (tildes)
    .trim()
    .toLowerCase()

  if (normalized.startsWith('mam')) return 'mama'      // mama, mamá, maria/maría (mamá)
  if (normalized.startsWith('mar')) return 'mama'      // 'María' es la etiqueta de 'mama'
  return 'secretaria'
}

// Mapea la forma del cliente al esquema de la tabla `caja`
function mapMovimientoToRow(input: MovimientoInput) {
  const isTransfer = input.tipo === 'transferencia'
  // Para transferencias guardamos el ORIGEN en `en_poder_de`
  const personaCruda = isTransfer ? (input.de ?? input.enPoderDe) : input.enPoderDe
  return {
    tipo: isTransfer ? 'transferencia_interna' : input.tipo,
    monto: input.monto,
    en_poder_de: normalizePersona(personaCruda),
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

// ============ SOLICITUDES DE CORRECCION ============

// La rol 'administrativa' (Eugenia) no edita/elimina pagos directamente:
// crea una solicitud de correccion que la 'admin' (Maria) resuelve desde el Dashboard.
export async function createSolicitudCorreccion(formData: {
  descripcion: string
  modulo: string
  referencia?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('solicitudes_correccion').insert({
    descripcion: formData.descripcion,
    modulo: formData.modulo,
    referencia: formData.referencia ?? null,
    registrado_por: user?.id,
    estado: 'pendiente',
  })

  if (error) throw error
  revalidatePath('/dashboard')
}

export async function getSolicitudesPendientes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('solicitudes_correccion')
    .select('*, usuarios(nombre)')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function resolverSolicitudCorreccion(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('solicitudes_correccion')
    .update({ estado: 'resuelta' })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard')
}

// Devuelve el rol del usuario autenticado ('admin' | 'administrativa') o null.
export async function getRolActual(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()

  return data?.rol ?? null
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

// ============ GASTOS ============

export interface GastoInput {
  nombre: string
  categoria: 'sueldo' | 'impuesto' | 'gasto_fijo' | 'otro'
  monto: number
  frecuencia: 'mensual' | 'trimestral' | 'anual' | 'unico'
  metodo: 'debito_automatico' | 'transferencia' | 'efectivo' | 'tarjeta'
  fecha_pago: string
  mes_correspondiente?: string | null
  pagado?: boolean
  notas?: string | null
}

export async function getGastos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .order('fecha_pago', { ascending: false })

  if (error) throw error
  return data
}

export async function createGasto(input: GastoInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('gastos').insert({
    nombre: input.nombre,
    categoria: input.categoria,
    monto: input.monto,
    frecuencia: input.frecuencia,
    metodo: input.metodo,
    fecha_pago: input.fecha_pago,
    mes_correspondiente: input.mes_correspondiente ?? null,
    pagado: input.pagado ?? false,
    notas: input.notas ?? null,
    registrado_por: user?.id ?? null,
  })

  if (error) throw error
  revalidatePath('/gastos')
}

export async function updateGasto(id: string, input: GastoInput) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('gastos')
    .update({
      nombre: input.nombre,
      categoria: input.categoria,
      monto: input.monto,
      frecuencia: input.frecuencia,
      metodo: input.metodo,
      fecha_pago: input.fecha_pago,
      mes_correspondiente: input.mes_correspondiente ?? null,
      pagado: input.pagado ?? false,
      notas: input.notas ?? null,
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/gastos')
}

export async function toggleGastoPagado(id: string, pagado: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('gastos')
    .update({ pagado })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/gastos')
}

export async function deleteGasto(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('gastos').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/gastos')
}
