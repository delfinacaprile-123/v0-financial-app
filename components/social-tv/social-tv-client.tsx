'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  togglePagoSocialTV,
  createPagoExtraordinario,
  updatePagoExtraordinario,
  deletePagoSocialTV,
  createClienteTV,
  updateClienteTV,
  setClienteTVActivo,
} from '@/lib/actions'
import { 
  Search, 
  Plus, 
  Check, 
  X, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { toast } from 'sonner'
import { ClienteModal } from './cliente-modal'
import { ConfirmarPagoModal } from './confirmar-pago-modal'
import { PagoExtraordinarioModal } from './pago-extraordinario-modal'
import { ClientePanel } from './cliente-panel'
import { SolicitarCorreccionModal } from '@/components/solicitar-correccion-modal'
import { MessageSquareWarning } from 'lucide-react'
import { 
  ClienteTV, 
  ClienteTVConPago,
  PagoMensualTV,
  PagoExtraordinarioTV,
  ResumenTipoServicioTV,
  TipoServicioTV,
  formatARS,
  formatFecha,
  getNombreMes,
  tipoServicioTVConfig,
  metodoPagoTVConfig
} from '@/types/social-tv'

interface SocialTVClientProps {
  clientesIniciales: ClienteTV[]
  pagosIniciales: PagoMensualTV[]
  pagosExtraordinariosIniciales: PagoExtraordinarioTV[]
  esAdmin?: boolean
}

export function SocialTVClient({ 
  clientesIniciales, 
  pagosIniciales,
  pagosExtraordinariosIniciales,
  esAdmin = false,
}: SocialTVClientProps) {
  const router = useRouter()
  const [clientes, setClientes] = useState<ClienteTV[]>(clientesIniciales)
  const [pagos, setPagos] = useState<PagoMensualTV[]>(pagosIniciales)
  const [pagosExtra, setPagosExtra] = useState<PagoExtraordinarioTV[]>(pagosExtraordinariosIniciales)
  
  const [activeTab, setActiveTab] = useState('checklist')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Mes actual
  const today = new Date()
  const [mesActual, setMesActual] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)
  
  // Modales
  const [clienteModalOpen, setClienteModalOpen] = useState(false)
  const [clienteEdit, setClienteEdit] = useState<ClienteTV | null>(null)
  const [pagoModalOpen, setPagoModalOpen] = useState(false)
  const [clientePago, setClientePago] = useState<ClienteTVConPago | null>(null)
  const [pagoExtraModalOpen, setPagoExtraModalOpen] = useState(false)
  const [pagoExtraEdit, setPagoExtraEdit] = useState<PagoExtraordinarioTV | null>(null)
  // Solicitud de correccion (para administrativa, que no puede editar/eliminar pagos)
  const [correccionState, setCorreccionState] = useState<{ descripcion: string; referencia: string } | null>(null)
  
  // Panel lateral
  const [selectedCliente, setSelectedCliente] = useState<ClienteTV | null>(null)
  
  // Filtros para pagos extraordinarios
  const [filtroClienteExtra, setFiltroClienteExtra] = useState<string>('todos')

  // Clientes que aparecen en el checklist del mes actual.
  // Regla de pertenencia para el mes M:
  //  - Si el cliente tiene un pago registrado en M => siempre se muestra
  //    (preserva el historial, incluso de clientes inactivos o no fijos).
  //  - Si no tiene pago en M => solo genera fila de cobro si está activo y:
  //      * es 'fijo' (aparece todos los meses), o
  //      * es 'no_fijo' y M es su mes de alta.
  const clientesConPago = useMemo<ClienteTVConPago[]>(() => {
    return clientes
      .filter(cliente => {
        const tienePagoMes = pagos.some(p => p.cliente_id === cliente.id && p.mes === mesActual)
        if (tienePagoMes) return true
        if (!cliente.activo) return false
        if (cliente.tipo_cliente === 'fijo') return true
        const mesAlta = cliente.created_at ? cliente.created_at.slice(0, 7) : null
        return mesAlta === mesActual
      })
      .map(cliente => {
        const pagoMes = pagos.find(p => p.cliente_id === cliente.id && p.mes === mesActual)
        return {
          ...cliente,
          pago_actual: pagoMes
        }
      })
  }, [clientes, pagos, mesActual])

  // Filtrar por búsqueda
  const clientesFiltrados = useMemo(() => {
    if (!searchQuery) return clientesConPago
    const query = searchQuery.toLowerCase()
    return clientesConPago.filter(c => c.nombre.toLowerCase().includes(query))
  }, [clientesConPago, searchQuery])

  // KPIs del mes (consistentes con las filas mostradas en el checklist)
  const kpis = useMemo(() => {
    const totalEsperado = clientesConPago.reduce((sum, c) => sum + c.monto_mensual, 0)
    const totalCobrado = clientesConPago
      .filter(c => c.pago_actual?.pagado)
      .reduce((sum, c) => sum + (c.pago_actual?.monto || c.monto_mensual), 0)
    const totalPendiente = totalEsperado - totalCobrado
    const pendientes = clientesConPago.filter(c => !c.pago_actual?.pagado).length
    
    return { totalEsperado, totalCobrado, totalPendiente, pendientes }
  }, [clientesConPago])

  // Alerta si estamos pasada la primera semana y hay pendientes
  const mostrarAlerta = useMemo(() => {
    const [year, month] = mesActual.split('-').map(Number)
    const esElMesActual = year === today.getFullYear() && month === today.getMonth() + 1
    return esElMesActual && today.getDate() > 7 && kpis.pendientes > 0
  }, [mesActual, today, kpis.pendientes])

  // Pagos extraordinarios filtrados
  const pagosExtraFiltrados = useMemo(() => {
    let filtered = pagosExtra
    if (filtroClienteExtra !== 'todos') {
      filtered = filtered.filter(p => p.cliente_id === filtroClienteExtra)
    }
    return filtered.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [pagosExtra, filtroClienteExtra])

  // Resumen por tipo de servicio
  const resumenPorTipo = useMemo<ResumenTipoServicioTV[]>(() => {
    const tipos: Record<TipoServicioTV, { total: number; cantidad: number }> = {
      desfile: { total: 0, cantidad: 0 },
      produccion: { total: 0, cantidad: 0 },
      foto: { total: 0, cantidad: 0 },
      promo: { total: 0, cantidad: 0 },
      otro: { total: 0, cantidad: 0 },
    }
    
    clientes.filter(c => c.activo).forEach(cliente => {
      tipos[cliente.tipo_servicio].total += cliente.monto_mensual
      tipos[cliente.tipo_servicio].cantidad++
    })
    
    const totalGeneral = Object.values(tipos).reduce((sum, t) => sum + t.total, 0)
    
    return Object.entries(tipos).map(([tipo, data]) => ({
      tipo: tipo as TipoServicioTV,
      total_ingresado: data.total,
      cantidad_clientes: data.cantidad,
      porcentaje: totalGeneral > 0 ? (data.total / totalGeneral) * 100 : 0
    })).filter(r => r.cantidad_clientes > 0)
  }, [clientes])

  // Historial de pagos del cliente seleccionado
  const historialCliente = useMemo(() => {
    if (!selectedCliente) return []
    return pagos.filter(p => p.cliente_id === selectedCliente.id)
  }, [selectedCliente, pagos])

  // Navegación de mes
  const cambiarMes = (delta: number) => {
    const [year, month] = mesActual.split('-').map(Number)
    const newDate = new Date(year, month - 1 + delta)
    setMesActual(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`)
  }

  // Anio derivado del mes actual ("YYYY-MM")
  const anioActual = parseInt(mesActual.split('-')[0], 10)

  // Handlers
  const handleTogglePago = async (cliente: ClienteTVConPago) => {
    if (cliente.pago_actual?.pagado) {
      // Deshacer pago (optimista)
      setPagos(prev => prev.filter(p => p.id !== cliente.pago_actual!.id))
      try {
        await togglePagoSocialTV(cliente.id, mesActual, anioActual, false)
        toast.success(`Pago de ${cliente.nombre} deshecho`)
        router.refresh()
      } catch (err) {
        console.error('[v0] Error al deshacer pago:', err)
        toast.error('Error al deshacer el pago')
        router.refresh()
      }
    } else {
      // Abrir modal para confirmar pago
      setClientePago(cliente)
      setPagoModalOpen(true)
    }
  }

  const handleConfirmarPago = async (pago: PagoMensualTV) => {
    // Optimista
    setPagos(prev => [...prev.filter(p => !(p.cliente_id === pago.cliente_id && p.mes === pago.mes)), pago])
    try {
      await togglePagoSocialTV(pago.cliente_id, mesActual, anioActual, true, pago.metodo_pago)
      toast.success('Pago registrado')
      router.refresh()
    } catch (err) {
      console.error('[v0] Error al registrar pago:', err)
      toast.error('Error al registrar el pago')
      router.refresh()
    }
  }

  const handleSaveCliente = async (cliente: ClienteTV) => {
    const exists = clientes.some(c => c.id === cliente.id)
    // Optimista
    setClientes(prev =>
      exists ? prev.map(c => (c.id === cliente.id ? cliente : c)) : [...prev, cliente]
    )
    const input = {
      nombre: cliente.nombre,
      tipo_cliente: cliente.tipo_cliente,
      monto_mensual: cliente.monto_mensual,
      metodo_default: cliente.metodo_habitual,
      activo: cliente.activo,
    }
    try {
      if (exists) {
        await updateClienteTV(cliente.id, input)
        toast.success('Cliente actualizado')
      } else {
        await createClienteTV(input)
        toast.success('Cliente creado')
      }
      router.refresh()
    } catch (err) {
      console.error('[v0] Error al guardar cliente:', err)
      toast.error('Error al guardar el cliente')
      router.refresh()
    }
  }

  const handleSavePagoExtra = async (pago: PagoExtraordinarioTV) => {
    const exists = pagosExtra.some(p => p.id === pago.id)
    // Optimista
    setPagosExtra(prev =>
      exists ? prev.map(p => (p.id === pago.id ? pago : p)) : [...prev, pago]
    )
    try {
      if (exists) {
        await updatePagoExtraordinario(pago.id, {
          cliente_id: pago.cliente_id,
          monto_extra: pago.monto,
          descripcion_extra: pago.descripcion,
        })
        toast.success('Pago extraordinario actualizado')
      } else {
        await createPagoExtraordinario({
          cliente_id: pago.cliente_id,
          mes: mesActual,
          anio: anioActual,
          monto_extra: pago.monto,
          descripcion_extra: pago.descripcion,
        })
        toast.success('Pago extraordinario registrado')
      }
      router.refresh()
    } catch (err) {
      console.error('[v0] Error al guardar pago extraordinario:', err)
      toast.error('Error al guardar el pago extraordinario')
      router.refresh()
    }
  }

  const handleDeletePagoExtra = async (id: string) => {
    const previo = pagosExtra
    setPagosExtra(prev => prev.filter(p => p.id !== id))
    try {
      await deletePagoSocialTV(id)
      toast.success('Pago eliminado')
      router.refresh()
    } catch (err) {
      console.error('[v0] Error al eliminar pago:', err)
      toast.error('Error al eliminar el pago')
      setPagosExtra(previo)
    }
  }

  const handleDesactivarCliente = async () => {
    if (!selectedCliente) return
    const id = selectedCliente.id
    setClientes(prev => prev.map(c => (c.id === id ? { ...c, activo: false } : c)))
    setSelectedCliente(null)
    try {
      await setClienteTVActivo(id, false)
      toast.success('Cliente desactivado')
      router.refresh()
    } catch (err) {
      console.error('[v0] Error al desactivar cliente:', err)
      toast.error('Error al desactivar el cliente')
      router.refresh()
    }
  }

  // Datos para el gráfico de torta
  const chartData = resumenPorTipo.map(r => ({
    name: tipoServicioTVConfig[r.tipo].label,
    value: r.total_ingresado,
    color: tipoServicioTVConfig[r.tipo].color
  }))

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#111111] border border-[rgba(176,158,201,0.2)]">
          <TabsTrigger 
            value="checklist" 
            className="data-[state=active]:bg-[#B09EC9] data-[state=active]:text-[#0A0A0A]"
          >
            Checklist mensual
          </TabsTrigger>
          <TabsTrigger 
            value="extraordinarios" 
            className="data-[state=active]:bg-[#B09EC9] data-[state=active]:text-[#0A0A0A]"
          >
            Pagos extraordinarios
          </TabsTrigger>
          <TabsTrigger 
            value="por-tipo" 
            className="data-[state=active]:bg-[#B09EC9] data-[state=active]:text-[#0A0A0A]"
          >
            Por tipo de servicio
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* VISTA 1: Checklist mensual */}
      {activeTab === 'checklist' && (
        <>
          {/* Alerta de pendientes */}
          {mostrarAlerta && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <p className="text-yellow-500">
                <span className="font-semibold">{kpis.pendientes} cliente{kpis.pendientes > 1 ? 's' : ''}</span> sin marcar este mes
              </p>
            </div>
          )}

          {/* Header con selector de mes y KPIs */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => cambiarMes(-1)}
                className="text-[#888888] hover:text-[#E5E5E5]"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-[#E5E5E5] font-medium min-w-[180px] text-center capitalize">
                {getNombreMes(mesActual)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => cambiarMes(1)}
                className="text-[#888888] hover:text-[#E5E5E5]"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[#888888] text-xs">Esperado</p>
                <p className="text-[#E5E5E5] font-semibold">{formatARS(kpis.totalEsperado)}</p>
              </div>
              <div className="text-center">
                <p className="text-[#888888] text-xs">Cobrado</p>
                <p className="text-green-400 font-semibold">{formatARS(kpis.totalCobrado)}</p>
              </div>
              <div className="text-center">
                <p className="text-[#888888] text-xs">Pendiente</p>
                <p className="text-red-400 font-semibold">{formatARS(kpis.totalPendiente)}</p>
              </div>
            </div>
            
            <Button 
              onClick={() => { setClienteEdit(null); setClienteModalOpen(true) }}
              className="bg-[#B09EC9] hover:bg-[#9B8AB8] text-[#0A0A0A] font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo cliente
            </Button>
          </div>

          {/* Buscador */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
            <Input
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#111111] border-[rgba(176,158,201,0.2)] text-[#E5E5E5] focus:border-[#B09EC9]"
            />
          </div>

          {/* Tabla checklist */}
          <div className="bg-[#111111] border border-[rgba(176,158,201,0.15)] rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[rgba(176,158,201,0.15)] hover:bg-transparent">
                  <TableHead className="text-[#888888]">Cliente</TableHead>
                  <TableHead className="text-[#888888]">Tipo de servicio</TableHead>
                  <TableHead className="text-[#888888]">Monto mensual</TableHead>
                  <TableHead className="text-[#888888]">Metodo habitual</TableHead>
                  <TableHead className="text-[#888888] text-center">Estado</TableHead>
                  <TableHead className="text-[#888888]">Fecha de pago</TableHead>
                  <TableHead className="text-[#888888] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-[#888888]">
                      No hay clientes registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  clientesFiltrados.map((cliente) => {
                    const tipoConfig = tipoServicioTVConfig[cliente.tipo_servicio]
                    const pagado = cliente.pago_actual?.pagado
                    
                    return (
                      <TableRow 
                        key={cliente.id}
                        className="border-b border-[rgba(176,158,201,0.1)] hover:bg-[rgba(176,158,201,0.05)]"
                      >
                        <TableCell className="text-[#E5E5E5] font-medium">
                          {cliente.nombre}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className="text-xs"
                            style={{ 
                              backgroundColor: `${tipoConfig.color}20`, 
                              color: tipoConfig.color, 
                              border: `1px solid ${tipoConfig.color}40` 
                            }}
                          >
                            {tipoConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#B09EC9] font-medium">
                          {formatARS(cliente.monto_mensual)}
                        </TableCell>
                        <TableCell className="text-[#888888]">
                          {metodoPagoTVConfig[cliente.metodo_habitual].label}
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => handleTogglePago(cliente)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                              pagado 
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                          >
                            {pagado ? (
                              <>
                                <Check className="h-4 w-4" />
                                Pago
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4" />
                                Pendiente
                              </>
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="text-[#888888]">
                          {cliente.pago_actual?.fecha_pago 
                            ? formatFecha(cliente.pago_actual.fecha_pago) 
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCliente(cliente)}
                            className="text-[#888888] hover:text-[#B09EC9]"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver historial
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* VISTA 2: Pagos extraordinarios */}
      {activeTab === 'extraordinarios' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={filtroClienteExtra} onValueChange={setFiltroClienteExtra}>
                <SelectTrigger className="w-[200px] bg-[#111111] border-[rgba(176,158,201,0.2)] text-[#E5E5E5]">
                  <SelectValue placeholder="Filtrar por cliente" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[rgba(176,158,201,0.2)]">
                  <SelectItem value="todos" className="text-[#E5E5E5]">Todos los clientes</SelectItem>
                  {clientes.filter(c => c.activo).map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id} className="text-[#E5E5E5]">
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => { setPagoExtraEdit(null); setPagoExtraModalOpen(true) }}
              className="bg-[#B09EC9] hover:bg-[#9B8AB8] text-[#0A0A0A] font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar pago extraordinario
            </Button>
          </div>

          <div className="bg-[#111111] border border-[rgba(176,158,201,0.15)] rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[rgba(176,158,201,0.15)] hover:bg-transparent">
                  <TableHead className="text-[#888888]">Fecha</TableHead>
                  <TableHead className="text-[#888888]">Cliente</TableHead>
                  <TableHead className="text-[#888888]">Descripcion</TableHead>
                  <TableHead className="text-[#888888]">Monto</TableHead>
                  <TableHead className="text-[#888888]">Metodo</TableHead>
                  <TableHead className="text-[#888888] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagosExtraFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-[#888888]">
                      No hay pagos extraordinarios
                    </TableCell>
                  </TableRow>
                ) : (
                  pagosExtraFiltrados.map((pago) => (
                    <TableRow 
                      key={pago.id}
                      className="border-b border-[rgba(176,158,201,0.1)] hover:bg-[rgba(176,158,201,0.05)]"
                    >
                      <TableCell className="text-[#888888]">
                        {formatFecha(pago.fecha)}
                      </TableCell>
                      <TableCell className="text-[#E5E5E5] font-medium">
                        {pago.cliente_nombre || clientes.find(c => c.id === pago.cliente_id)?.nombre}
                      </TableCell>
                      <TableCell className="text-[#888888]">
                        {pago.descripcion}
                      </TableCell>
                      <TableCell className="text-[#B09EC9] font-medium">
                        {formatARS(pago.monto)}
                      </TableCell>
                      <TableCell className="text-[#888888]">
                        {metodoPagoTVConfig[pago.metodo_pago].label}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {esAdmin ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setPagoExtraEdit(pago); setPagoExtraModalOpen(true) }}
                                className="text-[#888888] hover:text-[#B09EC9]"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePagoExtra(pago.id)}
                                className="text-[#888888] hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const nombre = pago.cliente_nombre || clientes.find(c => c.id === pago.cliente_id)?.nombre || 'cliente'
                                setCorreccionState({
                                  referencia: nombre,
                                  descripcion: `Correccion en pago extraordinario de ${nombre} (${formatARS(pago.monto)} - ${pago.descripcion}): `,
                                })
                              }}
                              className="gap-1.5 text-xs text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                            >
                              <MessageSquareWarning className="h-3.5 w-3.5" />
                              Solicitar correccion
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* VISTA 3: Por tipo de servicio */}
      {activeTab === 'por-tipo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cards resumen */}
          <div className="space-y-4">
            <h3 className="text-[#888888] text-sm font-medium uppercase tracking-wider">
              Resumen por tipo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resumenPorTipo.map((resumen) => {
                const config = tipoServicioTVConfig[resumen.tipo]
                return (
                  <div
                    key={resumen.tipo}
                    className="bg-[#111111] border border-[rgba(176,158,201,0.15)] rounded-xl p-5"
                    style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge 
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${config.color}20`, 
                          color: config.color, 
                          border: `1px solid ${config.color}40` 
                        }}
                      >
                        {config.label}
                      </Badge>
                      <span className="text-[#888888] text-sm">
                        {resumen.porcentaje.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-[#B09EC9] font-bold text-xl mb-1">
                      {formatARS(resumen.total_ingresado)}
                    </p>
                    <p className="text-[#888888] text-sm">
                      {resumen.cantidad_clientes} cliente{resumen.cantidad_clientes !== 1 ? 's' : ''}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Gráfico de torta */}
          <div className="bg-[#111111] border border-[rgba(176,158,201,0.15)] rounded-xl p-6">
            <h3 className="text-[#888888] text-sm font-medium uppercase tracking-wider mb-4">
              Distribucion por tipo
            </h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatARS(value)}
                    contentStyle={{ 
                      backgroundColor: '#1A1A1A', 
                      border: '1px solid rgba(176,158,201,0.2)',
                      borderRadius: '8px',
                      color: '#E5E5E5'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    formatter={(value) => <span className="text-[#888888]">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-[#888888]">
                No hay datos para mostrar
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modales */}
      <ClienteModal
        open={clienteModalOpen}
        onOpenChange={setClienteModalOpen}
        cliente={clienteEdit}
        onSave={handleSaveCliente}
      />
      
      <ConfirmarPagoModal
        open={pagoModalOpen}
        onOpenChange={setPagoModalOpen}
        cliente={clientePago}
        mesActual={mesActual}
        onConfirm={handleConfirmarPago}
      />
      
      <PagoExtraordinarioModal
        open={pagoExtraModalOpen}
        onOpenChange={setPagoExtraModalOpen}
        clientes={clientes.filter(c => c.activo)}
        pagoEdit={pagoExtraEdit}
        onSave={handleSavePagoExtra}
      />

      {/* Panel lateral */}
      {selectedCliente && (
        <ClientePanel
          cliente={selectedCliente}
          historialPagos={historialCliente}
          onClose={() => setSelectedCliente(null)}
          onEdit={() => {
            setClienteEdit(selectedCliente)
            setClienteModalOpen(true)
            setSelectedCliente(null)
          }}
          onDesactivar={handleDesactivarCliente}
          isAdmin={esAdmin}
        />
      )}

      {/* Solicitud de correccion (para administrativa) */}
      <SolicitarCorreccionModal
        isOpen={correccionState !== null}
        onClose={() => setCorreccionState(null)}
        modulo="social_tv"
        referencia={correccionState?.referencia}
        defaultDescripcion={correccionState?.descripcion ?? ''}
      />
    </div>
  )
}
