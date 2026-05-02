'use client'

import { useState, useEffect } from 'react'
import { X, CreditCard, Edit2, UserMinus, RotateCcw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alumno, PagoCurso, Curso } from '@/types/cursos'
import { getAlumnoById, getPagosByAlumno, reincorporarAlumno } from '@/app/(dashboard)/cursos/actions'
import { AlumnoModal } from './alumno-modal'
import { PagoModal } from './pago-modal'
import { BajaModal } from './baja-modal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface AlumnoPanelProps {
  alumnoId: string
  cursos: Curso[]
  onClose: () => void
}

export function AlumnoPanel({ alumnoId, cursos, onClose }: AlumnoPanelProps) {
  const [alumno, setAlumno] = useState<Alumno | null>(null)
  const [pagos, setPagos] = useState<PagoCurso[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPagoModal, setShowPagoModal] = useState(false)
  const [showBajaModal, setShowBajaModal] = useState(false)
  const [reincorporando, setReincorporando] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [alumnoData, pagosData] = await Promise.all([
        getAlumnoById(alumnoId),
        getPagosByAlumno(alumnoId),
      ])
      setAlumno(alumnoData)
      setPagos(pagosData)
    } catch {
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [alumnoId])

  const handleReincorporar = async () => {
    if (!alumno) return
    setReincorporando(true)
    try {
      await reincorporarAlumno(alumno.id)
      toast.success('Alumno reincorporado correctamente')
      fetchData()
    } catch {
      toast.error('Error al reincorporar')
    } finally {
      setReincorporando(false)
    }
  }

  const calcularMontoEsperado = () => {
    if (!alumno) return 0
    if (alumno.tipo === 'beca') return 0
    if (alumno.monto_personalizado) return alumno.monto_personalizado
    if (alumno.tipo === 'descuento' && alumno.curso) {
      return alumno.curso.precio_mensual * (1 - alumno.descuento_pct / 100)
    }
    return alumno.curso?.precio_mensual || 0
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <Badge className="bg-emerald-500/20 text-emerald-400">Activo</Badge>
      case 'atrasado':
        return <Badge className="bg-amber-500/20 text-amber-400">Atrasado</Badge>
      case 'baja':
        return <Badge className="bg-red-500/20 text-red-400">Baja</Badge>
      default:
        return null
    }
  }

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'beca':
        return <Badge variant="outline" className="border-primary/50 text-primary">Beca</Badge>
      case 'descuento':
        return <Badge variant="outline" className="border-blue-500/50 text-blue-400">Descuento</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md items-center justify-center border-l border-border/50 bg-card shadow-2xl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!alumno) return null

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto border-l border-border/50 bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-card/95 p-4 backdrop-blur-sm">
          <h2 className="font-serif text-xl text-foreground">{alumno.nombre}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Status & Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getEstadoBadge(alumno.estado)}
              {getTipoBadge(alumno.tipo)}
              {alumno.es_reincorporacion && (
                <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                  Reincorporado
                </Badge>
              )}
            </div>

            <div className="rounded-lg bg-muted/30 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Curso:</span>
                <span className="text-foreground">{alumno.curso?.nombre}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto mensual:</span>
                <span className="font-medium text-primary">
                  ${calcularMontoEsperado().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Inscripcion:</span>
                <span className="text-foreground">
                  {format(new Date(alumno.fecha_inscripcion), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
              {alumno.tipo === 'descuento' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento:</span>
                  <span className="text-foreground">{alumno.descuento_pct}%</span>
                </div>
              )}
              {alumno.fecha_baja && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha de baja:</span>
                  <span className="text-red-400">
                    {format(new Date(alumno.fecha_baja), 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>
              )}
            </div>

            {alumno.notas && (
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Notas:</p>
                <p className="mt-1 text-sm text-foreground">{alumno.notas}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {alumno.estado !== 'baja' && (
              <>
                <Button
                  size="sm"
                  onClick={() => setShowPagoModal(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Registrar pago
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setShowBajaModal(true)}
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Dar de baja
                </Button>
              </>
            )}
            {alumno.estado === 'baja' && alumno.tipo_baja === 'temporal' && (
              <Button
                size="sm"
                onClick={handleReincorporar}
                disabled={reincorporando}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {reincorporando ? 'Reincorporando...' : 'Reincorporar'}
              </Button>
            )}
          </div>

          {/* Payment History */}
          <div>
            <h3 className="mb-3 font-medium text-foreground">Historial de pagos</h3>
            {pagos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay pagos registrados</p>
            ) : (
              <div className="space-y-2">
                {pagos.map((pago) => (
                  <div
                    key={pago.id}
                    className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {pago.concepto}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pago.mes_correspondiente} &middot;{' '}
                        {format(new Date(pago.fecha_pago), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">
                        ${pago.monto.toLocaleString()}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {pago.metodo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AlumnoModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          fetchData()
        }}
        cursos={cursos}
        alumno={alumno}
      />

      <PagoModal
        isOpen={showPagoModal}
        onClose={() => setShowPagoModal(false)}
        alumno={alumno}
        onSuccess={fetchData}
      />

      <BajaModal
        isOpen={showBajaModal}
        onClose={() => setShowBajaModal(false)}
        alumno={alumno}
        onSuccess={() => {
          fetchData()
          onClose()
        }}
      />
    </>
  )
}
