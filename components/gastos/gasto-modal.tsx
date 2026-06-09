'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type {
  Gasto,
  CategoriaGasto,
  FrecuenciaGasto,
  MetodoGasto,
} from '@/types/gastos'
import { CATEGORIA_LABELS, FRECUENCIA_LABELS, METODO_LABELS } from '@/types/gastos'

interface GastoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (gasto: Omit<Gasto, 'id' | 'created_at'>) => void
  gasto?: Gasto | null
}

const MESES_OPCIONES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function GastoModal({ open, onOpenChange, onSave, gasto }: GastoModalProps) {
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState<CategoriaGasto>('gasto_fijo')
  const [monto, setMonto] = useState('')
  const [frecuencia, setFrecuencia] = useState<FrecuenciaGasto>('mensual')
  const [metodo, setMetodo] = useState<MetodoGasto>('transferencia')
  const [fechaPago, setFechaPago] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [mesCorrespondiente, setMesCorrespondiente] = useState<string>(
    MESES_OPCIONES[new Date().getMonth()]
  )
  const [pagado, setPagado] = useState(false)
  const [notas, setNotas] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (gasto) {
      setNombre(gasto.nombre)
      setCategoria(gasto.categoria)
      setMonto(gasto.monto.toString())
      setFrecuencia(gasto.frecuencia)
      setMetodo(gasto.metodo)
      setFechaPago(gasto.fecha_pago)
      setMesCorrespondiente(gasto.mes_correspondiente || MESES_OPCIONES[new Date().getMonth()])
      setPagado(gasto.pagado)
      setNotas(gasto.notas || '')
    } else {
      setNombre('')
      setCategoria('gasto_fijo')
      setMonto('')
      setFrecuencia('mensual')
      setMetodo('transferencia')
      setFechaPago(format(new Date(), 'yyyy-MM-dd'))
      setMesCorrespondiente(MESES_OPCIONES[new Date().getMonth()])
      setPagado(false)
      setNotas('')
    }
  }, [gasto, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    if (!monto || parseFloat(monto) <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }

    setIsSubmitting(true)
    try {
      onSave({
        nombre: nombre.trim(),
        categoria,
        monto: parseFloat(monto),
        frecuencia,
        metodo,
        fecha_pago: fechaPago,
        mes_correspondiente: mesCorrespondiente,
        pagado,
        notas: notas.trim() || null,
      })
      onOpenChange(false)
    } catch {
      toast.error('Error al guardar el gasto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[#2A2A2A] text-[#E5E5E5] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#E5E5E5]">
            {gasto ? 'Editar gasto' : 'Nuevo gasto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#888888]">Nombre</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]"
              placeholder="Ej: Alquiler estudio, Sueldo Ana"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#888888]">Categoría</Label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as CategoriaGasto)}>
              <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                {(Object.keys(CATEGORIA_LABELS) as CategoriaGasto[]).map((c) => (
                  <SelectItem key={c} value={c} className="text-[#E5E5E5]">
                    {CATEGORIA_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#888888]">Monto</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]">$</span>
              <Input
                type="text"
                value={monto}
                onChange={(e) => setMonto(e.target.value.replace(/[^\d]/g, ''))}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5] pl-7"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[#888888]">Frecuencia</Label>
              <Select value={frecuencia} onValueChange={(v) => setFrecuencia(v as FrecuenciaGasto)}>
                <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  {(Object.keys(FRECUENCIA_LABELS) as FrecuenciaGasto[]).map((f) => (
                    <SelectItem key={f} value={f} className="text-[#E5E5E5]">
                      {FRECUENCIA_LABELS[f]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#888888]">Método</Label>
              <Select value={metodo} onValueChange={(v) => setMetodo(v as MetodoGasto)}>
                <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  {(Object.keys(METODO_LABELS) as MetodoGasto[]).map((m) => (
                    <SelectItem key={m} value={m} className="text-[#E5E5E5]">
                      {METODO_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[#888888]">Fecha de pago</Label>
              <Input
                type="date"
                value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#888888]">Mes correspondiente</Label>
              <Select value={mesCorrespondiente} onValueChange={setMesCorrespondiente}>
                <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  {MESES_OPCIONES.map((m) => (
                    <SelectItem key={m} value={m} className="text-[#E5E5E5]">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#1A1A1A] border border-[#2A2A2A] rounded-md px-3 py-2.5">
            <Label className="text-[#E5E5E5]">¿Pagado?</Label>
            <Switch checked={pagado} onCheckedChange={setPagado} />
          </div>

          <div className="space-y-2">
            <Label className="text-[#888888]">Notas (opcional)</Label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5] min-h-[70px]"
              placeholder="Detalles adicionales"
            />
          </div>

          <div className="flex gap-3 pt-2">
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
              className="flex-1 bg-[#C9A96E] hover:bg-[#B89860] text-black"
            >
              {isSubmitting ? 'Guardando...' : gasto ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
