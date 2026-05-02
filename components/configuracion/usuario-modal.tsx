'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { UsuarioConfig } from '@/types/configuracion'

interface UsuarioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario: UsuarioConfig | null
  onSave: (usuario: Partial<UsuarioConfig>) => void
  mode: 'invite' | 'edit'
}

export function UsuarioModal({ open, onOpenChange, usuario, onSave, mode }: UsuarioModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'administrativa' as 'admin' | 'administrativa',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (usuario && mode === 'edit') {
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      })
    } else {
      setFormData({
        nombre: '',
        email: '',
        rol: 'administrativa',
      })
    }
  }, [usuario, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    
    if (mode === 'invite' && !formData.email.trim()) {
      toast.error('El email es requerido')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    onSave(formData)
    
    if (mode === 'invite') {
      toast.success('Invitacion enviada correctamente', {
        description: `Se envio un email de invitacion a ${formData.email}`,
      })
    } else {
      toast.success('Usuario actualizado correctamente')
    }
    
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[rgba(201,169,110,0.2)] text-[#E5E5E5] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'invite' ? 'Invitar usuario' : 'Editar usuario'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === 'invite' && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#888888]">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ejemplo@email.com"
                className="bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] placeholder:text-[#555555]"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-[#888888]">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre completo"
              className="bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] placeholder:text-[#555555]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol" className="text-[#888888]">Rol</Label>
            <Select
              value={formData.rol}
              onValueChange={(value: 'admin' | 'administrativa') => setFormData({ ...formData, rol: value })}
            >
              <SelectTrigger className="bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[rgba(201,169,110,0.2)]">
                <SelectItem value="admin" className="text-[#E5E5E5]">Admin</SelectItem>
                <SelectItem value="administrativa" className="text-[#E5E5E5]">Administrativa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === 'invite' && (
            <p className="text-xs text-[#666666] bg-[#0A0A0A] p-3 rounded-lg">
              Se enviara un email de invitacion con instrucciones para configurar la cuenta.
            </p>
          )}

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
              {isSubmitting ? 'Guardando...' : mode === 'invite' ? 'Enviar invitacion' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
