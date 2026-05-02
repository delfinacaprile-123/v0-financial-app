'use client'

import { X, Edit2, Calendar, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Trabajo,
  formatARS,
  formatFecha,
  tipoServicioConfig,
  estadoTrabajoConfig,
  metodoPagoConfig,
} from '@/types/agencia'

interface TrabajoPanelProps {
  trabajo: Trabajo | null
  onClose: () => void
  onEdit: () => void
}

export function TrabajoPanel({ trabajo, onClose, onEdit }: TrabajoPanelProps) {
  if (!trabajo) return null

  const totalCachets = trabajo.modelos.reduce((sum, m) => sum + m.cachet, 0)
  const gananciaNeta = trabajo.monto_cobrado - totalCachets
  const tipoConfig = tipoServicioConfig[trabajo.tipo]
  const estadoConfig = estadoTrabajoConfig[trabajo.estado]

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0F0F0F] border-l border-[rgba(143,179,201,0.15)] shadow-2xl z-40 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#0F0F0F] border-b border-[rgba(143,179,201,0.15)] p-4 z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="font-serif text-xl text-[#E8E8E8]">{trabajo.cliente.nombre}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: `${tipoConfig.color}20`, color: tipoConfig.color }}
              >
                {tipoConfig.icon} {tipoConfig.label}
              </span>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: `${estadoConfig.color}20`, color: estadoConfig.color }}
              >
                {estadoConfig.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#888888]" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm text-[#888888]">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatFecha(trabajo.fecha)}
          </div>
          <div className="flex items-center gap-1">
            <CreditCard className="w-4 h-4" />
            {metodoPagoConfig[trabajo.metodo_pago].label}
          </div>
        </div>

        <Button
          onClick={onEdit}
          variant="outline"
          size="sm"
          className="mt-3 w-full border-[rgba(143,179,201,0.3)] text-[#8FB3C9] hover:bg-[#8FB3C9]/10"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Editar trabajo
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Resumen financiero */}
        <div className="bg-[#111111] border border-[rgba(143,179,201,0.15)] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[#888888] mb-3">Resumen financiero</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#AAAAAA]">Monto cobrado</span>
              <span className="text-[#E8E8E8] font-medium">{formatARS(trabajo.monto_cobrado)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#AAAAAA]">Total cachets</span>
              <span className="text-[#E8E8E8]">- {formatARS(totalCachets)}</span>
            </div>
            <div className="border-t border-[rgba(143,179,201,0.1)] pt-3">
              <div className="flex justify-between items-center">
                <span className="text-[#AAAAAA] font-medium">Ganancia neta</span>
                <span className={`text-xl font-semibold ${gananciaNeta >= 0 ? 'text-[#8FB3C9]' : 'text-red-400'}`}>
                  {formatARS(gananciaNeta)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modelos asignadas */}
        <div>
          <h3 className="text-sm font-medium text-[#888888] mb-3">Modelos asignadas</h3>
          {trabajo.modelos.length === 0 ? (
            <p className="text-[#666666] text-sm">Sin modelos asignadas</p>
          ) : (
            <div className="space-y-2">
              {trabajo.modelos.map((modelo) => (
                <div
                  key={modelo.id}
                  className="flex items-center justify-between bg-[#111111] border border-[rgba(143,179,201,0.1)] rounded-lg px-4 py-3"
                >
                  <span className="text-[#E8E8E8]">{modelo.nombre}</span>
                  <span className="text-[#8FB3C9] font-medium">{formatARS(modelo.cachet)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notas */}
        {trabajo.notas && (
          <div>
            <h3 className="text-sm font-medium text-[#888888] mb-3">Notas</h3>
            <div className="bg-[#111111] border border-[rgba(143,179,201,0.1)] rounded-lg p-4">
              <p className="text-[#AAAAAA] text-sm whitespace-pre-wrap">{trabajo.notas}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
