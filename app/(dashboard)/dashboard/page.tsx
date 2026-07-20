import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { getMovimientosCaja } from '@/lib/actions'
import { mapRowToMovimiento, calcularSaldos } from '@/lib/caja-utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const rows = await getMovimientosCaja()
  const movimientos = (rows ?? []).map(mapRowToMovimiento)
  const { saldoSecretaria, saldoMama } = calcularSaldos(movimientos)

  return <DashboardClient caja={{ secretaria: saldoSecretaria, mama: saldoMama }} />
}
