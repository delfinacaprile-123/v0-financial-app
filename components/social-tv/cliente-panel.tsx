'use client'

import { X, Edit, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ClienteTV, 
  PagoMensualTV,
  formatARS,
  formatFecha,
  getNombreMes,
  tipoServicioTVConfig,
  metodoPagoTVConfig 
} from '@/types/social-tv'

interface ClientePanelProps {
  cliente: ClienteTV
  historialPagos: PagoMensualTV[]
  onClose: () => void
  onEdit: () => void
  onDesactivar: () => void
  isAdmin?: boolean
}

export function ClientePanel({ 
  cliente, 
  historialPagos, 
  onClose, 
  onEdit,
  onDesactivar,
  isAdmin = false
}: ClientePanelProps) {
  const tipoConfig = tipoServicioTVConfig[cliente.tipo_servicio]
  const metodoConfig = metodoPagoTVConfig[cliente.metodo_habitual]
  
  // Ordenar historial por mes descendente
  const historialOrdenado = [...historialPagos].sort((a, b) => b.mes.localeCompare(a.mes))

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-[#111111] border-l border-[rgba(176,158,201,0.2)] shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[rgba(176,158,201,0.15)]">
        <div>
          <h3 className="text-[#E5E5E5] font-serif text-xl">{cliente.nombre}</h3>
          <Badge 
            className="mt-2 text-xs"
            style={{ backgroundColor: `${tipoConfig.color}20`, color: tipoConfig.color, border: `1px solid ${tipoConfig.color}40` }}
          >
            {tipoConfig.label}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-[#888888] hover:text-[#E5E5E5] hover:bg-[rgba(176,158,201,0.1)]"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Datos del cliente */}
        <div className="space-y-4">
          <h4 className="text-[#888888] text-sm font-medium uppercase tracking-wider">
            Datos del cliente
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0A0A0A] border border-[rgba(176,158,201,0.15)] rounded-lg p-4">
              <p className="text-[#888888] text-xs mb-1">Monto mensual</p>
              <p className="text-[#B09EC9] font-semibold text-lg">{formatARS(cliente.monto_mensual)}</p>
            </div>
            <div className="bg-[#0A0A0A] border border-[rgba(176,158,201,0.15)] rounded-lg p-4">
              <p className="text-[#888888] text-xs mb-1">Metodo habitual</p>
              <p className="text-[#E5E5E5] font-medium">{metodoConfig.label}</p>
            </div>
          </div>
          
          <div className="bg-[#0A0A0A] border border-[rgba(176,158,201,0.15)] rounded-lg p-4">
            <p className="text-[#888888] text-xs mb-1">Estado</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${cliente.activo ? 'bg-green-500' : 'bg-red-500'}`} />
              <p className="text-[#E5E5E5]">{cliente.activo ? 'Activo' : 'Inactivo'}</p>
            </div>
          </div>
        </div>
        
        {/* Historial de pagos */}
        <div className="space-y-4">
          <h4 className="text-[#888888] text-sm font-medium uppercase tracking-wider">
            Historial de pagos
          </h4>
          
          {historialOrdenado.length === 0 ? (
            <div className="bg-[#0A0A0A] border border-[rgba(176,158,201,0.15)] rounded-lg p-6 text-center">
              <p className="text-[#888888] text-sm">Sin historial de pagos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {historialOrdenado.map((pago) => (
                <div 
                  key={pago.id}
                  className="bg-[#0A0A0A] border border-[rgba(176,158,201,0.15)] rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#E5E5E5] font-medium capitalize">
                      {getNombreMes(pago.mes)}
                    </span>
                    <Badge 
                      variant={pago.pagado ? 'default' : 'destructive'}
                      className={pago.pagado 
                        ? 'bg-green-500/20 text-green-400 border-green-500/40' 
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                      }
                    >
                      {pago.pagado ? 'Pagado' : 'Pendiente'}
                    </Badge>
                  </div>
                  {pago.pagado && pago.fecha_pago && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#888888]">
                        {formatFecha(pago.fecha_pago)} - {metodoPagoTVConfig[pago.metodo_pago!].label}
                      </span>
                      <span className="text-[#B09EC9]">{formatARS(pago.monto)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer actions */}
      <div className="p-6 border-t border-[rgba(176,158,201,0.15)] space-y-3">
        <Button
          onClick={onEdit}
          className="w-full bg-[#B09EC9] hover:bg-[#9B8AB8] text-[#0A0A0A] font-medium"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar cliente
        </Button>
        
        {isAdmin && cliente.activo && (
          <Button
            variant="outline"
            onClick={onDesactivar}
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <UserX className="h-4 w-4 mr-2" />
            Desactivar cliente
          </Button>
        )}
      </div>
    </div>
  )
}
