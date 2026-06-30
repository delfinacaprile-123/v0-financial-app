'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Search, Eye, Building2 } from 'lucide-react'
import { createTrabajo, updateTrabajo, createClienteAgencia } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Trabajo,
  Cliente,
  TipoServicio,
  EstadoTrabajo,
  formatARS,
  formatFecha,
  tipoServicioConfig,
  estadoTrabajoConfig,
  metodoPagoConfig,
  ResumenTipoServicio,
  ClienteConEstadisticas,
} from '@/types/agencia'
import { TrabajoModal } from './trabajo-modal'
import { TrabajoPanel } from './trabajo-panel'
import { ClientePanel } from './cliente-panel'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface AgenciaClientProps {
  trabajos: Trabajo[]
  clientes: Cliente[]
}

type VistaActiva = 'trabajos' | 'clientes' | 'tipos'

export function AgenciaClient({ trabajos: initialTrabajos, clientes: initialClientes }: AgenciaClientProps) {
  const router = useRouter()
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('trabajos')
  const [trabajos, setTrabajos] = useState(initialTrabajos)
  const [clientes, setClientes] = useState(initialClientes)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<TipoServicio | 'todos'>('todos')
  const [filtroEstado, setFiltroEstado] = useState<EstadoTrabajo | 'todos'>('todos')
  const [filtroClienteEstado, setFiltroClienteEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos')
  
  // Panels and modals
  const [selectedTrabajo, setSelectedTrabajo] = useState<Trabajo | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTrabajo, setEditingTrabajo] = useState<Trabajo | null>(null)
  const [preselectedClienteId, setPreselectedClienteId] = useState<string | undefined>()

  // Filtered trabajos
  const filteredTrabajos = useMemo(() => {
    return trabajos.filter((trabajo) => {
      const matchesSearch =
        trabajo.cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trabajo.notas?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      const matchesTipo = filtroTipo === 'todos' || trabajo.tipo === filtroTipo
      const matchesEstado = filtroEstado === 'todos' || trabajo.estado === filtroEstado
      return matchesSearch && matchesTipo && matchesEstado
    })
  }, [trabajos, searchQuery, filtroTipo, filtroEstado])

  // Clientes con estadísticas
  const clientesConEstadisticas: ClienteConEstadisticas[] = useMemo(() => {
    return clientes.map((cliente) => {
      const trabajosCliente = trabajos.filter((t) => t.cliente_id === cliente.id)
      const totalGenerado = trabajosCliente.reduce((sum, t) => sum + t.monto_cobrado, 0)
      const totalCachets = trabajosCliente.reduce(
        (sum, t) => sum + t.modelos.reduce((s, m) => s + m.cachet, 0),
        0
      )
      return {
        ...cliente,
        cantidad_trabajos: trabajosCliente.length,
        total_generado: totalGenerado,
        ganancia_neta: totalGenerado - totalCachets,
      }
    }).filter((cliente) => {
      const matchesSearch = cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesEstado =
        filtroClienteEstado === 'todos' ||
        (filtroClienteEstado === 'activo' && cliente.activo) ||
        (filtroClienteEstado === 'inactivo' && !cliente.activo)
      return matchesSearch && matchesEstado
    })
  }, [clientes, trabajos, searchQuery, filtroClienteEstado])

  // Resumen por tipo
  const resumenPorTipo: ResumenTipoServicio[] = useMemo(() => {
    const tipos: TipoServicio[] = ['desfile', 'produccion', 'foto', 'promo', 'otro']
    return tipos.map((tipo) => {
      const trabajosTipo = trabajos.filter((t) => t.tipo === tipo)
      const totalIngresado = trabajosTipo.reduce((sum, t) => sum + t.monto_cobrado, 0)
      const totalCachets = trabajosTipo.reduce(
        (sum, t) => sum + t.modelos.reduce((s, m) => s + m.cachet, 0),
        0
      )
      return {
        tipo,
        total_ingresado: totalIngresado,
        cantidad_trabajos: trabajosTipo.length,
        ganancia_neta: totalIngresado - totalCachets,
      }
    }).filter((r) => r.cantidad_trabajos > 0)
  }, [trabajos])

  const handleSaveTrabajo = (trabajoData: Partial<Trabajo>, isNew: boolean) => {
    if (isNew) {
      const nuevoTrabajo: Trabajo = {
        id: Date.now().toString(),
        cliente_id: trabajoData.cliente_id || '',
        cliente: trabajoData.cliente || clientes.find((c) => c.id === trabajoData.cliente_id) || clientes[0],
        tipo: trabajoData.tipo || 'produccion',
        fecha: trabajoData.fecha || new Date().toISOString().split('T')[0],
        monto_cobrado: trabajoData.monto_cobrado || 0,
        estado: trabajoData.estado || 'pendiente',
        metodo_pago: trabajoData.metodo_pago || 'transferencia',
        notas: trabajoData.notas,
        modelos: trabajoData.modelos || [],
      }
      
      // Si es un cliente nuevo, agregarlo
      if (trabajoData.cliente && !clientes.find((c) => c.id === trabajoData.cliente?.id)) {
        setClientes([...clientes, trabajoData.cliente])
        nuevoTrabajo.cliente = trabajoData.cliente
        nuevoTrabajo.cliente_id = trabajoData.cliente.id
      }
      
      setTrabajos([nuevoTrabajo, ...trabajos])
    } else if (editingTrabajo) {
      setTrabajos(
        trabajos.map((t) =>
          t.id === editingTrabajo.id
            ? { ...t, ...trabajoData, cliente: clientes.find((c) => c.id === trabajoData.cliente_id) || t.cliente }
            : t
        )
      )
    }
    setEditingTrabajo(null)
    setPreselectedClienteId(undefined)
  }

  const handleNuevoTrabajoParaCliente = (clienteId: string) => {
    setPreselectedClienteId(clienteId)
    setSelectedCliente(null)
    setIsModalOpen(true)
  }

  const handleEditTrabajo = () => {
    if (selectedTrabajo) {
      setEditingTrabajo(selectedTrabajo)
      setSelectedTrabajo(null)
      setIsModalOpen(true)
    }
  }

  // Chart data for tipos view
  const chartData = resumenPorTipo.map((r) => ({
    name: tipoServicioConfig[r.tipo].label,
    value: r.total_ingresado,
    color: tipoServicioConfig[r.tipo].color,
  }))

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={vistaActiva} onValueChange={(v) => setVistaActiva(v as VistaActiva)}>
        <TabsList className="bg-[#111111] border border-[rgba(143,179,201,0.15)]">
          <TabsTrigger
            value="trabajos"
            className="data-[state=active]:bg-[#8FB3C9] data-[state=active]:text-[#0A0A0A]"
          >
            Trabajos
          </TabsTrigger>
          <TabsTrigger
            value="clientes"
            className="data-[state=active]:bg-[#8FB3C9] data-[state=active]:text-[#0A0A0A]"
          >
            Clientes
          </TabsTrigger>
          <TabsTrigger
            value="tipos"
            className="data-[state=active]:bg-[#8FB3C9] data-[state=active]:text-[#0A0A0A]"
          >
            Por tipo
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* VISTA: Trabajos */}
      {vistaActiva === 'trabajos' && (
        <>
          {/* Header con buscador y filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <Input
                placeholder="Buscar por cliente o descripcion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#111111] border-[rgba(143,179,201,0.2)] text-[#E8E8E8] placeholder:text-[#666666] focus:border-[#8FB3C9]"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as TipoServicio | 'todos')}>
                <SelectTrigger className="w-36 bg-[#111111] border-[rgba(143,179,201,0.2)] text-[#E8E8E8]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[rgba(143,179,201,0.2)]">
                  <SelectItem value="todos" className="text-[#E8E8E8]">Todos</SelectItem>
                  {Object.entries(tipoServicioConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-[#E8E8E8]">
                      {config.icon} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as EstadoTrabajo | 'todos')}>
                <SelectTrigger className="w-32 bg-[#111111] border-[rgba(143,179,201,0.2)] text-[#E8E8E8]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[rgba(143,179,201,0.2)]">
                  <SelectItem value="todos" className="text-[#E8E8E8]">Todos</SelectItem>
                  {Object.entries(estadoTrabajoConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-[#E8E8E8]">
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  setEditingTrabajo(null)
                  setPreselectedClienteId(undefined)
                  setIsModalOpen(true)
                }}
                className="bg-[#8FB3C9] hover:bg-[#7DA3B9] text-[#0A0A0A] font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo trabajo
              </Button>
            </div>
          </div>

          {/* Tabla de trabajos */}
          <div className="bg-[#111111] border border-[rgba(143,179,201,0.15)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(143,179,201,0.1)]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#888888] uppercase tracking-wider">Monto</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#888888] uppercase tracking-wider">Cachets</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#888888] uppercase tracking-wider">Ganancia</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Método</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#888888] uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(143,179,201,0.05)]">
                  {filteredTrabajos.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-[#666666]">
                        No hay trabajos que coincidan con los filtros
                      </td>
                    </tr>
                  ) : (
                    filteredTrabajos.map((trabajo) => {
                      const totalCachets = trabajo.modelos.reduce((s, m) => s + m.cachet, 0)
                      const ganancia = trabajo.monto_cobrado - totalCachets
                      const tipoConfig = tipoServicioConfig[trabajo.tipo]
                      const estadoConfig = estadoTrabajoConfig[trabajo.estado]

                      return (
                        <tr
                          key={trabajo.id}
                          className="hover:bg-[rgba(143,179,201,0.03)] transition-colors cursor-pointer"
                          onClick={() => setSelectedTrabajo(trabajo)}
                        >
                          <td className="px-4 py-3 text-sm text-[#AAAAAA]">
                            {formatFecha(trabajo.fecha)}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#E8E8E8] font-medium">
                            {trabajo.cliente.nombre}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                              style={{ backgroundColor: `${tipoConfig.color}20`, color: tipoConfig.color }}
                            >
                              {tipoConfig.icon} {tipoConfig.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#E8E8E8] text-right font-medium">
                            {formatARS(trabajo.monto_cobrado)}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#AAAAAA] text-right">
                            {formatARS(totalCachets)}
                          </td>
                          <td className={`px-4 py-3 text-sm text-right font-medium ${ganancia >= 0 ? 'text-[#4ADE80]' : 'text-red-400'}`}>
                            {formatARS(ganancia)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium"
                              style={{ backgroundColor: `${estadoConfig.color}20`, color: estadoConfig.color }}
                            >
                              {estadoConfig.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#AAAAAA]">
                            {metodoPagoConfig[trabajo.metodo_pago].label}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTrabajo(trabajo)
                              }}
                              className="text-[#8FB3C9] hover:text-[#8FB3C9] hover:bg-[#8FB3C9]/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VISTA: Clientes */}
      {vistaActiva === 'clientes' && (
        <>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <Input
                placeholder="Buscar cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#111111] border-[rgba(143,179,201,0.2)] text-[#E8E8E8] placeholder:text-[#666666] focus:border-[#8FB3C9]"
              />
            </div>
            <Select value={filtroClienteEstado} onValueChange={(v) => setFiltroClienteEstado(v as 'todos' | 'activo' | 'inactivo')}>
              <SelectTrigger className="w-32 bg-[#111111] border-[rgba(143,179,201,0.2)] text-[#E8E8E8]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[rgba(143,179,201,0.2)]">
                <SelectItem value="todos" className="text-[#E8E8E8]">Todos</SelectItem>
                <SelectItem value="activo" className="text-[#E8E8E8]">Activos</SelectItem>
                <SelectItem value="inactivo" className="text-[#E8E8E8]">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid de clientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientesConEstadisticas.length === 0 ? (
              <div className="col-span-full bg-[#111111] border border-[rgba(143,179,201,0.15)] rounded-xl p-8 text-center">
                <p className="text-[#666666]">No hay clientes que coincidan con los filtros</p>
              </div>
            ) : (
              clientesConEstadisticas.map((cliente) => (
                <div
                  key={cliente.id}
                  onClick={() => setSelectedCliente(cliente)}
                  className="bg-[#111111] border border-[rgba(143,179,201,0.15)] rounded-xl p-4 hover:border-[#8FB3C9]/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#8FB3C9]/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#8FB3C9]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#E8E8E8]">{cliente.nombre}</h3>
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
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold text-[#E8E8E8]">{cliente.cantidad_trabajos}</p>
                      <p className="text-xs text-[#888888]">Trabajos</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#E8E8E8]">{formatARS(cliente.total_generado)}</p>
                      <p className="text-xs text-[#888888]">Total</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#8FB3C9]">{formatARS(cliente.ganancia_neta)}</p>
                      <p className="text-xs text-[#888888]">Ganancia</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* VISTA: Por tipo de servicio */}
      {vistaActiva === 'tipos' && (
        <>
          {/* Cards de resumen */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {resumenPorTipo.map((resumen) => {
              const config = tipoServicioConfig[resumen.tipo]
              return (
                <div
                  key={resumen.tipo}
                  className="bg-[#111111] border border-[rgba(143,179,201,0.15)] rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{config.icon}</span>
                    <span className="text-sm font-medium text-[#E8E8E8]">{config.label}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-[#E8E8E8]">{formatARS(resumen.total_ingresado)}</p>
                    <p className="text-xs text-[#888888]">{resumen.cantidad_trabajos} trabajos</p>
                    <p className="text-sm font-medium text-[#8FB3C9]">
                      Ganancia: {formatARS(resumen.ganancia_neta)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Gráfico de torta */}
          {chartData.length > 0 && (
            <div className="bg-[#111111] border border-[rgba(143,179,201,0.15)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[#888888] mb-4">Distribución de ingresos por tipo</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatARS(value)}
                      contentStyle={{
                        backgroundColor: '#1A1A1A',
                        border: '1px solid rgba(143,179,201,0.2)',
                        borderRadius: '8px',
                        color: '#E8E8E8',
                      }}
                    />
                    <Legend
                      formatter={(value) => <span className="text-[#AAAAAA]">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tabla detalle por tipo */}
          <div className="bg-[#111111] border border-[rgba(143,179,201,0.15)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[rgba(143,179,201,0.1)]">
              <h3 className="text-sm font-medium text-[#888888]">Detalle por tipo de servicio</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(143,179,201,0.1)]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#888888] uppercase tracking-wider">Trabajos</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#888888] uppercase tracking-wider">Total ingresado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#888888] uppercase tracking-wider">Ganancia neta</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#888888] uppercase tracking-wider">Margen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(143,179,201,0.05)]">
                  {resumenPorTipo.map((resumen) => {
                    const config = tipoServicioConfig[resumen.tipo]
                    const margen = resumen.total_ingresado > 0
                      ? ((resumen.ganancia_neta / resumen.total_ingresado) * 100).toFixed(1)
                      : '0'
                    return (
                      <tr key={resumen.tipo} className="hover:bg-[rgba(143,179,201,0.03)]">
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: `${config.color}20`, color: config.color }}
                          >
                            {config.icon} {config.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#E8E8E8] text-right">
                          {resumen.cantidad_trabajos}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#E8E8E8] text-right font-medium">
                          {formatARS(resumen.total_ingresado)}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#8FB3C9] text-right font-medium">
                          {formatARS(resumen.ganancia_neta)}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#AAAAAA] text-right">
                          {margen}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Panel lateral de trabajo */}
      {selectedTrabajo && (
        <TrabajoPanel
          trabajo={selectedTrabajo}
          onClose={() => setSelectedTrabajo(null)}
          onEdit={handleEditTrabajo}
        />
      )}

      {/* Panel lateral de cliente */}
      {selectedCliente && (
        <ClientePanel
          cliente={selectedCliente}
          trabajos={trabajos}
          onClose={() => setSelectedCliente(null)}
          onNuevoTrabajo={() => handleNuevoTrabajoParaCliente(selectedCliente.id)}
        />
      )}

      {/* Modal de trabajo */}
      <TrabajoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTrabajo(null)
          setPreselectedClienteId(undefined)
        }}
        trabajo={editingTrabajo}
        clientes={clientes}
        onSave={handleSaveTrabajo}
        preselectedClienteId={preselectedClienteId}
      />
    </div>
  )
}
