import { PageHeader } from '@/components/page-header'
import { ConfiguracionClient } from '@/components/configuracion/configuracion-client'
import type { UsuarioConfig, CursoConfig, ClienteConfig } from '@/types/configuracion'

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

// Mock data for cursos
const mockCursos: CursoConfig[] = [
  {
    id: '1',
    nombre: 'Modelaje Profesional',
    precio_mensual: 85000,
    activo: true,
    alumnos_activos: 18,
  },
  {
    id: '2',
    nombre: 'Pasarela Avanzada',
    precio_mensual: 85000,
    activo: true,
    alumnos_activos: 12,
  },
  {
    id: '3',
    nombre: 'Fotografia y Poses',
    precio_mensual: 85000,
    activo: true,
    alumnos_activos: 8,
  },
  {
    id: '4',
    nombre: 'Imagen Personal',
    precio_mensual: 85000,
    activo: true,
    alumnos_activos: 4,
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

export default function ConfiguracionPage() {
  // Note: In production, this would check the actual user role from Supabase
  // For now, we use mock data and assume admin role
  
  return (
    <div>
      <PageHeader 
        title="Configuracion" 
        description="Gestion de usuarios, cursos y clientes"
        color="#C9A96E"
      />
      
      <ConfiguracionClient 
        usuarios={mockUsuarios}
        cursos={mockCursos}
        clientes={mockClientes}
      />
    </div>
  )
}
