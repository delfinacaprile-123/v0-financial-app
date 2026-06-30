import { PageHeader } from '@/components/page-header'
import { AgenciaClient } from '@/components/agencia/agencia-client'
import { Cliente, Trabajo, TipoServicio, EstadoTrabajo, MetodoPago } from '@/types/agencia'
import { getTrabajos, getClientesAgencia } from '@/lib/actions'

export const dynamic = 'force-dynamic'

// Mapea una fila de `clientes` (Supabase) al tipo Cliente del cliente
function mapCliente(row: any): Cliente {
  return {
    id: row.id,
    nombre: row.nombre,
    activo: row.activo ?? true,
    created_at: row.created_at,
  }
}

// Mapea una fila de `trabajos` (con clientes y modelos_trabajo embebidos) al tipo Trabajo
function mapTrabajo(row: any): Trabajo {
  return {
    id: row.id,
    cliente_id: row.cliente_id,
    cliente: row.clientes
      ? mapCliente(row.clientes)
      : { id: row.cliente_id, nombre: 'Cliente desconocido', activo: false },
    tipo: (row.tipo ?? 'otro') as TipoServicio,
    fecha: row.fecha,
    monto_cobrado: Number(row.monto_cobrado) || 0,
    estado: (row.estado ?? 'pendiente') as EstadoTrabajo,
    metodo_pago: (row.metodo ?? 'transferencia') as MetodoPago,
    notas: row.notas ?? undefined,
    modelos: (row.modelos_trabajo ?? []).map((m: any) => ({
      id: m.id,
      nombre: m.nombre_modelo,
      cachet: Number(m.cachet) || 0,
    })),
    created_at: row.created_at,
  }
}

export default async function AgenciaPage() {
  const [trabajosRaw, clientesRaw] = await Promise.all([getTrabajos(), getClientesAgencia()])

  const trabajos = (trabajosRaw ?? []).map(mapTrabajo)
  const clientes = (clientesRaw ?? []).map(mapCliente)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agencia"
        description="Gestión de trabajos, clientes y servicios de modelaje"
        color="#8FB3C9"
      />
      <AgenciaClient trabajos={trabajos} clientes={clientes} />
    </div>
  )
}
