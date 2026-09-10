import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import Papa from 'papaparse'
import { createAdminClient } from '@/lib/supabase/admin'
import { esAdminActual } from '@/lib/backup/guard'
import { BACKUP_TABLES, nombreArchivoBackup } from '@/lib/backup/tables'

export const dynamic = 'force-dynamic'

// GET /api/backup/export -> descarga un ZIP con un CSV por tabla.
export async function GET() {
  if (!(await esAdminActual())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const admin = createAdminClient()
  const zip = new JSZip()

  for (const tabla of BACKUP_TABLES) {
    const { data, error } = await admin.from(tabla).select('*')
    if (error) {
      return NextResponse.json(
        { error: `Error al leer la tabla ${tabla}: ${error.message}` },
        { status: 500 },
      )
    }
    // Papa.unparse maneja el escape de comas, comillas y saltos de linea.
    // Si la tabla esta vacia, igual generamos el CSV (vacio) para dejar constancia.
    const csv = Papa.unparse(data ?? [], { header: true })
    zip.file(`${tabla}.csv`, csv)
  }

  const buffer = await zip.generateAsync({ type: 'nodebuffer' })

  return new NextResponse(buffer as any, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${nombreArchivoBackup()}"`,
      'Cache-Control': 'no-store',
    },
  })
}
