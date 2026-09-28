'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Plus, Trash2, ArrowLeft, Users } from 'lucide-react'
import { toast } from 'sonner'
import { NuevoSabadoModal } from './nuevo-sabado-modal'
import { deleteHorarioSabado } from '@/lib/actions'
import { generarHorario, TURNOS } from '@/lib/clases-utils'
import type { HorarioSabado, Materia } from '@/types/clases'

interface ClasesClientProps {
  horarios: HorarioSabado[]
  materias: Materia[]
}

export function ClasesClient({ horarios, materias }: ClasesClientProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteAlert, setDeleteAlert] = useState(false)
  const [horarioToDelete, setHorarioToDelete] = useState<HorarioSabado | null>(null)

  const formatFecha = (fecha: string) => {
    // fecha viene como 'YYYY-MM-DD'; parseamos a mano para evitar el corrimiento de zona horaria
    const [anio, mes, dia] = fecha.split('-').map(Number)
    return new Date(anio, mes - 1, dia).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const handleDelete = (horario: HorarioSabado) => {
    setHorarioToDelete(horario)
    setDeleteAlert(true)
  }

  const confirmDelete = async () => {
    if (!horarioToDelete) return
    try {
      await deleteHorarioSabado(horarioToDelete.id)
      toast.success('Sabado eliminado')
      if (selectedId === horarioToDelete.id) setSelectedId(null)
      router.refresh()
    } catch (error) {
      console.error('[v0] Error al eliminar sabado:', error)
      toast.error('No se pudo eliminar el sabado')
    } finally {
      setDeleteAlert(false)
      setHorarioToDelete(null)
    }
  }

  const selectedHorario = horarios.find((h) => h.id === selectedId) ?? null

  if (selectedHorario) {
    const asignaciones = generarHorario(selectedHorario.grupos_sabado ?? [], materias).sort(
      (a, b) =>
        TURNOS.indexOf(a.hora as (typeof TURNOS)[number]) -
          TURNOS.indexOf(b.hora as (typeof TURNOS)[number]) ||
        a.nombreGrupo.localeCompare(b.nombreGrupo)
    )

    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedId(null)}
          className="text-[#888888] hover:text-[#C9A96E] hover:bg-[rgba(201,169,110,0.1)] -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a sabados
        </Button>

        <div>
          <h2 className="text-lg font-semibold text-[#E5E5E5] capitalize">
            {formatFecha(selectedHorario.fecha)}
          </h2>
          <p className="text-sm text-[#888888]">
            {selectedHorario.grupos_sabado?.length ?? 0} grupos - Horario generado automaticamente
          </p>
        </div>

        <div className="bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[rgba(201,169,110,0.1)] hover:bg-transparent">
                <TableHead className="text-[#888888]">Grupo</TableHead>
                <TableHead className="text-[#888888]">Hora</TableHead>
                <TableHead className="text-[#888888]">Clase</TableHead>
                <TableHead className="text-[#888888]">Salon</TableHead>
                <TableHead className="text-[#888888]">Profe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {asignaciones.map((a, i) => (
                <TableRow
                  key={`${a.grupoId}-${a.hora}-${i}`}
                  className="border-[rgba(201,169,110,0.1)] hover:bg-[rgba(201,169,110,0.05)]"
                >
                  <TableCell className="text-[#E5E5E5] font-medium">{a.nombreGrupo}</TableCell>
                  <TableCell className="text-[#C9A96E] font-medium">{a.hora}</TableCell>
                  <TableCell className="text-[#E5E5E5]">{a.clase}</TableCell>
                  <TableCell className="text-[#888888]">{a.salon}</TableCell>
                  <TableCell className="text-[#888888]">
                    <div className="flex items-center gap-2">
                      {a.profe}
                      {a.conflicto && (
                        <Badge
                          variant="outline"
                          className="border-[#EF4444] text-[#EF4444] bg-[rgba(239,68,68,0.1)] text-[10px]"
                        >
                          Conflicto
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {asignaciones.length === 0 && (
                <TableRow className="border-[rgba(201,169,110,0.1)]">
                  <TableCell colSpan={5} className="text-center text-[#666666] py-8">
                    Este sabado todavia no tiene grupos asignados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#888888]">
          {horarios.length} {horarios.length === 1 ? 'sabado organizado' : 'sabados organizados'}
        </p>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-[#C9A96E] text-[#0A0A0A] hover:bg-[#B8986D]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo sabado
        </Button>
      </div>

      {horarios.length === 0 ? (
        <div className="bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-xl py-16 text-center">
          <CalendarDays className="h-10 w-10 text-[#444444] mx-auto mb-3" />
          <p className="text-[#888888]">Todavia no organizaste ningun sabado</p>
          <p className="text-sm text-[#666666] mt-1">Crea el primero con el boton &quot;Nuevo sabado&quot;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {horarios.map((horario) => (
            <div
              key={horario.id}
              className="bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-xl p-5 space-y-3 hover:border-[rgba(201,169,110,0.3)] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-[#C9A96E]">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-sm font-medium capitalize">{formatFecha(horario.fecha)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(horario)}
                  className="h-7 w-7 p-0 text-[#666666] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-[#888888] text-sm">
                <Users className="h-3.5 w-3.5" />
                {horario.grupos_sabado?.length ?? 0} grupos
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedId(horario.id)}
                className="w-full border-[rgba(201,169,110,0.3)] text-[#C9A96E] hover:bg-[rgba(201,169,110,0.1)]"
              >
                Ver horario
              </Button>
            </div>
          ))}
        </div>
      )}

      <NuevoSabadoModal open={modalOpen} onOpenChange={setModalOpen} materias={materias} />

      <AlertDialog open={deleteAlert} onOpenChange={setDeleteAlert}>
        <AlertDialogContent className="bg-[#111111] border-[rgba(201,169,110,0.2)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E5E5E5]">Eliminar sabado</AlertDialogTitle>
            <AlertDialogDescription className="text-[#888888]">
              Se eliminara el sabado {horarioToDelete ? formatFecha(horarioToDelete.fecha) : ''} y todos
              sus grupos. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[rgba(201,169,110,0.3)] text-[#888888] hover:bg-[rgba(201,169,110,0.1)]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-[#EF4444] text-white hover:bg-[#DC2626]"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
