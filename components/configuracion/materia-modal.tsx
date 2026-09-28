'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { Materia } from '@/types/clases'

interface MateriaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  materia: Materia | null
  onSave: (data: { numero_clase: number; nombre: string; profe: string; salon: string }) => Promise<void> | void
}

export function MateriaModal({ open, onOpenChange, materia, onSave }: MateriaModalProps) {
  const [formData, setFormData] = useState({ numero_clase: 1, nombre: '', profe: '', salon: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (materia) {
      setFormData({
        numero_clase: materia.numero_clase,
        nombre: materia.nombre,
        profe: materia.profe,
        salon: materia.salon,
      })
    } else {
      setFormData({ numero_clase: 1, nombre: '', profe: '', salon: '' })
    }
  }, [materia, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim() || !formData.profe.trim() || !formData.salon.trim()) {
      toast.error('Completa todos los campos')
      return
    }
    if (formData.numero_clase <= 0) {
      toast.error('El numero de clase debe ser mayor a 0')
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[rgba(201,169,110,0.2)] text-[#E5E5E5] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {materia ? 'Editar materia' : 'Nueva materia'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="numero_clase" className="text-[#888888]">Numero en el programa</Label>
            <Input
              id="numero_clase"
              type="number"
              min={1}
              value={formData.numero_clase || ''}
              onChange={(e) => setFormData({ ...formData, numero_clase: Number(e.target.value) })}
              placeholder="1"
              className="bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] placeholder:text-[#555555]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-[#888888]">Nombre de la materia</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Pasarela 1"
              className="bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] placeholder:text-[#555555]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profe" className="text-[#888888]">Profe</Label>
            <Input
              id="profe"
              value={formData.profe}
              onChange={(e) => setFormData({ ...formData, profe: e.target.value })}
              placeholder="Ej: Yoi"
              className="bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] placeholder:text-[#555555]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salon" className="text-[#888888]">Salon</Label>
            <Input
              id="salon"
              value={formData.salon}
              onChange={(e) => setFormData({ ...formData, salon: e.target.value })}
              placeholder="Ej: Auditorio"
              className="bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] placeholder:text-[#555555]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-[rgba(201,169,110,0.3)] text-[#888888] hover:bg-[rgba(201,169,110,0.1)]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#C9A96E] text-[#0A0A0A] hover:bg-[#B8986D]"
            >
              {isSubmitting ? 'Guardando...' : materia ? 'Guardar cambios' : 'Crear materia'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
