'use client'

import { X, Plus, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Trabajo,
  Cliente,
  formatARS,
  formatFecha,
  tipoServicioConfig,
  estadoTrabajoConfig,
} from '@/types/agencia'

interface ClientePanelProps {
  cliente: Cliente | null
  trabajos: Trabajo[]
  onClose: () => void
  onNuevoTrabajo: () => void
}

export function ClientePanel({ cliente, trabajos, onClose, onNuevoTrabajo }: ClientePanelProps) {
  if (!cliente) return null

  const trabajosCliente = trabajos.filter((t) => t.cliente_id === cliente.id)
  const totalGenerado = trabajosCliente.reduce((sum, t) => sum + t.monto_cobrado, 0)
  const totalCachets = trabajosCliente.reduce(
    (sum, t) => sum + t.modelos.reduce((s, m) => s + m.cachet, 0),
    0
  )
  const gananciaNeta = totalGenerado - totalCachets

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0F0F0F] border-l border-[rgba(143,179,201,0.15)] shadow-2xl z-40 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#0F0F0F] border-b border-[rgba(143,179,201,0.15)] p-4 z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#8FB3C9]/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#8FB3C9]" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-[#E8E8E8]">{cliente.nombre}</h2>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  cliente.activo
                    ? 'bg-[#4ADE80]/10 text-[#4ADE80]'
                    : 'bg-[#888888]/10 text-[#888888]'
                }`}
              >
                {cliente.activo ? 'Activo' : 'Inactivo'}
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

        <Button
          onClick={onNuevoTrabajo}
          className="w-full bg-[#8FB3C9] hover:bg-[#7DA3B9] text-[#0A0A0A] font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo trabajo para {cliente.nombre}
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#111111] border border-[rgba(143,179,201,0.15)] rounded-xl p-3 text-center">
            <p className="text-2xl font-semibold text-[#E8E8E8]">{trabajosCliente.length}</p>
            <p className="text-xs text-[#888888]">Trabajos</p>
          </div>
          <div className="bg-[#111111] border border-[rgba(143,179,201,0.15)] rounded-xl p-3 text-center">
            <p className="text-lg font-semibold text-[#E8E8E8]">{formatARS(totalGenerado)}</p>
            <p className="text-xs text-[#888888]">Total generado</p>
          </div>
          <div className="bg-[#111111] border border-[rgba(143,179,201,0.15)] rounded-xl p-3 text-center">
            <p className="text-lg font-semibold text-[#8FB3C9]">{formatARS(gananciaNeta)}</p>
            <p className="text-xs text-[#888888]">Ganancia neta</p>
          </div>
        </div>

        {/* Historial de trabajos */}
        <div>
          <h3 className="text-sm font-medium text-[#888888] mb-3">Historial de trabajos</h3>
          {trabajosCliente.length === 0 ? (
            <p className="text-[#666666] text-sm">Sin trabajos registrados</p>
          ) : (
            <div className="space-y-2">
              {trabajosCliente
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                .map((trabajo) => {
                  const tipoConfig = tipoServicioConfig[trabajo.tipo]
                  const estadoConfig = estadoTrabajoConfig[trabajo.estado]
                  const cachets = trabajo.modelos.reduce((s, m) => s + m.cachet, 0)
                  const ganancia = trabajo.monto_cobrado - cachets

                  return (
                    <div
                      key={trabajo.id}
                      className="bg-[#111111] border border-[rgba(143,179,201,0.1)] rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ backgroundColor: `${tipoConfig.color}20`, color: tipoConfig.color }}
                          >
                            {tipoConfig.icon} {tipoConfig.label}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ backgroundColor: `${estadoConfig.color}20`, color: estadoConfig.color }}
                          >
                            {estadoConfig.label}
                          </span>
                        </div>
                        <span className="text-xs text-[#888888]">{formatFecha(trabajo.fecha)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#AAAAAA]">Monto: {formatARS(trabajo.monto_cobrado)}</span>
                        <span className={`font-medium ${ganancia >= 0 ? 'text-[#8FB3C9]' : 'text-red-400'}`}>
                          Ganancia: {formatARS(ganancia)}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
