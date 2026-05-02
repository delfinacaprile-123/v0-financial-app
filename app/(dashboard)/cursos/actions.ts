'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCursos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cursos')
    .select('*')
    .eq('activo', true)
    .order('nombre')
  
  if (error) throw error
  return data
}

export async function getAlumnos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('alumnos')
    .select('*, curso:cursos(*)')
    .order('nombre')
  
  if (error) throw error
  return data
}

export async function getAlumnoById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('alumnos')
    .select('*, curso:cursos(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getPagosByAlumno(alumnoId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pagos_cursos')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('fecha_pago', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createAlumno(formData: {
  nombre: string
  tipo: 'normal' | 'beca' | 'descuento'
  descuento_pct: number
  monto_personalizado: number | null
  curso_id: string
  notas: string | null
}) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('alumnos').insert({
    nombre: formData.nombre,
    tipo: formData.tipo,
    descuento_pct: formData.descuento_pct,
    monto_personalizado: formData.monto_personalizado,
    curso_id: formData.curso_id,
    notas: formData.notas,
    estado: 'activo',
    fecha_inscripcion: new Date().toISOString().split('T')[0],
  })
  
  if (error) throw error
  revalidatePath('/cursos', 'max')
}

export async function updateAlumno(
  id: string,
  formData: {
    nombre: string
    tipo: 'normal' | 'beca' | 'descuento'
    descuento_pct: number
    monto_personalizado: number | null
    curso_id: string
    notas: string | null
  }
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('alumnos')
    .update({
      nombre: formData.nombre,
      tipo: formData.tipo,
      descuento_pct: formData.descuento_pct,
      monto_personalizado: formData.monto_personalizado,
      curso_id: formData.curso_id,
      notas: formData.notas,
    })
    .eq('id', id)
  
  if (error) throw error
  revalidatePath('/cursos', 'max')
}

export async function darBajaAlumno(
  id: string,
  tipoBaja: 'definitiva' | 'temporal'
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('alumnos')
    .update({
      estado: 'baja',
      fecha_baja: new Date().toISOString().split('T')[0],
      tipo_baja: tipoBaja,
    })
    .eq('id', id)
  
  if (error) throw error
  revalidatePath('/cursos', 'max')
}

export async function reincorporarAlumno(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('alumnos')
    .update({
      estado: 'activo',
      fecha_baja: null,
      tipo_baja: null,
      es_reincorporacion: true,
    })
    .eq('id', id)
  
  if (error) throw error
  revalidatePath('/cursos', 'max')
}

export async function createPago(formData: {
  alumno_id: string
  fecha_pago: string
  concepto: string
  monto: number
  metodo: 'transferencia' | 'mercadopago' | 'efectivo'
  mes_correspondiente: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { error } = await supabase.from('pagos_cursos').insert({
    ...formData,
    registrado_por: user?.id,
  })
  
  if (error) throw error
  
  // Check if student should be updated to activo (was atrasado)
  const { data: alumno } = await supabase
    .from('alumnos')
    .select('estado')
    .eq('id', formData.alumno_id)
    .single()
  
  if (alumno?.estado === 'atrasado') {
    await supabase
      .from('alumnos')
      .update({ estado: 'activo' })
      .eq('id', formData.alumno_id)
  }
  
  revalidatePath('/cursos', 'max')
}

export async function getAlumnosAtrasados() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('alumnos')
    .select('id')
    .eq('estado', 'atrasado')
  
  if (error) return 0
  return data?.length || 0
}
