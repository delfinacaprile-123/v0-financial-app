'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { 
  ClienteTV, 
  TipoServicioTV, 
  MetodoPagoTV,
  tipoServicioTVConfig,
  metodoPagoTVConfig 
} from '@/types/social-tv'

interface ClienteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente?: ClienteTV | null
  onSave: (cliente: ClienteTV) => void
}

export function ClienteModal({ open, onOpenChange, cliente, onSave }: ClienteModalProps) {
  const [nombre, setNombre] = useState('')
  const [tipoServicio, setTipoServicio] = useState<TipoServicioTV>('produccion')
  const [montoMensual, setMontoMensual] = useState('')
  const [metodoHabitual, setMetodoHabitual] = useState<MetodoPagoTV>('transferencia')
  const [activo, setActivo] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (cliente) {
      setNombre(cliente.nombre)
      setTipoServicio(cliente.tipo_servicio)
      setMontoMensual(cliente.monto_mensual.toString())
      setMetodoHabitual(cliente.metodo_habitual)
      setActivo(cliente.activo)
    } else {
      setNombre('')
      setTipoServicio('produccion')
      setMontoMensual('')
      setMetodoHabitual('transferencia')
      setActivo(true)
    }
  }, [cliente, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    
    if (!montoMensual || parseFloat(montoMensual) <= 0) {
      toast.error('El monto mensual debe ser mayor a 0')
      return
    }

    setSaving(true)

    const nuevoCliente: ClienteTV = {
      id: cliente?.id || crypto.randomUUID(),
      nombre: nombre.trim(),
      tipo_servicio: tipoServicio,
      monto_mensual: parseFloat(montoMensual),
      metodo_habitual: metodoHabitual,
      activo,
      created_at: cliente?.created_at || new Date().toISOString()
    }

    // La persistencia y el toast de éxito los maneja el componente padre
    onSave(nuevoCliente)
    setSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[rgba(176,158,201,0.3)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#E5E5E5] font-serif text-xl">
            {cliente ? 'Editar cliente' : 'Nuevo cliente'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label className="text-[#888888]">Nombre del cliente</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Melocotón"
              className="bg-[#0A0A0A] border-[rgba(176,158,201,0.2)] text-[#E5E5E5] focus:border-[#B09EC9]"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#888888]">Tipo de servicio</Label>
            <Select value={tipoServicio} onValueChange={(v) => setTipoServicio(v as TipoServicioTV)}>
              <SelectTrigger className="bg-[#0A0A0A] border-[rgba(176,158,201,0.2)] text-[#E5E5E5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[rgba(176,158,201,0.2)]">
                {Object.entries(tipoServicioTVConfig).map(([key, { label }]) => (
                  <SelectItem key={key} value={key} className="text-[#E5E5E5]">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#888888]">Monto mensual fijo (ARS)</Label>
            <Input
              type="number"
              value={montoMensual}
              onChange={(e) => setMontoMensual(e.target.value)}
              placeholder="380000"
              className="bg-[#0A0A0A] border-[rgba(176,158,201,0.2)] text-[#E5E5E5] focus:border-[#B09EC9]"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#888888]">Método de pago habitual</Label>
            <Select value={metodoHabitual} onValueChange={(v) => setMetodoHabitual(v as MetodoPagoTV)}>
              <SelectTrigger className="bg-[#0A0A0A] border-[rgba(176,158,201,0.2)] text-[#E5E5E5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[rgba(176,158,201,0.2)]">
                {Object.entries(metodoPagoTVConfig).map(([key, { label }]) => (
                  <SelectItem key={key} value={key} className="text-[#E5E5E5]">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <Label className="text-[#888888]">Cliente activo</Label>
            <Switch
              checked={activo}
              onCheckedChange={setActivo}
              className="data-[state=checked]:bg-[#B09EC9]"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-[rgba(176,158,201,0.3)] text-[#888888] hover:bg-[rgba(176,158,201,0.1)]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#B09EC9] hover:bg-[#9B8AB8] text-[#0A0A0A] font-medium"
            >
              {saving ? 'Guardando...' : (cliente ? 'Guardar cambios' : 'Crear cliente')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
