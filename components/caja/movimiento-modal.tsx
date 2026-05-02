'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { Movimiento, TipoMovimiento, PersonaCaja } from '@/types/caja'

interface MovimientoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (movimiento: Omit<Movimiento, 'id' | 'created_at'>) => void
  movimiento?: Movimiento | null
  saldoSecretaria: number
  saldoMama: number
}

export function MovimientoModal({ 
  open, 
  onOpenChange, 
  onSave, 
  movimiento,
  saldoSecretaria,
  saldoMama
}: MovimientoModalProps) {
  const [tipo, setTipo] = useState<TipoMovimiento>('ingreso')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [enPoderDe, setEnPoderDe] = useState<PersonaCaja>('secretaria')
  const [de, setDe] = useState<PersonaCaja>('secretaria')
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (movimiento) {
      setTipo(movimiento.tipo)
      setDescripcion(movimiento.descripcion)
      setMonto(movimiento.monto.toString())
      setEnPoderDe(movimiento.enPoderDe)
      setDe(movimiento.de || 'secretaria')
      setFecha(movimiento.fecha)
    } else {
      setTipo('ingreso')
      setDescripcion('')
      setMonto('')
      setEnPoderDe('secretaria')
      setDe('secretaria')
      setFecha(format(new Date(), 'yyyy-MM-dd'))
    }
  }, [movimiento, open])

  const validateSaldo = (): boolean => {
    const montoNum = parseFloat(monto)
    
    if (tipo === 'egreso') {
      const saldoActual = enPoderDe === 'secretaria' ? saldoSecretaria : saldoMama
      if (montoNum > saldoActual) {
        toast.error(`Saldo insuficiente. ${enPoderDe === 'secretaria' ? 'Secretaria' : 'Mama'} solo tiene $${saldoActual.toLocaleString('es-AR')}`)
        return false
      }
    }
    
    if (tipo === 'transferencia') {
      const saldoOrigen = de === 'secretaria' ? saldoSecretaria : saldoMama
      if (montoNum > saldoOrigen) {
        toast.error(`Saldo insuficiente. ${de === 'secretaria' ? 'Secretaria' : 'Mama'} solo tiene $${saldoOrigen.toLocaleString('es-AR')}`)
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!descripcion.trim() && tipo !== 'transferencia') {
      toast.error('La descripcion es requerida')
      return
    }
    
    if (!monto || parseFloat(monto) <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }

    if (!validateSaldo()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const para: PersonaCaja = de === 'secretaria' ? 'mama' : 'secretaria'
      
      onSave({
        fecha,
        tipo,
        descripcion: tipo === 'transferencia' && !descripcion.trim() 
          ? `${de === 'secretaria' ? 'Secretaria' : 'Mama'} → ${para === 'secretaria' ? 'Secretaria' : 'Mama'}`
          : descripcion,
        monto: parseFloat(monto),
        enPoderDe: tipo === 'transferencia' ? para : enPoderDe,
        de: tipo === 'transferencia' ? de : undefined,
        para: tipo === 'transferencia' ? para : undefined,
        registradoPor: 'Admin'
      })
      
      toast.success(movimiento ? 'Movimiento actualizado' : 'Movimiento registrado')
      onOpenChange(false)
    } catch {
      toast.error('Error al guardar el movimiento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatMonto = (value: string) => {
    const num = value.replace(/[^\d]/g, '')
    return num
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[#2A2A2A] text-[#E5E5E5] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#E5E5E5]">
            {movimiento ? 'Editar movimiento' : 'Nuevo movimiento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#888888]">Tipo de movimiento</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoMovimiento)}>
              <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <SelectItem value="ingreso" className="text-[#E5E5E5]">
                  <span className="flex items-center gap-2">
                    <span className="text-green-500">$</span> Ingreso
                  </span>
                </SelectItem>
                <SelectItem value="egreso" className="text-[#E5E5E5]">
                  <span className="flex items-center gap-2">
                    <span className="text-red-500">$</span> Egreso
                  </span>
                </SelectItem>
                <SelectItem value="transferencia" className="text-[#E5E5E5]">
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">↔</span> Transferencia interna
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipo === 'transferencia' ? (
            <>
              <div className="space-y-2">
                <Label className="text-[#888888]">De</Label>
                <Select value={de} onValueChange={(v) => setDe(v as PersonaCaja)}>
                  <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <SelectItem value="secretaria" className="text-[#E5E5E5]">
                      Secretaria (${saldoSecretaria.toLocaleString('es-AR')})
                    </SelectItem>
                    <SelectItem value="mama" className="text-[#E5E5E5]">
                      Mama (${saldoMama.toLocaleString('es-AR')})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#888888]">Para</Label>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md px-3 py-2 text-[#888888]">
                  {de === 'secretaria' ? 'Mama' : 'Secretaria'}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label className="text-[#888888]">
                {tipo === 'ingreso' ? 'En poder de' : 'Pagado por'}
              </Label>
              <Select value={enPoderDe} onValueChange={(v) => setEnPoderDe(v as PersonaCaja)}>
                <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  <SelectItem value="secretaria" className="text-[#E5E5E5]">
                    Secretaria {tipo === 'egreso' && `(${saldoSecretaria.toLocaleString('es-AR')})`}
                  </SelectItem>
                  <SelectItem value="mama" className="text-[#E5E5E5]">
                    Mama {tipo === 'egreso' && `(${saldoMama.toLocaleString('es-AR')})`}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[#888888]">Monto</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]">$</span>
              <Input
                type="text"
                value={monto}
                onChange={(e) => setMonto(formatMonto(e.target.value))}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5] pl-7"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#888888]">
              Descripcion {tipo === 'transferencia' && '(opcional)'}
            </Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5] min-h-[80px]"
              placeholder={
                tipo === 'ingreso' 
                  ? 'Ej: Pago cuota alumna Valentina — abril'
                  : tipo === 'egreso'
                  ? 'Ej: Compra materiales, Viaticos'
                  : 'Ej: Entrega semanal'
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#888888]">Fecha</Label>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-[#2A2A2A] text-[#888888] hover:bg-[#1A1A1A]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#7EC99A] hover:bg-[#6BB889] text-black"
            >
              {isSubmitting ? 'Guardando...' : movimiento ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
