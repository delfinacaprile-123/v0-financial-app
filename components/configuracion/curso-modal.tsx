'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import type { CursoConfig } from '@/types/configuracion'

interface CursoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  curso: CursoConfig | null
  onSave: (curso: Partial<CursoConfig>) => void
}

export function CursoModal({ open, onOpenChange, curso, onSave }: CursoModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    precio_mensual: 0,
    activo: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (curso) {
      setFormData({
        nombre: curso.nombre,
        precio_mensual: curso.precio_mensual,
        activo: curso.activo,
      })
    } else {
      setFormData({
        nombre: '',
        precio_mensual: 0,
        activo: true,
      })
    }
  }, [curso, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    
    if (formData.precio_mensual <= 0) {
      toast.error('El precio debe ser mayor a 0')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    onSave(formData)
    toast.success(curso ? 'Curso actualizado correctamente' : 'Curso creado correctamente')
    
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[rgba(201,169,110,0.2)] text-[#E5E5E5] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {curso ? 'Editar curso' : 'Nuevo curso'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-[#888888]">Nombre del curso</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Modelaje Profesional"
              className="bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] placeholder:text-[#555555]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="precio" className="text-[#888888]">Precio mensual</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]">$</span>
              <Input
                id="precio"
                type="number"
                value={formData.precio_mensual || ''}
                onChange={(e) => setFormData({ ...formData, precio_mensual: Number(e.target.value) })}
                placeholder="85000"
                className="bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] placeholder:text-[#555555] pl-8"
              />
            </div>
            {formData.precio_mensual > 0 && (
              <p className="text-xs text-[#666666]">
                {formatCurrency(formData.precio_mensual)}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="activo" className="text-[#E5E5E5]">Curso activo</Label>
              <p className="text-xs text-[#666666] mt-1">
                Los cursos inactivos no permiten nuevas inscripciones
              </p>
            </div>
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              className="data-[state=checked]:bg-[#C9A96E]"
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
              {isSubmitting ? 'Guardando...' : curso ? 'Guardar cambios' : 'Crear curso'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
