import { PageHeader } from '@/components/page-header'
import { CursosClient } from '@/components/cursos/cursos-client'
import { Curso, Alumno } from '@/types/cursos'

// Mock data for development
const mockCursos: Curso[] = [
  { id: '1', nombre: 'Modelaje Profesional', precio_mensual: 85000, activo: true },
  { id: '2', nombre: 'Pasarela Avanzada', precio_mensual: 95000, activo: true },
  { id: '3', nombre: 'Fotografia y Poses', precio_mensual: 75000, activo: true },
  { id: '4', nombre: 'Imagen Personal', precio_mensual: 65000, activo: true },
]

const mockAlumnos: Alumno[] = [
  {
    id: '1',
    nombre: 'Maria Garcia',
    tipo: 'normal',
    descuento_pct: 0,
    curso_id: '1',
    curso: mockCursos[0],
    estado: 'activo',
    fecha_inscripcion: '2024-03-15',
    es_reincorporacion: false,
  },
  {
    id: '2',
    nombre: 'Ana Martinez',
    tipo: 'beca',
    descuento_pct: 0,
    curso_id: '1',
    curso: mockCursos[0],
    estado: 'activo',
    notas: 'Beca por merito academico',
    fecha_inscripcion: '2024-02-01',
    es_reincorporacion: false,
  },
  {
    id: '3',
    nombre: 'Lucia Rodriguez',
    tipo: 'descuento',
    descuento_pct: 20,
    curso_id: '2',
    curso: mockCursos[1],
    estado: 'atrasado',
    notas: 'Debe mes de Abril',
    fecha_inscripcion: '2024-01-10',
    es_reincorporacion: false,
  },
  {
    id: '4',
    nombre: 'Sofia Lopez',
    tipo: 'normal',
    descuento_pct: 0,
    curso_id: '3',
    curso: mockCursos[2],
    estado: 'atrasado',
    fecha_inscripcion: '2024-04-01',
    es_reincorporacion: false,
  },
  {
    id: '5',
    nombre: 'Valentina Torres',
    tipo: 'normal',
    descuento_pct: 0,
    monto_personalizado: 70000,
    curso_id: '2',
    curso: mockCursos[1],
    estado: 'activo',
    notas: 'Pago acordado especial',
    fecha_inscripcion: '2024-03-20',
    es_reincorporacion: false,
  },
  {
    id: '6',
    nombre: 'Camila Fernandez',
    tipo: 'normal',
    descuento_pct: 0,
    curso_id: '4',
    curso: mockCursos[3],
    estado: 'baja',
    fecha_inscripcion: '2023-09-01',
    es_reincorporacion: false,
    fecha_baja: '2024-02-15',
    tipo_baja: 'temporal',
  },
  {
    id: '7',
    nombre: 'Isabella Gonzalez',
    tipo: 'descuento',
    descuento_pct: 15,
    curso_id: '1',
    curso: mockCursos[0],
    estado: 'atrasado',
    notas: 'Hermana de ex-alumna',
    fecha_inscripcion: '2024-02-20',
    es_reincorporacion: false,
  },
  {
    id: '8',
    nombre: 'Emma Diaz',
    tipo: 'normal',
    descuento_pct: 0,
    curso_id: '3',
    curso: mockCursos[2],
    estado: 'activo',
    fecha_inscripcion: '2024-04-10',
    es_reincorporacion: true,
  },
]

export default function CursosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cursos"
        description="Gestion de alumnos y pagos de cursos"
      />
      <CursosClient cursos={mockCursos} alumnos={mockAlumnos} />
    </div>
  )
}
