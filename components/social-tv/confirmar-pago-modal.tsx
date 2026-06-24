'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  ClienteTVConPago, 
  MetodoPagoTV,
  PagoMensualTV,
  formatARS,
  metodoPagoTVConfig 
} from '@/types/social-tv'

interface ConfirmarPagoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente: ClienteTVConPago | null
  mesActual: string
  onConfirm: (pago: PagoMensualTV) => void
}

export function ConfirmarPagoModal({ 
  open, 
  onOpenChange, 
  cliente, 
  mesActual,
  onConfirm 
}: ConfirmarPagoModalProps) {
  const [monto, setMonto] = useState('')
  const [fechaPago, setFechaPago] = useState('')
  const [metodoPago, setMetodoPago] = useState<MetodoPagoTV>('transferencia')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (cliente && open) {
      setMonto(cliente.monto_mensual.toString())
      setFechaPago(new Date().toISOString().split('T')[0])
      setMetodoPago(cliente.metodo_habitual)
    }
  }, [cliente, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cliente) return
    
    if (!monto || parseFloat(monto) <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }
    
    if (!fechaPago) {
      toast.error('La fecha de pago es requerida')
      return
    }

    setSaving(true)

    const pago: PagoMensualTV = {
      id: crypto.randomUUID(),
      cliente_id: cliente.id,
      mes: mesActual,
      monto: parseFloat(monto),
      pagado: true,
      fecha_pago: fechaPago,
      metodo_pago: metodoPago,
      created_at: new Date().toISOString()
    }

    // La persistencia y el toast de éxito los maneja el componente padre
    onConfirm(pago)
    setSaving(false)
    onOpenChange(false)
  }

  if (!cliente) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[rgba(176,158,201,0.3)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#E5E5E5] font-serif text-xl">
            Confirmar pago
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="bg-[#0A0A0A] border border-[rgba(176,158,201,0.2)] rounded-lg p-4">
            <p className="text-[#888888] text-sm">Cliente</p>
            <p className="text-[#E5E5E5] font-medium">{cliente.nombre}</p>
            <p className="text-[#B09EC9] text-sm mt-1">
              Monto habitual: {formatARS(cliente.monto_mensual)}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#888888]">Monto (ARS)</Label>
            <Input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="bg-[#0A0A0A] border-[rgba(176,158,201,0.2)] text-[#E5E5E5] focus:border-[#B09EC9]"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#888888]">Fecha de pago</Label>
            <Input
              type="date"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              className="bg-[#0A0A0A] border-[rgba(176,158,201,0.2)] text-[#E5E5E5] focus:border-[#B09EC9]"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#888888]">Método de pago</Label>
            <Select value={metodoPago} onValueChange={(v) => setMetodoPago(v as MetodoPagoTV)}>
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
              {saving ? 'Registrando...' : 'Confirmar pago'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
