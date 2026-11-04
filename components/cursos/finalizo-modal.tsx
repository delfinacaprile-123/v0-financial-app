'use client'

import { useState } from 'react'
import { X, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { useRouter } from 'next/navigation'
import { marcarAlumnoFinalizo } from '@/lib/actions'

interface FinalizoModalProps {
  isOpen: boolean
  onClose: () => void
  alumno: Alumno
  onSuccess?: () => void
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function FinalizoModal({ isOpen, onClose, alumno, onSuccess }: FinalizoModalProps) {
  const router = useRouter()
  const hoy = new Date()
  const [loading, setLoading] = useState(false)
  const [mes, setMes] = useState(String(hoy.getMonth() + 1))
  const [anio, setAnio] = useState(String(hoy.getFullYear()))

  if (!isOpen) return null

  const anios = [hoy.getFullYear() - 2, hoy.getFullYear() - 1, hoy.getFullYear(), hoy.getFullYear() + 1]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const fecha = `${anio}-${mes.padStart(2, '0')}-01`
      await marcarAlumnoFinalizo(alumno.id, fecha)
      toast.success('Alumno marcado como egresado')
      router.refresh()
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('[v0] Error marcando como finalizó:', err)
      toast.error('Error al marcar como finalizó')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border/50 bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/20 p-2">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-serif text-xl text-foreground">Marcar como finalizó</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-muted-foreground">
          Indicá en qué mes terminó el curso <span className="font-medium text-foreground">{alumno.nombre}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="mes">Mes</Label>
              <Select value={mes} onValueChange={setMes}>
                <SelectTrigger id="mes" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESES.map((nombre, i) => (
                    <SelectItem key={nombre} value={String(i + 1)}>
                      {nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="anio">Año</Label>
              <Select value={anio} onValueChange={setAnio}>
                <SelectTrigger id="anio" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anios.map((a) => (
                    <SelectItem key={a} value={String(a)}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              El alumno pasará a la pestaña de egresados. Sus pagos no se modifican.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Procesando...' : 'Confirmar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
