'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import type { ClienteConfig } from '@/types/configuracion'

interface ClienteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente: ClienteConfig | null
  onSave: (cliente: Partial<ClienteConfig>) => void
}

export function ClienteModal({ open, onOpenChange, cliente, onSave }: ClienteModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    unidad: 'agencia' as 'agencia' | 'social_tv',
    activo: true,
    monto_mensual: 0,
    metodo_pago: 'transferencia' as 'transferencia' | 'mercadopago' | 'efectivo',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        unidad: cliente.unidad,
        activo: cliente.activo,
        monto_mensual: cliente.monto_mensual || 0,
        metodo_pago: cliente.metodo_pago || 'transferencia',
      })
    } else {
      setFormData({
        nombre: '',
        unidad: 'agencia',
        activo: true,
        monto_mensual: 0,
        metodo_pago: 'transferencia',
      })
    }
  }, [cliente, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    
    if (formData.unidad === 'social_tv' && formData.monto_mensual <= 0) {
      toast.error('El monto mensual es requerido para clientes de Social TV')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const dataToSave: Partial<ClienteConfig> = {
      nombre: formData.nombre,
      unidad: formData.unidad,
      activo: formData.activo,
    }
    
    if (formData.unidad === 'social_tv') {
      dataToSave.monto_mensual = formData.monto_mensual
      dataToSave.metodo_pago = formData.metodo_pago
    }
    
    onSave(dataToSave)
    toast.success(cliente ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente')
    
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
            {cliente ? 'Editar cliente' : 'Nuevo cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-[#888888]">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre del cliente"
              className="bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] placeholder:text-[#555555]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidad" className="text-[#888888]">Unidad de negocio</Label>
            <Select
              value={formData.unidad}
              onValueChange={(value: 'agencia' | 'social_tv') => setFormData({ ...formData, unidad: value })}
            >
              <SelectTrigger className="bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[rgba(201,169,110,0.2)]">
                <SelectItem value="agencia" className="text-[#E5E5E5]">Agencia</SelectItem>
                <SelectItem value="social_tv" className="text-[#E5E5E5]">Social TV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.unidad === 'social_tv' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="monto" className="text-[#888888]">Monto mensual fijo</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]">$</span>
                  <Input
                    id="monto"
                    type="number"
                    value={formData.monto_mensual || ''}
                    onChange={(e) => setFormData({ ...formData, monto_mensual: Number(e.target.value) })}
                    placeholder="380000"
                    className="bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] placeholder:text-[#555555] pl-8"
                  />
                </div>
                {formData.monto_mensual > 0 && (
                  <p className="text-xs text-[#666666]">
                    {formatCurrency(formData.monto_mensual)}/mes
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodo" className="text-[#888888]">Metodo de pago habitual</Label>
                <Select
                  value={formData.metodo_pago}
                  onValueChange={(value: 'transferencia' | 'mercadopago' | 'efectivo') => 
                    setFormData({ ...formData, metodo_pago: value })
                  }
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[rgba(201,169,110,0.2)]">
                    <SelectItem value="transferencia" className="text-[#E5E5E5]">Transferencia</SelectItem>
                    <SelectItem value="mercadopago" className="text-[#E5E5E5]">MercadoPago</SelectItem>
                    <SelectItem value="efectivo" className="text-[#E5E5E5]">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="activo" className="text-[#E5E5E5]">Cliente activo</Label>
              <p className="text-xs text-[#666666] mt-1">
                Los clientes inactivos no aparecen en las listas de seleccion
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
              {isSubmitting ? 'Guardando...' : cliente ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
