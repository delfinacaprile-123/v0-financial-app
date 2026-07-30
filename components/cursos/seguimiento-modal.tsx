'use client'

import { useState } from 'react'
import { X, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Alumno,
  TipoSeguimiento,
  ResultadoSeguimiento,
  tipoSeguimientoConfig,
  resultadoSeguimientoConfig,
} from '@/types/cursos'
import { createSeguimiento } from '@/lib/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SeguimientoModalProps {
  isOpen: boolean
  onClose: () => void
  alumno: Alumno
  onSuccess?: () => void
}

export function SeguimientoModal({ isOpen, onClose, alumno, onSuccess }: SeguimientoModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tipo, setTipo] = useState<TipoSeguimiento>('llamado')
  const [resultado, setResultado] = useState<ResultadoSeguimiento>('no_contesta')
  const [quien, setQuien] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [notas, setNotas] = useState('')

  if (!isOpen) return null

  const resetForm = () => {
    setTipo('llamado')
    setResultado('no_contesta')
    setQuien('')
    setFecha(new Date().toISOString().split('T')[0])
    setNotas('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quien.trim()) {
      toast.error('Indica quien realizo el seguimiento')
      return
    }
    setLoading(true)

    try {
      await createSeguimiento({
        alumno_id: alumno.id,
        tipo,
        resultado,
        quien: quien.trim(),
        fecha,
        notas: notas.trim() || undefined,
      })
      toast.success('Seguimiento registrado')
      resetForm()
      router.refresh()
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('[v0] Error registrando seguimiento:', err)
      toast.error('Error al registrar el seguimiento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border/50 bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/20 p-2">
              <PhoneCall className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-serif text-xl text-foreground">Registrar seguimiento</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-muted-foreground">
          Seguimiento de <span className="font-medium text-foreground">{alumno.nombre}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoSeguimiento)}>
                <SelectTrigger id="tipo" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoSeguimientoConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resultado">Resultado</Label>
              <Select value={resultado} onValueChange={(v) => setResultado(v as ResultadoSeguimiento)}>
                <SelectTrigger id="resultado" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(resultadoSeguimientoConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quien">Quien</Label>
              <Input
                id="quien"
                value={quien}
                onChange={(e) => setQuien(e.target.value)}
                placeholder="Nombre"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Detalles del contacto..."
              className="bg-background"
              rows={3}
            />
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
              {loading ? 'Guardando...' : 'Guardar seguimiento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
