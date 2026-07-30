'use client'

import { useState } from 'react'
import { MessageSquareWarning, Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { resolverSolicitudCorreccion } from '@/lib/actions'

export interface SolicitudCorreccion {
  id: string
  descripcion: string
  modulo: string
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
  const [resolviendo, setResolviendo] = useState<string | null>(null)

  const handleResolver = async (id: string) => {
    setResolviendo(id)
    try {
      await resolverSolicitudCorreccion(id)
      toast.success('Solicitud marcada como resuelta')
      router.refresh()
    } catch (err) {
      console.error('[v0] Error resolviendo solicitud:', err)
      toast.error('Error al resolver la solicitud')
    } finally {
      setResolviendo(null)
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
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded bg-[rgba(176,158,201,0.15)] px-2 py-0.5 text-xs text-[#B09EC9]">
                  {MODULO_LABEL[s.modulo] ?? s.modulo}
                </span>
                <span className="text-xs text-[#888888]">Por: {s.solicitante}</span>
              </div>
              <p className="text-sm text-[#E8E8E8]">{s.descripcion}</p>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => handleResolver(s.id)}
                  disabled={resolviendo === s.id}
                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                >
                  {resolviendo === s.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Resolver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
