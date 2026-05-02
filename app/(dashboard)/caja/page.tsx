import { PageHeader } from '@/components/page-header'
import { CajaClient } from '@/components/caja/caja-client'
import type { Movimiento } from '@/types/caja'

// Datos mock de movimientos
const mockMovimientos: Movimiento[] = [
  {
    id: '1',
    fecha: '2026-04-02',
    tipo: 'ingreso',
    descripcion: 'Pago cuota alumna Valentina — abril',
    monto: 85000,
    enPoderDe: 'secretaria',
    registradoPor: 'Secretaria',
    created_at: '2026-04-02T10:00:00Z'
  },
  {
    id: '2',
    fecha: '2026-04-03',
    tipo: 'ingreso',
    descripcion: 'Pago cuota alumna Camila — abril',
    monto: 85000,
    enPoderDe: 'secretaria',
    registradoPor: 'Secretaria',
    created_at: '2026-04-03T11:00:00Z'
  },
  {
    id: '3',
    fecha: '2026-04-05',
    tipo: 'transferencia',
    descripcion: 'Secretaria → Mama',
    monto: 150000,
    enPoderDe: 'mama',
    de: 'secretaria',
    para: 'mama',
    registradoPor: 'Secretaria',
    created_at: '2026-04-05T14:00:00Z'
  },
  {
    id: '4',
    fecha: '2026-04-08',
    tipo: 'ingreso',
    descripcion: 'Pago cuota alumno Lucas — abril',
    monto: 85000,
    enPoderDe: 'secretaria',
    registradoPor: 'Secretaria',
    created_at: '2026-04-08T09:30:00Z'
  },
  {
    id: '5',
    fecha: '2026-04-10',
    tipo: 'egreso',
    descripcion: 'Compra telas y accesorios',
    monto: 45000,
    enPoderDe: 'mama',
    registradoPor: 'Admin',
    created_at: '2026-04-10T16:00:00Z'
  },
  {
    id: '6',
    fecha: '2026-04-12',
    tipo: 'ingreso',
    descripcion: 'Pago cuota alumna Sofia — abril',
    monto: 85000,
    enPoderDe: 'secretaria',
    registradoPor: 'Secretaria',
    created_at: '2026-04-12T10:00:00Z'
  },
  {
    id: '7',
    fecha: '2026-04-15',
    tipo: 'transferencia',
    descripcion: 'Secretaria → Mama',
    monto: 120000,
    enPoderDe: 'mama',
    de: 'secretaria',
    para: 'mama',
    registradoPor: 'Secretaria',
    created_at: '2026-04-15T15:00:00Z'
  },
  {
    id: '8',
    fecha: '2026-04-18',
    tipo: 'egreso',
    descripcion: 'Viaticos evento',
    monto: 30000,
    enPoderDe: 'mama',
    registradoPor: 'Admin',
    created_at: '2026-04-18T12:00:00Z'
  },
  {
    id: '9',
    fecha: '2026-04-22',
    tipo: 'ingreso',
    descripcion: 'Pago cuota alumna Martina — abril',
    monto: 85000,
    enPoderDe: 'secretaria',
    registradoPor: 'Secretaria',
    created_at: '2026-04-22T11:00:00Z'
  },
  {
    id: '10',
    fecha: '2026-04-28',
    tipo: 'egreso',
    descripcion: 'Materiales fotografia',
    monto: 25000,
    enPoderDe: 'mama',
    registradoPor: 'Admin',
    created_at: '2026-04-28T14:00:00Z'
  },
  // Movimientos de meses anteriores para el grafico
  {
    id: '11',
    fecha: '2026-03-05',
    tipo: 'ingreso',
    descripcion: 'Pagos marzo — varios alumnos',
    monto: 340000,
    enPoderDe: 'secretaria',
    registradoPor: 'Secretaria',
    created_at: '2026-03-05T10:00:00Z'
  },
  {
    id: '12',
    fecha: '2026-03-15',
    tipo: 'transferencia',
    descripcion: 'Secretaria → Mama',
    monto: 200000,
    enPoderDe: 'mama',
    de: 'secretaria',
    para: 'mama',
    registradoPor: 'Secretaria',
    created_at: '2026-03-15T10:00:00Z'
  },
  {
    id: '13',
    fecha: '2026-03-20',
    tipo: 'egreso',
    descripcion: 'Gastos operativos marzo',
    monto: 80000,
    enPoderDe: 'mama',
    registradoPor: 'Admin',
    created_at: '2026-03-20T10:00:00Z'
  },
  {
    id: '14',
    fecha: '2026-02-10',
    tipo: 'ingreso',
    descripcion: 'Pagos febrero — varios alumnos',
    monto: 320000,
    enPoderDe: 'secretaria',
    registradoPor: 'Secretaria',
    created_at: '2026-02-10T10:00:00Z'
  },
  {
    id: '15',
    fecha: '2026-02-25',
    tipo: 'egreso',
    descripcion: 'Gastos operativos febrero',
    monto: 95000,
    enPoderDe: 'mama',
    registradoPor: 'Admin',
    created_at: '2026-02-25T10:00:00Z'
  },
  {
    id: '16',
    fecha: '2026-01-08',
    tipo: 'ingreso',
    descripcion: 'Pagos enero — inscripciones',
    monto: 450000,
    enPoderDe: 'secretaria',
    registradoPor: 'Secretaria',
    created_at: '2026-01-08T10:00:00Z'
  },
  {
    id: '17',
    fecha: '2026-01-20',
    tipo: 'egreso',
    descripcion: 'Inversion equipamiento',
    monto: 150000,
    enPoderDe: 'mama',
    registradoPor: 'Admin',
    created_at: '2026-01-20T10:00:00Z'
  },
  {
    id: '18',
    fecha: '2025-12-15',
    tipo: 'ingreso',
    descripcion: 'Cierre de año — pagos',
    monto: 280000,
    enPoderDe: 'secretaria',
    registradoPor: 'Secretaria',
    created_at: '2025-12-15T10:00:00Z'
  },
  {
    id: '19',
    fecha: '2025-11-10',
    tipo: 'ingreso',
    descripcion: 'Pagos noviembre',
    monto: 300000,
    enPoderDe: 'secretaria',
    registradoPor: 'Secretaria',
    created_at: '2025-11-10T10:00:00Z'
  }
]

export default function CajaPage() {
  return (
    <div>
      <PageHeader 
        title="Caja Nativa" 
        description="Gestion de efectivo e ingresos/egresos"
        color="#7EC99A"
      />
      
      <CajaClient initialMovimientos={mockMovimientos} />
    </div>
  )
}
