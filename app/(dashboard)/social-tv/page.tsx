import { PageHeader } from '@/components/page-header'
import { SocialTVClient } from '@/components/social-tv/social-tv-client'
import { createClient } from '@/lib/supabase/server'
import type {
  ClienteTV,
  PagoMensualTV,
  PagoExtraordinarioTV,
  TipoServicioTV,
  MetodoPagoTV,
} from '@/types/social-tv'

export const dynamic = 'force-dynamic'

const TIPOS_VALIDOS: TipoServicioTV[] = ['desfile', 'produccion', 'foto', 'promo', 'otro']
const METODOS_VALIDOS: MetodoPagoTV[] = ['transferencia', 'mercadopago', 'efectivo']

// El campo `mes` en la DB viene inconsistente ("2026-04" o "04").
// El cliente compara con formato "YYYY-MM", así que lo normalizamos usando `anio`.
function normalizeMes(mes: string | null, anio: number): string {
  const year = anio || new Date().getFullYear()
  if (!mes) return `${year}-01`
  const parts = String(mes).split('-')
  const monthRaw = parts.length > 1 ? parts[1] : parts[0]
  const mm = String(monthRaw).padStart(2, '0')
  return `${year}-${mm}`
}

export default async function SocialTVPage() {
  const supabase = await createClient()

  // La unidad puede llamarse 'Social TV' o 'social_tv': normalizamos para encontrarla
  const { data: unidades } = await supabase.from('unidades_negocio').select('id, nombre')
  const unidadTV = (unidades ?? []).find((u: any) =>
    u.nombre?.toLowerCase().replace(/[\s_]/g, '').includes('socialtv')
  )

  let clientes: ClienteTV[] = []
  let pagos: PagoMensualTV[] = []
  let pagosExtra: PagoExtraordinarioTV[] = []

  if (unidadTV) {
    const [{ data: clientesRaw }, { data: pagosRaw }] = await Promise.all([
      // No filtramos por activo=true: los clientes inactivos deben seguir
      // cargándose para preservar la visibilidad de sus pagos históricos.
      supabase
        .from('clientes')
        .select('*')
        .eq('unidad_negocio_id', unidadTV.id)
        .order('nombre'),
      supabase
        .from('pagos_social_tv')
        .select('*, clientes(nombre)')
        .order('anio', { ascending: false }),
    ])

    const montoByCliente = new Map<string, number>()

    clientes = (clientesRaw ?? []).map((c: any) => {
      const monto = Number(c.monto_mensual) || 0
      montoByCliente.set(c.id, monto)
      // tipo_cliente en la DB ('fijo') no mapea al enum de servicio: usamos 'otro' por defecto
      const tipo: TipoServicioTV = TIPOS_VALIDOS.includes(c.tipo_cliente) ? c.tipo_cliente : 'otro'
      const metodo: MetodoPagoTV = METODOS_VALIDOS.includes(c.metodo_default)
        ? c.metodo_default
        : 'transferencia'
      return {
        id: c.id,
        nombre: c.nombre,
        tipo_cliente: c.tipo_cliente === 'no_fijo' ? 'no_fijo' : 'fijo',
        tipo_servicio: tipo,
        monto_mensual: monto,
        metodo_habitual: metodo,
        activo: c.activo ?? true,
        created_at: c.created_at,
      }
    })

    const pagosTodos = pagosRaw ?? []

    // Pagos mensuales (checklist): los que NO son extraordinarios
    pagos = pagosTodos
      .filter((p: any) => !(p.monto_extra && Number(p.monto_extra) > 0))
      .map((p: any) => ({
        id: p.id,
        cliente_id: p.cliente_id,
        mes: normalizeMes(p.mes, p.anio),
        monto: montoByCliente.get(p.cliente_id) || 0,
        pagado: p.pagado ?? false,
        fecha_pago: p.fecha_pago ?? undefined,
        metodo_pago: METODOS_VALIDOS.includes(p.metodo) ? p.metodo : undefined,
        created_at: p.created_at,
      }))

    // Pagos extraordinarios: tienen monto_extra > 0
    pagosExtra = pagosTodos
      .filter((p: any) => p.monto_extra && Number(p.monto_extra) > 0)
      .map((p: any) => ({
        id: p.id,
        cliente_id: p.cliente_id,
        cliente_nombre: p.clientes?.nombre,
        descripcion: p.descripcion_extra ?? '',
        monto: Number(p.monto_extra) || 0,
        fecha: p.fecha_pago ?? p.created_at,
        metodo_pago: METODOS_VALIDOS.includes(p.metodo) ? p.metodo : 'transferencia',
        created_at: p.created_at,
      }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social TV"
        description="Gestion de clientes con cuota mensual fija"
        color="#B09EC9"
      />

      <SocialTVClient
        clientesIniciales={clientes}
        pagosIniciales={pagos}
        pagosExtraordinariosIniciales={pagosExtra}
      />
    </div>
  )
}
