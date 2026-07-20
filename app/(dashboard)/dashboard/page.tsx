import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { getMovimientosCaja, getClientesTVSinPago } from '@/lib/actions'
import { mapRowToMovimiento, calcularSaldos } from '@/lib/caja-utils'

export const dynamic = 'force-dynamic'

const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export default async function DashboardPage() {
  const now = new Date()
  const mesActual = now.getMonth() + 1 // 1-12
  const anioActual = now.getFullYear()
  const nombreMes = MESES_ES[now.getMonth()]

  const [rows, clientesSinPago] = await Promise.all([
    getMovimientosCaja(),
    getClientesTVSinPago(mesActual, anioActual),
  ])

  const movimientos = (rows ?? []).map(mapRowToMovimiento)
  const { saldoSecretaria, saldoMama } = calcularSaldos(movimientos)

  // Alertas reales: clientes de Social TV activos sin pago del mes actual
  const alertas = (clientesSinPago ?? []).map((c: any) => ({
    id: `tv-${c.id}`,
    nombre: c.nombre,
    modulo: 'social-tv' as const,
    descripcion: `Sin marcar pago ${nombreMes}`,
    tipo: 'pendiente' as const,
  }))

  return (
    <DashboardClient
      caja={{ secretaria: saldoSecretaria, mama: saldoMama }}
      alertas={alertas}
    />
  )
}
