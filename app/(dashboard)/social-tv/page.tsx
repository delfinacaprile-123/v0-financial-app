import { PageHeader } from '@/components/page-header'
import { SocialTVClient } from '@/components/social-tv/social-tv-client'
import { ClienteTV, PagoMensualTV, PagoExtraordinarioTV } from '@/types/social-tv'

// Datos mock de clientes
const clientesMock: ClienteTV[] = [
  {
    id: '1',
    nombre: 'Melocoton',
    tipo_servicio: 'produccion',
    monto_mensual: 380000,
    metodo_habitual: 'transferencia',
    activo: true,
    created_at: '2024-01-15'
  },
  {
    id: '2',
    nombre: 'Canal 3 Rosario',
    tipo_servicio: 'promo',
    monto_mensual: 250000,
    metodo_habitual: 'transferencia',
    activo: true,
    created_at: '2024-02-01'
  },
  {
    id: '3',
    nombre: 'Diario La Capital',
    tipo_servicio: 'foto',
    monto_mensual: 180000,
    metodo_habitual: 'mercadopago',
    activo: true,
    created_at: '2024-03-10'
  },
  {
    id: '4',
    nombre: 'Banco Macro',
    tipo_servicio: 'desfile',
    monto_mensual: 420000,
    metodo_habitual: 'transferencia',
    activo: true,
    created_at: '2024-01-20'
  },
  {
    id: '5',
    nombre: 'Farmacity',
    tipo_servicio: 'produccion',
    monto_mensual: 310000,
    metodo_habitual: 'efectivo',
    activo: true,
    created_at: '2024-04-05'
  },
  {
    id: '6',
    nombre: 'El Litoral',
    tipo_servicio: 'promo',
    monto_mensual: 200000,
    metodo_habitual: 'mercadopago',
    activo: true,
    created_at: '2024-05-12'
  },
]

// Mes actual para los pagos
const mesActual = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

// Datos mock de pagos mensuales
const pagosMock: PagoMensualTV[] = [
  // Pagos del mes actual
  {
    id: 'p1',
    cliente_id: '1',
    mes: mesActual,
    monto: 380000,
    pagado: true,
    fecha_pago: '2026-05-05',
    metodo_pago: 'transferencia',
    created_at: '2026-05-05'
  },
  {
    id: 'p3',
    cliente_id: '3',
    mes: mesActual,
    monto: 180000,
    pagado: true,
    fecha_pago: '2026-05-03',
    metodo_pago: 'mercadopago',
    created_at: '2026-05-03'
  },
  {
    id: 'p5',
    cliente_id: '5',
    mes: mesActual,
    monto: 310000,
    pagado: true,
    fecha_pago: '2026-05-08',
    metodo_pago: 'efectivo',
    created_at: '2026-05-08'
  },
  // Historial - mes anterior
  {
    id: 'h1',
    cliente_id: '1',
    mes: '2026-04',
    monto: 380000,
    pagado: true,
    fecha_pago: '2026-04-06',
    metodo_pago: 'transferencia',
    created_at: '2026-04-06'
  },
  {
    id: 'h2',
    cliente_id: '2',
    mes: '2026-04',
    monto: 250000,
    pagado: true,
    fecha_pago: '2026-04-10',
    metodo_pago: 'transferencia',
    created_at: '2026-04-10'
  },
  {
    id: 'h3',
    cliente_id: '3',
    mes: '2026-04',
    monto: 180000,
    pagado: true,
    fecha_pago: '2026-04-05',
    metodo_pago: 'mercadopago',
    created_at: '2026-04-05'
  },
  {
    id: 'h4',
    cliente_id: '4',
    mes: '2026-04',
    monto: 420000,
    pagado: true,
    fecha_pago: '2026-04-12',
    metodo_pago: 'transferencia',
    created_at: '2026-04-12'
  },
  {
    id: 'h5',
    cliente_id: '5',
    mes: '2026-04',
    monto: 310000,
    pagado: true,
    fecha_pago: '2026-04-08',
    metodo_pago: 'efectivo',
    created_at: '2026-04-08'
  },
  {
    id: 'h6',
    cliente_id: '6',
    mes: '2026-04',
    monto: 200000,
    pagado: true,
    fecha_pago: '2026-04-15',
    metodo_pago: 'mercadopago',
    created_at: '2026-04-15'
  },
]

// Datos mock de pagos extraordinarios
const pagosExtraordinariosMock: PagoExtraordinarioTV[] = [
  {
    id: 'e1',
    cliente_id: '1',
    cliente_nombre: 'Melocoton',
    descripcion: 'Produccion especial verano',
    monto: 150000,
    fecha: '2026-03-15',
    metodo_pago: 'transferencia',
    created_at: '2026-03-15'
  },
  {
    id: 'e2',
    cliente_id: '2',
    cliente_nombre: 'Canal 3 Rosario',
    descripcion: 'Desfile extra evento',
    monto: 200000,
    fecha: '2026-02-02',
    metodo_pago: 'transferencia',
    created_at: '2026-02-02'
  },
]

export default function SocialTVPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Social TV" 
        description="Gestion de clientes con cuota mensual fija"
        color="#B09EC9"
      />
      
      <SocialTVClient 
        clientesIniciales={clientesMock}
        pagosIniciales={pagosMock}
        pagosExtraordinariosIniciales={pagosExtraordinariosMock}
      />
    </div>
  )
}
