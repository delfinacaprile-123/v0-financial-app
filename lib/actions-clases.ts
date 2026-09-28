'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============ MATERIAS (programa de clases) ============

export async function getMaterias() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('materias')
    .select('*')
    .order('numero_clase')

  if (error) throw error
  return data
}

export async function createMateria(formData: {
  numero_clase: number
  nombre: string
  profe: string
  salon: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('materias').insert(formData)

  if (error) throw error
  revalidatePath('/configuracion')
  revalidatePath('/clases')
}

export async function updateMateria(
  id: string,
  formData: {
    numero_clase?: number
    nombre?: string
    profe?: string
    salon?: string
  }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('materias').update(formData).eq('id', id)

  if (error) throw error
  revalidatePath('/configuracion')
  revalidatePath('/clases')
}

export async function deleteMateria(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('materias').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/configuracion')
  revalidatePath('/clases')
}

// ============ HORARIOS DE SABADO ============

export async function getHorariosSabado() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('horarios_sabado')
    .select('*, grupos_sabado(*)')
    .order('fecha', { ascending: false })

  if (error) throw error
  return data
}

export async function createHorarioSabado(formData: {
  fecha: string
  grupos: { nombre_grupo: string; numero_clase_inicio: number }[]
}) {
  const supabase = await createClient()

  const { data: horario, error: errorHorario } = await supabase
    .from('horarios_sabado')
    .insert({ fecha: formData.fecha })
    .select()
    .single()

  if (errorHorario) throw errorHorario

  if (formData.grupos.length > 0) {
    const { error: errorGrupos } = await supabase.from('grupos_sabado').insert(
      formData.grupos.map((g) => ({
        horario_id: horario.id,
        nombre_grupo: g.nombre_grupo,
        numero_clase_inicio: g.numero_clase_inicio,
      }))
    )

    if (errorGrupos) throw errorGrupos
  }

  revalidatePath('/clases')
  return horario
}

export async function deleteHorarioSabado(id: string) {
  const supabase = await createClient()
  // Los grupos se eliminan en cascada por la FK horario_id -> horarios_sabado(id)
  const { error } = await supabase.from('horarios_sabado').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/clases')
}
