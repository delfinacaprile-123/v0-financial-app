'use client'

import { useState, useEffect } from 'react'
import { X, MessageSquareWarning } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createSolicitudCorreccion } from '@/lib/actions'

interface SolicitarCorreccionModalProps {
  isOpen: boolean
  onClose: () => void
  modulo: string
  /** Texto inicial opcional para pre-poblar la descripcion (ej: referencia al pago) */
  defaultDescripcion?: string
  onSuccess?: () => void
}

export function SolicitarCorreccionModal({
  isOpen,
  onClose,
  modulo,
  defaultDescripcion = '',
  onSuccess,
}: SolicitarCorreccionModalProps) {
  const [loading, setLoading] = useState(false)
  const [descripcion, setDescripcion] = useState(defaultDescripcion)

  // Sincroniza el valor por defecto cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) setDescripcion(defaultDescripcion)
  }, [isOpen, defaultDescripcion])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!descripcion.trim()) {
      toast.error('Describi que hay que corregir')
      return
    }
    setLoading(true)
    try {
      await createSolicitudCorreccion({ descripcion: descripcion.trim(), modulo })
      toast.success('Solicitud de correccion enviada')
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('[v0] Error creando solicitud de correccion:', err)
      toast.error('Error al enviar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border/50 bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-500/20 p-2">
              <MessageSquareWarning className="h-5 w-5 text-amber-400" />
            </div>
            <h2 className="font-serif text-xl text-foreground">Solicitar correccion</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          Describi que hay que cambiar. La solicitud le llegara a Maria para que la resuelva.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripcion del cambio</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: El pago de marzo de Juan Perez tiene el monto equivocado, deberia ser $15.000"
              className="min-h-28 bg-background"
              autoFocus
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
              {loading ? 'Enviando...' : 'Enviar solicitud'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
