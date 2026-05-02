'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Filter, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Curso, Alumno, TabCurso } from '@/types/cursos'
import { AlumnoModal } from './alumno-modal'
import { AlumnoPanel } from './alumno-panel'

interface CursosClientProps {
  cursos: Curso[]
  alumnos: Alumno[]
}

const TABS: { id: TabCurso; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'activos', label: 'Activos' },
  { id: 'atrasados', label: 'Atrasados' },
  { id: 'bajas', label: 'Bajas' },
]

export function CursosClient({ cursos, alumnos }: CursosClientProps) {
  const [activeTab, setActiveTab] = useState<TabCurso>('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCurso, setSelectedCurso] = useState<string>('all')
  const [showNewAlumnoModal, setShowNewAlumnoModal] = useState(false)
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string | null>(null)

  const atrasadosCount = alumnos.filter(a => a.estado === 'atrasado').length

  const filteredAlumnos = useMemo(() => {
    return alumnos.filter(alumno => {
      // Filter by tab
      if (activeTab === 'activos' && alumno.estado !== 'activo') return false
      if (activeTab === 'atrasados' && alumno.estado !== 'atrasado') return false
      if (activeTab === 'bajas' && alumno.estado !== 'baja') return false

      // Filter by search
      if (searchQuery && !alumno.nombre.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Filter by curso
      if (selectedCurso !== 'all' && alumno.curso_id !== selectedCurso) {
        return false
      }

      return true
    })
  }, [alumnos, activeTab, searchQuery, selectedCurso])

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">Activo</Badge>
      case 'atrasado':
        return <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">Atrasado</Badge>
      case 'baja':
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">Baja</Badge>
      default:
        return null
    }
  }

  const getTipoBadge = (tipo: string, descuento?: number) => {
    switch (tipo) {
      case 'beca':
        return <Badge variant="outline" className="border-primary/50 text-primary">Beca</Badge>
      case 'descuento':
        return <Badge variant="outline" className="border-blue-500/50 text-blue-400">{descuento}% desc.</Badge>
      default:
        return null
    }
  }

  const calcularMonto = (alumno: Alumno) => {
    if (alumno.tipo === 'beca') return 0
    if (alumno.monto_personalizado) return alumno.monto_personalizado
    if (alumno.tipo === 'descuento' && alumno.curso) {
      return alumno.curso.precio_mensual * (1 - alumno.descuento_pct / 100)
    }
    return alumno.curso?.precio_mensual || 0
  }

  return (
    <div className="space-y-6">
      {/* Header with tabs and actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg bg-muted/30 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.id === 'atrasados' && atrasadosCount > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-semibold text-black">
                  {atrasadosCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <Button
          onClick={() => setShowNewAlumnoModal(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo alumno
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar alumno..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background pl-10"
          />
        </div>
        <Select value={selectedCurso} onValueChange={setSelectedCurso}>
          <SelectTrigger className="w-full bg-background sm:w-[200px]">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Todos los cursos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los cursos</SelectItem>
            {cursos.map((curso) => (
              <SelectItem key={curso.id} value={curso.id}>
                {curso.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Alumno
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Curso
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Monto
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredAlumnos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No hay alumnos que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                filteredAlumnos.map((alumno) => (
                  <tr
                    key={alumno.id}
                    onClick={() => setSelectedAlumnoId(alumno.id)}
                    className="cursor-pointer transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{alumno.nombre}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {alumno.curso?.nombre}
                    </td>
                    <td className="px-4 py-3">
                      {getTipoBadge(alumno.tipo, alumno.descuento_pct)}
                    </td>
                    <td className="px-4 py-3 font-medium text-primary">
                      ${calcularMonto(alumno).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {getEstadoBadge(alumno.estado)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>{filteredAlumnos.length} alumno(s) mostrados</span>
        <span>&middot;</span>
        <span>
          Ingresos esperados:{' '}
          <span className="font-medium text-primary">
            ${filteredAlumnos.reduce((sum, a) => sum + calcularMonto(a), 0).toLocaleString()}
          </span>
        </span>
      </div>

      {/* Modals */}
      <AlumnoModal
        isOpen={showNewAlumnoModal}
        onClose={() => setShowNewAlumnoModal(false)}
        cursos={cursos}
      />

      {selectedAlumnoId && (
        <AlumnoPanel
          alumnoId={selectedAlumnoId}
          cursos={cursos}
          onClose={() => setSelectedAlumnoId(null)}
        />
      )}
    </div>
  )
}
