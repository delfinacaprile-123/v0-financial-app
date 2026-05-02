import { PageHeader } from '@/components/page-header'
import { AgenciaClient } from '@/components/agencia/agencia-client'
import { Cliente, Trabajo } from '@/types/agencia'

// Mock data - Clientes
const mockClientes: Cliente[] = [
  { id: '1', nombre: 'Melocotón', activo: true },
  { id: '2', nombre: 'Banco Galicia', activo: true },
  { id: '3', nombre: 'Cerveza Andes', activo: true },
  { id: '4', nombre: 'Tarjeta Naranja', activo: false },
  { id: '5', nombre: 'Natura', activo: true },
]

// Mock data - Trabajos (últimos 3 meses)
const mockTrabajos: Trabajo[] = [
  {
    id: '1',
    cliente_id: '1',
    cliente: mockClientes[0],
    tipo: 'produccion',
    fecha: '2024-04-15',
    monto_cobrado: 450000,
    estado: 'cobrado',
    metodo_pago: 'transferencia',
    notas: 'Campaña primavera-verano 2024',
    modelos: [
      { id: 'm1', nombre: 'Valentina Rossi', cachet: 80000 },
      { id: 'm2', nombre: 'Camila Fernández', cachet: 80000 },
    ],
  },
  {
    id: '2',
    cliente_id: '2',
    cliente: mockClientes[1],
    tipo: 'desfile',
    fecha: '2024-04-10',
    monto_cobrado: 800000,
    estado: 'cobrado',
    metodo_pago: 'transferencia',
    notas: 'Evento anual Banco Galicia - Centro de Convenciones',
    modelos: [
      { id: 'm3', nombre: 'Sofia Martinez', cachet: 60000 },
      { id: 'm4', nombre: 'Lucia García', cachet: 60000 },
      { id: 'm5', nombre: 'María Torres', cachet: 60000 },
      { id: 'm6', nombre: 'Ana Rodríguez', cachet: 60000 },
      { id: 'm7', nombre: 'Paula Sánchez', cachet: 60000 },
    ],
  },
  {
    id: '3',
    cliente_id: '5',
    cliente: mockClientes[4],
    tipo: 'foto',
    fecha: '2024-04-05',
    monto_cobrado: 280000,
    estado: 'facturado',
    metodo_pago: 'mercadopago',
    notas: 'Sesión para catálogo digital',
    modelos: [
      { id: 'm8', nombre: 'Isabella López', cachet: 90000 },
    ],
  },
  {
    id: '4',
    cliente_id: '3',
    cliente: mockClientes[2],
    tipo: 'promo',
    fecha: '2024-03-25',
    monto_cobrado: 350000,
    estado: 'cobrado',
    metodo_pago: 'efectivo',
    notas: 'Activación en Lollapalooza',
    modelos: [
      { id: 'm9', nombre: 'Martina Álvarez', cachet: 50000 },
      { id: 'm10', nombre: 'Victoria Ruiz', cachet: 50000 },
      { id: 'm11', nombre: 'Agustina Díaz', cachet: 50000 },
    ],
  },
  {
    id: '5',
    cliente_id: '1',
    cliente: mockClientes[0],
    tipo: 'produccion',
    fecha: '2024-03-18',
    monto_cobrado: 420000,
    estado: 'pendiente',
    metodo_pago: 'transferencia',
    notas: 'Segunda sesión campaña P/V',
    modelos: [
      { id: 'm12', nombre: 'Valentina Rossi', cachet: 80000 },
      { id: 'm13', nombre: 'Emma González', cachet: 80000 },
    ],
  },
  {
    id: '6',
    cliente_id: '5',
    cliente: mockClientes[4],
    tipo: 'foto',
    fecha: '2024-03-10',
    monto_cobrado: 320000,
    estado: 'cobrado',
    metodo_pago: 'transferencia',
    notas: 'Campaña día de la mujer',
    modelos: [
      { id: 'm14', nombre: 'Carolina Paz', cachet: 85000 },
      { id: 'm15', nombre: 'Milagros Luna', cachet: 85000 },
    ],
  },
  {
    id: '7',
    cliente_id: '2',
    cliente: mockClientes[1],
    tipo: 'otro',
    fecha: '2024-02-28',
    monto_cobrado: 180000,
    estado: 'cobrado',
    metodo_pago: 'transferencia',
    notas: 'Evento corporativo interno',
    modelos: [
      { id: 'm16', nombre: 'Julia Herrera', cachet: 45000 },
      { id: 'm17', nombre: 'Rocío Méndez', cachet: 45000 },
    ],
  },
  {
    id: '8',
    cliente_id: '4',
    cliente: mockClientes[3],
    tipo: 'desfile',
    fecha: '2024-01-20',
    monto_cobrado: 550000,
    estado: 'cobrado',
    metodo_pago: 'transferencia',
    notas: 'Último trabajo con Tarjeta Naranja',
    modelos: [
      { id: 'm18', nombre: 'Florencia Castro', cachet: 55000 },
      { id: 'm19', nombre: 'Delfina Acosta', cachet: 55000 },
      { id: 'm20', nombre: 'Renata Vidal', cachet: 55000 },
    ],
  },
]

export default function AgenciaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Agencia"
        description="Gestión de trabajos, clientes y servicios de modelaje"
        color="#8FB3C9"
      />
      <AgenciaClient trabajos={mockTrabajos} clientes={mockClientes} />
    </div>
  )
}
