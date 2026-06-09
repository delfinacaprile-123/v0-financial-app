import { PageHeader } from '@/components/page-header'
import { GastosClient } from '@/components/gastos/gastos-client'
import { getGastos } from '@/lib/actions'
import type { Gasto } from '@/types/gastos'

export const dynamic = 'force-dynamic'

function mapRowToGasto(row: any): Gasto {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    monto: Number(row.monto),
    frecuencia: row.frecuencia,
    metodo: row.metodo,
    fecha_pago: row.fecha_pago,
    mes_correspondiente: row.mes_correspondiente ?? null,
    pagado: row.pagado ?? false,
    notas: row.notas ?? null,
    registradoPor: row.usuarios?.nombre ?? 'Admin',
    created_at: row.created_at,
  }
}

export default async function GastosPage() {
  const rows = await getGastos()
  const gastos = (rows ?? []).map(mapRowToGasto)

  return (
    <div>
      <PageHeader
        title="Gastos"
        description="Sueldos, impuestos y gastos fijos del negocio"
        color="#C9A96E"
      />

      <GastosClient initialGastos={gastos} />
    </div>
  )
}
