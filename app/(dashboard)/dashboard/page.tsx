import { DashboardClient } from '@/components/dashboard/dashboard-client'
import {
  getMovimientosCaja,
  getClientesTVSinPago,
  getRolActual,
  getSolicitudesPendientes,
  getDashboardStats,
} from '@/lib/actions'
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

  const [rows, clientesSinPago, rol, stats] = await Promise.all([
    getMovimientosCaja(),
    getClientesTVSinPago(mesActual, anioActual),
    getRolActual(),
    getDashboardStats(),
  ])

  // Ingresos reales del periodo actual (Cursos / Agencia / Social TV)
  const ingresos = {
    total: stats.totalGeneral,
    cursos: { monto: stats.cursos.total, cantidad: stats.cursos.alumnos },
    agencia: { monto: stats.agencia.total, cantidad: stats.agencia.trabajos },
    socialTv: { monto: stats.socialTV.total, cantidad: stats.socialTV.clientes },
  }

  // TEMPORAL: mostramos las solicitudes a todos los usuarios autenticados
  // para verificar el componente. Luego se restringe con: rol === 'admin'.
  const solicitudes = await getSolicitudesPendientes()

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

  const solicitudesCorreccion = (solicitudes ?? []).map((s: any) => ({
    id: s.id,
    descripcion: s.descripcion,
    modulo: s.modulo,
    referencia: s.referencia ?? null,
    solicitante: s.solicitante ?? 'Administrativa',
    created_at: s.created_at,
  }))

  return (
    <DashboardClient
      caja={{ secretaria: saldoSecretaria, mama: saldoMama }}
      alertas={alertas}
      solicitudes={solicitudesCorreccion}
      ingresos={ingresos}
      esAdmin={true}
    />
  )
}
