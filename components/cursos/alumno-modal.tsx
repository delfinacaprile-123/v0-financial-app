'use client'

import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Curso, Alumno } from '@/types/cursos'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createAlumno, updateAlumno } from '@/lib/actions'

interface AlumnoModalProps {
  isOpen: boolean
  onClose: () => void
  cursos: Curso[]
  alumno?: Alumno | null
}

export function AlumnoModal({ isOpen, onClose, cursos, alumno }: AlumnoModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<'normal' | 'beca' | 'descuento'>('normal')
  const [descuentoPct, setDescuentoPct] = useState(0)
  const [montoPersonalizado, setMontoPersonalizado] = useState<string>('')
  const [cursoId, setCursoId] = useState('')
  const [notas, setNotas] = useState('')

  const isEditing = !!alumno

  useEffect(() => {
    if (alumno) {
      setNombre(alumno.nombre)
      setTipo(alumno.tipo)
      setDescuentoPct(alumno.descuento_pct)
      setMontoPersonalizado(alumno.monto_personalizado?.toString() || '')
      setCursoId(alumno.curso_id)
      setNotas(alumno.notas || '')
    } else {
      setNombre('')
      setTipo('normal')
      setDescuentoPct(0)
      setMontoPersonalizado('')
      setCursoId(cursos[0]?.id || '')
      setNotas('')
    }
  }, [alumno, cursos, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      nombre,
      tipo,
      descuento_pct: tipo === 'descuento' ? descuentoPct : 0,
      monto_personalizado:
        tipo === 'normal' && montoPersonalizado ? parseFloat(montoPersonalizado) : undefined,
      curso_id: cursoId,
      notas: notas || undefined,
    }

    try {
      if (isEditing && alumno) {
        await updateAlumno(alumno.id, payload)
        toast.success('Alumno actualizado correctamente')
      } else {
        await createAlumno(payload)
        toast.success('Alumno creado correctamente')
      }
      router.refresh()
      onClose()
    } catch (err) {
      console.error('[v0] Error guardando alumno:', err)
      toast.error('Error al guardar el alumno')
    } finally {
      setLoading(false)
    }
  }

  const selectedCurso = cursos.find(c => c.id === cursoId)
  const precioFinal = tipo === 'beca' 
    ? 0 
    : tipo === 'descuento' 
      ? (selectedCurso?.precio_mensual || 0) * (1 - descuentoPct / 100)
      : montoPersonalizado 
        ? parseFloat(montoPersonalizado) 
        : selectedCurso?.precio_mensual || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border/50 bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl text-foreground">
            {isEditing ? 'Editar Alumno' : 'Nuevo Alumno'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del alumno"
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="curso">Curso</Label>
            <Select value={cursoId} onValueChange={setCursoId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Seleccionar curso" />
              </SelectTrigger>
              <SelectContent>
                {cursos.map((curso) => (
                  <SelectItem key={curso.id} value={curso.id}>
                    {curso.nombre} - ${curso.precio_mensual.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de alumno</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as typeof tipo)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="beca">Beca (100% gratis)</SelectItem>
                <SelectItem value="descuento">Con descuento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipo === 'descuento' && (
            <div className="space-y-2">
              <Label htmlFor="descuento">Porcentaje de descuento</Label>
              <Input
                id="descuento"
                type="number"
                min="0"
                max="100"
                value={descuentoPct}
                onChange={(e) => setDescuentoPct(parseInt(e.target.value) || 0)}
                className="bg-background"
              />
            </div>
          )}

          {tipo === 'normal' && (
            <div className="space-y-2">
              <Label htmlFor="monto">Monto personalizado (opcional)</Label>
              <Input
                id="monto"
                type="number"
                value={montoPersonalizado}
                onChange={(e) => setMontoPersonalizado(e.target.value)}
                placeholder={`Por defecto: $${selectedCurso?.precio_mensual.toLocaleString() || 0}`}
                className="bg-background"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones sobre el alumno..."
              rows={3}
              className="bg-background"
            />
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              Monto mensual a pagar:{' '}
              <span className="font-semibold text-primary">
                ${precioFinal.toLocaleString()}
              </span>
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
              disabled={loading || !nombre || !cursoId}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear alumno'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
