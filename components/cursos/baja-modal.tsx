'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
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

interface BajaModalProps {
  isOpen: boolean
  onClose: () => void
  alumno: Alumno
  onSuccess?: () => void
}

export function BajaModal({ isOpen, onClose, alumno, onSuccess }: BajaModalProps) {
  const [loading, setLoading] = useState(false)
  const [tipoBaja, setTipoBaja] = useState<'definitiva' | 'temporal'>('temporal')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    toast.success(`Alumno dado de baja ${tipoBaja}`)
    onSuccess?.()
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border/50 bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/20 p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <h2 className="font-serif text-xl text-foreground">Dar de baja</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-muted-foreground">
          Estas por dar de baja a <span className="font-medium text-foreground">{alumno.nombre}</span>.
          Selecciona el tipo de baja:
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de baja</Label>
            <Select value={tipoBaja} onValueChange={(v) => setTipoBaja(v as typeof tipoBaja)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temporal">
                  Temporal (puede reincorporarse)
                </SelectItem>
                <SelectItem value="definitiva">
                  Definitiva (no volvera)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              {tipoBaja === 'temporal' 
                ? 'El alumno podra ser reincorporado mas adelante desde la pestana de bajas.'
                : 'El alumno quedara registrado como baja definitiva.'}
            </p>
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
              variant="destructive"
              className="flex-1"
            >
              {loading ? 'Procesando...' : 'Confirmar baja'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
