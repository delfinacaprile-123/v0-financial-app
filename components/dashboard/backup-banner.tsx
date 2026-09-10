'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Database, X } from 'lucide-react'

// Banner recordatorio que aparece el 1ro de cada mes para descargar el backup.
// La decision de mostrarlo se toma en el servidor (prop) para evitar desfasajes
// de zona horaria; aca solo se maneja el descarte local.
export function BackupBanner() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.08)] px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(201,169,110,0.15)]">
        <Database className="h-4 w-4 text-[#C9A96E]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#E5E5E5]">Recordatorio de backup mensual</p>
        <p className="text-sm text-[#888888]">
          Es principio de mes. Descargá una copia de seguridad de los datos desde{' '}
          <Link
            href="/configuracion"
            className="font-medium text-[#C9A96E] underline underline-offset-2 hover:text-[#B89860]"
          >
            Configuración → Backup
          </Link>
          .
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        aria-label="Descartar recordatorio"
        className="shrink-0 rounded-md p-1 text-[#888888] transition-colors hover:bg-[rgba(201,169,110,0.1)] hover:text-[#E5E5E5]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
