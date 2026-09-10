import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import Papa from 'papaparse'
import { createAdminClient } from '@/lib/supabase/admin'
import { esAdminActual } from '@/lib/backup/guard'
import { BACKUP_TABLES } from '@/lib/backup/tables'

export const dynamic = 'force-dynamic'

// Convierte strings vacios en null y deja el resto tal cual.
// Papa parsea todo como string; el upsert de Postgres castea los tipos.
function normalizarFila(fila: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(fila)) {
    out[k] = v === '' ? null : v
  }
  return out
}

// POST /api/backup/import  (multipart form-data con campo "file" = ZIP)
export async function POST(request: Request) {
  if (!(await esAdminActual())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No se recibio ningun archivo' }, { status: 400 })
  }

  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer())
  } catch {
    return NextResponse.json({ error: 'El archivo no es un ZIP valido' }, { status: 400 })
  }

  const admin = createAdminClient()
  const resumen: Record<string, number> = {}
  const errores: string[] = []

  // Importa en orden de dependencias (BACKUP_TABLES ya viene ordenado).
  for (const tabla of BACKUP_TABLES) {
    const entry = zip.file(`${tabla}.csv`)
    if (!entry) continue // el ZIP puede no traer todas las tablas

    const texto = await entry.async('string')
    const parsed = Papa.parse<Record<string, string>>(texto, {
      header: true,
      skipEmptyLines: true,
    })
    const filas = (parsed.data ?? []).map(normalizarFila)
    if (filas.length === 0) {
      resumen[tabla] = 0
      continue
    }

    // upsert por id: restaura sin duplicar si el registro ya existe.
    const { error } = await admin.from(tabla).upsert(filas, { onConflict: 'id' })
    if (error) {
      errores.push(`${tabla}: ${error.message}`)
    } else {
      resumen[tabla] = filas.length
    }
  }

  if (errores.length > 0) {
    return NextResponse.json(
      { error: 'Algunas tablas no se pudieron importar', detalles: errores, resumen },
      { status: 207 },
    )
  }

  return NextResponse.json({ ok: true, resumen })
}
