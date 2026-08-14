import { PageHeader } from '@/components/page-header'
import { ConfiguracionClient } from '@/components/configuracion/configuracion-client'
import { getRolActual, getCursos, getAlumnos } from '@/lib/actions'
import type { UsuarioConfig, CursoConfig, ClienteConfig } from '@/types/configuracion'

export const dynamic = 'force-dynamic'

// Mock data for usuarios
const mockUsuarios: UsuarioConfig[] = [
  {
    id: '1',
    nombre: 'Delfina Caprile',
    email: 'delfina@nativamodels.com',
    rol: 'admin',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    nombre: 'Maria Gonzalez',
    email: 'maria@nativamodels.com',
    rol: 'administrativa',
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: '3',
    nombre: 'Laura Martinez',
    email: 'laura@nativamodels.com',
    rol: 'administrativa',
    created_at: '2024-06-15T00:00:00Z',
  },
]

// Mock data for clientes
const mockClientes: ClienteConfig[] = [
  // Agencia clients
  {
    id: 'a1',
    nombre: 'Melocoton',
    unidad: 'agencia',
    activo: true,
    trabajos_count: 8,
  },
  {
    id: 'a2',
    nombre: 'Banco Galicia',
    unidad: 'agencia',
    activo: true,
    trabajos_count: 3,
  },
  {
    id: 'a3',
    nombre: 'Cerveza Andes',
    unidad: 'agencia',
    activo: true,
    trabajos_count: 2,
  },
  {
    id: 'a4',
    nombre: 'Tarjeta Naranja',
    unidad: 'agencia',
    activo: false,
    trabajos_count: 5,
  },
  {
    id: 'a5',
    nombre: 'Natura',
    unidad: 'agencia',
    activo: true,
    trabajos_count: 1,
  },
  // Social TV clients
  {
    id: 's1',
    nombre: 'Melocoton',
    unidad: 'social_tv',
    activo: true,
    monto_mensual: 380000,
    metodo_pago: 'transferencia',
  },
  {
    id: 's2',
    nombre: 'Canal 3 Rosario',
    unidad: 'social_tv',
    activo: true,
    monto_mensual: 250000,
    metodo_pago: 'transferencia',
  },
  {
    id: 's3',
    nombre: 'Diario La Capital',
    unidad: 'social_tv',
    activo: true,
    monto_mensual: 180000,
    metodo_pago: 'mercadopago',
  },
  {
    id: 's4',
    nombre: 'Banco Macro',
    unidad: 'social_tv',
    activo: true,
    monto_mensual: 420000,
    metodo_pago: 'transferencia',
  },
  {
    id: 's5',
    nombre: 'Farmacity',
    unidad: 'social_tv',
    activo: true,
    monto_mensual: 310000,
    metodo_pago: 'efectivo',
  },
  {
    id: 's6',
    nombre: 'El Litoral',
    unidad: 'social_tv',
    activo: true,
    monto_mensual: 200000,
    metodo_pago: 'transferencia',
  },
]

export default async function ConfiguracionPage() {
  const [rol, cursosRaw, alumnosRaw] = await Promise.all([
    getRolActual(),
    getCursos(),
    getAlumnos(),
  ])
  const esAdmin = rol === 'admin'

  // Cuenta de alumnos activos (no dados de baja) por curso
  const activosPorCurso = new Map<string, number>()
  for (const a of alumnosRaw ?? []) {
    if ((a.estado ?? 'activo') === 'baja') continue
    activosPorCurso.set(a.curso_id, (activosPorCurso.get(a.curso_id) ?? 0) + 1)
  }

  const cursos: CursoConfig[] = (cursosRaw ?? []).map((c: any) => ({
    id: c.id,
    nombre: c.nombre,
    precio_mensual: Number(c.precio_mensual) || 0,
    activo: c.activo ?? true,
    alumnos_activos: activosPorCurso.get(c.id) ?? 0,
  }))

  return (
    <div>
      <PageHeader 
        title="Configuracion" 
        description={esAdmin ? 'Gestion de usuarios, cursos y clientes' : 'Gestion de cursos'}
        color="#C9A96E"
      />
      
      <ConfiguracionClient 
        usuarios={mockUsuarios}
        cursos={cursos}
        clientes={mockClientes}
        esAdmin={esAdmin}
      />
    </div>
  )
}
