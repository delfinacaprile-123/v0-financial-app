import { PageHeader } from '@/components/page-header'
import { CursosClient } from '@/components/cursos/cursos-client'
import { getCursos, getAlumnos } from './actions'

export default async function CursosPage() {
  const [cursos, alumnos] = await Promise.all([
    getCursos(),
    getAlumnos(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cursos"
        description="Gestion de alumnos y pagos de cursos"
      />
      <CursosClient cursos={cursos} alumnos={alumnos} />
    </div>
  )
}
