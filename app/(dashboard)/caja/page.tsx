import { PageHeader } from '@/components/page-header'
import { CajaClient } from '@/components/caja/caja-client'
import { getMovimientosCaja } from '@/lib/actions'
import { mapRowToMovimiento } from '@/lib/caja-utils'

export const dynamic = 'force-dynamic'

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
