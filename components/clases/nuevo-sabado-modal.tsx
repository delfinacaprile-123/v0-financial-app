'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createHorarioSabado } from '@/lib/actions'
import type { Materia } from '@/types/clases'

interface NuevoSabadoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  materias: Materia[]
}

interface GrupoForm {
  nombre_grupo: string
  numero_clase_inicio: number
}

const grupoVacio: GrupoForm = { nombre_grupo: '', numero_clase_inicio: 1 }

export function NuevoSabadoModal({ open, onOpenChange, materias }: NuevoSabadoModalProps) {
  const router = useRouter()
  const [fecha, setFecha] = useState('')
  const [grupos, setGrupos] = useState<GrupoForm[]>([{ ...grupoVacio }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setFecha('')
    setGrupos([{ ...grupoVacio }])
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) resetForm()
    onOpenChange(value)
  }

  const addGrupo = () => setGrupos((prev) => [...prev, { ...grupoVacio }])

  const removeGrupo = (index: number) =>
    setGrupos((prev) => prev.filter((_, i) => i !== index))

  const updateGrupo = (index: number, patch: Partial<GrupoForm>) =>
    setGrupos((prev) => prev.map((g, i) => (i === index ? { ...g, ...patch } : g)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fecha) {
      toast.error('Elegi la fecha del sabado')
      return
    }

    const gruposValidos = grupos.filter((g) => g.nombre_grupo.trim() !== '')
    if (gruposValidos.length === 0) {
      toast.error('Agrega al menos un grupo')
      return
    }
    if (gruposValidos.some((g) => g.numero_clase_inicio <= 0)) {
      toast.error('El numero de clase debe ser mayor a 0')
      return
    }

    setIsSubmitting(true)
    try {
      await createHorarioSabado({ fecha, grupos: gruposValidos })
      toast.success('Sabado creado')
      handleOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('[v0] Error al crear sabado:', error)
      toast.error('No se pudo crear el sabado')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#111111] border-[rgba(201,169,110,0.2)] text-[#E5E5E5] max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Nuevo sabado</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="fecha" className="text-[#888888]">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5]"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[#888888]">Grupos</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addGrupo}
                className="h-7 text-[#C9A96E] hover:bg-[rgba(201,169,110,0.1)]"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Agregar grupo
              </Button>
            </div>

            {grupos.map((grupo, index) => (
              <div
                key={index}
                className="flex items-start gap-2 bg-[#0A0A0A] border border-[rgba(201,169,110,0.1)] rounded-lg p-3"
              >
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Nombre del grupo (ej: Mixto 7)"
                    value={grupo.nombre_grupo}
                    onChange={(e) => updateGrupo(index, { nombre_grupo: e.target.value })}
                    className="bg-[#111111] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] placeholder:text-[#555555]"
                  />
                  <div className="flex items-center gap-2">
                    <Label className="text-[#666666] text-xs whitespace-nowrap">
                      Clase inicial
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={grupo.numero_clase_inicio || ''}
                      onChange={(e) =>
                        updateGrupo(index, { numero_clase_inicio: Number(e.target.value) })
                      }
                      className="bg-[#111111] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] w-24"
                    />
                  </div>
                </div>
                {grupos.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGrupo(index)}
                    className="h-8 w-8 p-0 text-[#666666] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] mt-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}

            {materias.length === 0 && (
              <p className="text-xs text-[#888888]">
                Todavia no hay materias configuradas. Cargalas en Configuracion &gt; Clases para
                poder generar el horario.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1 border-[rgba(201,169,110,0.3)] text-[#888888] hover:bg-[rgba(201,169,110,0.1)]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#C9A96E] text-[#0A0A0A] hover:bg-[#B8986D]"
            >
              {isSubmitting ? 'Creando...' : 'Crear sabado'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
