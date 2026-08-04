'use client'

import { useState } from 'react'
import { MessageSquareWarning, Check, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { resolverSolicitudCorreccion } from '@/lib/actions'

export interface SolicitudCorreccion {
  id: string
  descripcion: string
  modulo: string
  referencia: string | null
  solicitante: string
  created_at: string
}

const MODULO_LABEL: Record<string, string> = {
  cursos: 'Cursos',
  'social-tv': 'Social TV',
  agencia: 'Agencia',
  caja: 'Caja',
  gastos: 'Gastos',
}

export function SolicitudesPanel({ solicitudes }: { solicitudes: SolicitudCorreccion[] }) {
  const router = useRouter()
  const [procesando, setProcesando] = useState<string | null>(null)

  const handleResolver = async (id: string, accion: 'aprobar' | 'rechazar') => {
    setProcesando(id)
    try {
      await resolverSolicitudCorreccion(id)
      toast.success(accion === 'aprobar' ? 'Solicitud aprobada' : 'Solicitud rechazada')
      router.refresh()
    } catch (err) {
      console.error('[v0] Error resolviendo solicitud:', err)
      toast.error('Error al procesar la solicitud')
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div className="rounded-xl border border-[rgba(176,158,201,0.2)] bg-[#141414] p-5">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquareWarning className="h-5 w-5 text-amber-400" />
        <h3 className="font-medium text-[#E8E8E8]">Solicitudes de correccion</h3>
        {solicitudes.length > 0 && (
          <span className="ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-500 px-2 text-xs font-semibold text-black">
            {solicitudes.length}
          </span>
        )}
      </div>

      {solicitudes.length === 0 ? (
        <p className="text-sm text-[#888888]">No hay solicitudes pendientes</p>
      ) : (
        <div className="space-y-3">
          {solicitudes.map((s) => (
            <div key={s.id} className="rounded-lg bg-[#0A0A0A] p-3">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded bg-[rgba(176,158,201,0.15)] px-2 py-0.5 text-xs text-[#B09EC9]">
                  {MODULO_LABEL[s.modulo] ?? s.modulo}
                </span>
                {s.referencia && (
                  <span className="text-xs font-medium text-[#E8E8E8]">{s.referencia}</span>
                )}
                <span className="ml-auto text-xs text-[#888888]">
                  {format(new Date(s.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                </span>
              </div>
              <p className="text-sm text-[#E8E8E8]">{s.descripcion}</p>
              <p className="mt-1 text-xs text-[#888888]">Enviada por: {s.solicitante}</p>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => handleResolver(s.id, 'rechazar')}
                  disabled={procesando === s.id}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(255,255,255,0.15)] px-3 py-1.5 text-xs font-medium text-[#E8E8E8] transition-colors hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-60"
                >
                  {procesando === s.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                  Rechazar
                </button>
                <button
                  onClick={() => handleResolver(s.id, 'aprobar')}
                  disabled={procesando === s.id}
                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                >
                  {procesando === s.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Aprobar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
