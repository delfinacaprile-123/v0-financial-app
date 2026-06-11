import { PageHeader } from '@/components/page-header'
import { CajaClient } from '@/components/caja/caja-client'
import { getMovimientosCaja } from '@/lib/actions'
import type { Movimiento, TipoMovimiento, PersonaCaja } from '@/types/caja'

export const dynamic = 'force-dynamic'

// Normaliza el valor crudo de `en_poder_de` (DB) al slot interno PersonaCaja.
// Eugenia ES la secretaria, por eso cualquier variante de su nombre mapea a 'secretaria'.
// Tolera acentos y mayúsculas (ej: 'Eugenia', 'EUGENIA', 'Mamá').
function normalizePersona(value?: string | null): PersonaCaja {
  const normalized = (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

  if (normalized === 'secretaria' || normalized.startsWith('eugenia')) return 'secretaria'
  if (normalized === 'mama' || normalized.startsWith('mam')) return 'mama'
  // Por defecto, tratamos cualquier otro valor como la secretaria (Eugenia)
  return 'secretaria'
}

// Mapea una fila de la tabla `caja` (Supabase) al tipo `Movimiento` del cliente
function mapRowToMovimiento(row: any): Movimiento {
  const tipo: TipoMovimiento =
    row.tipo === 'transferencia_interna' ? 'transferencia' : (row.tipo as TipoMovimiento)

  // En la DB, para transferencias guardamos `en_poder_de` = origen (de)
  const enPoderDeRaw = normalizePersona(row.en_poder_de)
  let de: PersonaCaja | undefined
  let para: PersonaCaja | undefined
  let enPoderDe: PersonaCaja = enPoderDeRaw

  if (tipo === 'transferencia') {
    de = enPoderDeRaw
    para = enPoderDeRaw === 'secretaria' ? 'mama' : 'secretaria'
    enPoderDe = para
  }

  return {
    id: row.id,
    fecha: row.fecha,
    tipo,
    descripcion: row.descripcion ?? '',
    monto: Number(row.monto),
    enPoderDe,
    de,
    para,
    registradoPor: row.usuarios?.nombre ?? 'Admin',
    created_at: row.created_at,
  }
}

export default async function CajaPage() {
  const rows = await getMovimientosCaja()
  const movimientos = (rows ?? []).map(mapRowToMovimiento)

  return (
    <div>
      <PageHeader
        title="Caja Nativa"
        description="Gestion de efectivo e ingresos/egresos"
        color="#7EC99A"
      />

      <CajaClient initialMovimientos={movimientos} />
    </div>
  )
}
