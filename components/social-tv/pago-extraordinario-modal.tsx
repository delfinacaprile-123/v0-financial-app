'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  ClienteTV, 
  MetodoPagoTV,
  PagoExtraordinarioTV,
  metodoPagoTVConfig 
} from '@/types/social-tv'

interface PagoExtraordinarioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientes: ClienteTV[]
  pagoEdit?: PagoExtraordinarioTV | null
  onSave: (pago: PagoExtraordinarioTV) => void
}

export function PagoExtraordinarioModal({ 
  open, 
  onOpenChange, 
  clientes,
  pagoEdit,
  onSave 
}: PagoExtraordinarioModalProps) {
  const [clienteId, setClienteId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState('')
  const [metodoPago, setMetodoPago] = useState<MetodoPagoTV>('transferencia')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (pagoEdit) {
      setClienteId(pagoEdit.cliente_id)
      setDescripcion(pagoEdit.descripcion)
      setMonto(pagoEdit.monto.toString())
      setFecha(pagoEdit.fecha)
      setMetodoPago(pagoEdit.metodo_pago)
    } else {
      setClienteId('')
      setDescripcion('')
      setMonto('')
      setFecha(new Date().toISOString().split('T')[0])
      setMetodoPago('transferencia')
    }
  }, [pagoEdit, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!clienteId) {
      toast.error('Selecciona un cliente')
      return
    }
    
    if (!descripcion.trim()) {
      toast.error('La descripcion es requerida')
      return
    }
    
    if (!monto || parseFloat(monto) <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }
    
    if (!fecha) {
      toast.error('La fecha es requerida')
      return
    }

    setSaving(true)

    const cliente = clientes.find(c => c.id === clienteId)

    const pago: PagoExtraordinarioTV = {
      id: pagoEdit?.id || crypto.randomUUID(),
      cliente_id: clienteId,
      cliente_nombre: cliente?.nombre,
      descripcion: descripcion.trim(),
      monto: parseFloat(monto),
      fecha,
      metodo_pago: metodoPago,
      created_at: pagoEdit?.created_at || new Date().toISOString()
    }

    // La persistencia y el toast de éxito los maneja el componente padre
    onSave(pago)
    setSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[rgba(176,158,201,0.3)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#E5E5E5] font-serif text-xl">
            {pagoEdit ? 'Editar pago extraordinario' : 'Nuevo pago extraordinario'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label className="text-[#888888]">Cliente</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger className="bg-[#0A0A0A] border-[rgba(176,158,201,0.2)] text-[#E5E5E5]">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[rgba(176,158,201,0.2)]">
                {clientes.filter(c => c.activo).map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id} className="text-[#E5E5E5]">
                    {cliente.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#888888]">Descripcion</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Desfile extra evento, Produccion especial..."
              rows={2}
              className="bg-[#0A0A0A] border-[rgba(176,158,201,0.2)] text-[#E5E5E5] focus:border-[#B09EC9] resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#888888]">Monto (ARS)</Label>
            <Input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="150000"
              className="bg-[#0A0A0A] border-[rgba(176,158,201,0.2)] text-[#E5E5E5] focus:border-[#B09EC9]"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#888888]">Fecha</Label>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="bg-[#0A0A0A] border-[rgba(176,158,201,0.2)] text-[#E5E5E5] focus:border-[#B09EC9]"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#888888]">Metodo de pago</Label>
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
              {saving ? 'Guardando...' : (pagoEdit ? 'Guardar cambios' : 'Registrar pago')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
