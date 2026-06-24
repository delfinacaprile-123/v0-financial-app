'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alumno } from '@/types/cursos'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { registrarPagoCurso } from '@/lib/actions'

interface PagoModalProps {
  isOpen: boolean
  onClose: () => void
  alumno: Alumno
  onSuccess?: () => void
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function PagoModal({ isOpen, onClose, alumno, onSuccess }: PagoModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fechaPago, setFechaPago] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [concepto, setConcepto] = useState('Cuota mensual')
  const [monto, setMonto] = useState('')
  const [metodo, setMetodo] = useState<'transferencia' | 'mercadopago' | 'efectivo'>('transferencia')
  const [mesCorrespondiente, setMesCorrespondiente] = useState(
    `${MESES[new Date().getMonth()]} ${new Date().getFullYear()}`
  )

  if (!isOpen) return null

  // Calculate the amount the student should pay
  const calcularMontoEsperado = () => {
    if (alumno.tipo === 'beca') return 0
    if (alumno.monto_personalizado) return alumno.monto_personalizado
    if (alumno.tipo === 'descuento' && alumno.curso) {
      return alumno.curso.precio_mensual * (1 - alumno.descuento_pct / 100)
    }
    return alumno.curso?.precio_mensual || 0
  }

  const montoEsperado = calcularMontoEsperado()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await registrarPagoCurso({
        alumno_id: alumno.id,
        fecha_pago: fechaPago,
        concepto,
        monto: monto ? parseFloat(monto) : montoEsperado,
        metodo,
        mes_correspondiente: mesCorrespondiente,
      })
      toast.success('Pago registrado correctamente')
      router.refresh()
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('[v0] Error registrando pago:', err)
      toast.error('Error al registrar el pago')
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const mesOptions = MESES.flatMap(mes => [
    `${mes} ${currentYear - 1}`,
    `${mes} ${currentYear}`,
    `${mes} ${currentYear + 1}`,
  ])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border/50 bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl text-foreground">Registrar Pago</h2>
            <p className="mt-1 text-sm text-muted-foreground">{alumno.nombre}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha de pago</Label>
            <Input
              id="fecha"
              type="date"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mes">Mes correspondiente</Label>
            <Select value={mesCorrespondiente} onValueChange={setMesCorrespondiente}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {mesOptions.map((mes) => (
                  <SelectItem key={mes} value={mes}>
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="concepto">Concepto</Label>
            <Input
              id="concepto"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Cuota mensual"
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto</Label>
            <Input
              id="monto"
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder={`Esperado: $${montoEsperado.toLocaleString()}`}
              className="bg-background"
            />
            {alumno.tipo === 'beca' && (
              <p className="text-xs text-amber-500">
                Este alumno tiene beca completa
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodo">Metodo de pago</Label>
            <Select value={metodo} onValueChange={(v) => setMetodo(v as typeof metodo)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="mercadopago">MercadoPago</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Curso:</span>
              <span className="text-foreground">{alumno.curso?.nombre}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tipo:</span>
              <span className="capitalize text-foreground">{alumno.tipo}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Registrando...' : 'Registrar pago'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
