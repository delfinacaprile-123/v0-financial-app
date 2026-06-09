'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createMovimientoCaja, updateMovimientoCaja, deleteMovimientoCaja } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, ArrowLeftRight, ChevronLeft, ChevronRight, Wallet, User, Users } from 'lucide-react'
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { MovimientoModal } from './movimiento-modal'
import { toast } from 'sonner'
import type { Movimiento, TipoMovimiento, PersonaCaja, SaldoPersona, ResumenMensual } from '@/types/caja'

interface CajaClientProps {
  initialMovimientos: Movimiento[]
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function CajaClient({ initialMovimientos }: CajaClientProps) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>(initialMovimientos)

  // Sincroniza con los datos del servidor tras router.refresh()
  useEffect(() => {
    setMovimientos(initialMovimientos)
  }, [initialMovimientos])

  const [activeTab, setActiveTab] = useState('movimientos')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroPersona, setFiltroPersona] = useState<string>('todos')
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth())
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear())
  const [modalOpen, setModalOpen] = useState(false)
  const [movimientoEditar, setMovimientoEditar] = useState<Movimiento | null>(null)
  const [personaDetalle, setPersonaDetalle] = useState<PersonaCaja>('secretaria')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Calcular saldos
  const calcularSaldos = useMemo(() => {
    let saldoSecretaria = 0
    let saldoMama = 0

    const sortedMovimientos = [...movimientos].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    )

    for (const mov of sortedMovimientos) {
      if (mov.tipo === 'ingreso') {
        if (mov.enPoderDe === 'secretaria') saldoSecretaria += mov.monto
        else saldoMama += mov.monto
      } else if (mov.tipo === 'egreso') {
        if (mov.enPoderDe === 'secretaria') saldoSecretaria -= mov.monto
        else saldoMama -= mov.monto
      } else if (mov.tipo === 'transferencia') {
        if (mov.de === 'secretaria') {
          saldoSecretaria -= mov.monto
          saldoMama += mov.monto
        } else {
          saldoMama -= mov.monto
          saldoSecretaria += mov.monto
        }
      }
    }

    return { saldoSecretaria, saldoMama }
  }, [movimientos])

  // Filtrar movimientos
  const movimientosFiltrados = useMemo(() => {
    const inicio = startOfMonth(new Date(anioSeleccionado, mesSeleccionado))
    const fin = endOfMonth(new Date(anioSeleccionado, mesSeleccionado))

    return movimientos
      .filter(mov => {
        const fecha = parseISO(mov.fecha)
        if (!isWithinInterval(fecha, { start: inicio, end: fin })) return false
        if (filtroTipo !== 'todos' && mov.tipo !== filtroTipo) return false
        if (filtroPersona !== 'todos') {
          if (mov.tipo === 'transferencia') {
            if (mov.de !== filtroPersona && mov.para !== filtroPersona) return false
          } else if (mov.enPoderDe !== filtroPersona) {
            return false
          }
        }
        return true
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [movimientos, filtroTipo, filtroPersona, mesSeleccionado, anioSeleccionado])

  // Movimientos por persona para detalle
  const movimientosPersona = useMemo(() => {
    return movimientos
      .filter(mov => {
        if (mov.tipo === 'transferencia') {
          return mov.de === personaDetalle || mov.para === personaDetalle
        }
        return mov.enPoderDe === personaDetalle
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [movimientos, personaDetalle])

  // Ultimo movimiento por persona
  const ultimoMovimiento = (persona: PersonaCaja) => {
    const personaMovs = movimientos.filter(mov => {
      if (mov.tipo === 'transferencia') {
        return mov.de === persona || mov.para === persona
      }
      return mov.enPoderDe === persona
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    return personaMovs[0]
  }

  // Datos para grafico de evolucion
  const datosEvolucion = useMemo(() => {
    const meses: { mes: string; total: number }[] = []
    
    for (let i = 5; i >= 0; i--) {
      const fecha = subMonths(new Date(), i)
      const mesStr = format(fecha, 'MMM', { locale: es })
      const inicio = startOfMonth(fecha)
      const fin = endOfMonth(fecha)
      
      let total = 0
      const movsHastaFin = movimientos.filter(m => parseISO(m.fecha) <= fin)
      
      for (const mov of movsHastaFin) {
        if (mov.tipo === 'ingreso') total += mov.monto
        else if (mov.tipo === 'egreso') total -= mov.monto
      }
      
      meses.push({ mes: mesStr, total })
    }
    
    return meses
  }, [movimientos])

  // Resumen mensual
  const resumenMensual = useMemo((): ResumenMensual[] => {
    const resumen: ResumenMensual[] = []
    
    for (let i = 5; i >= 0; i--) {
      const fecha = subMonths(new Date(), i)
      const inicio = startOfMonth(fecha)
      const fin = endOfMonth(fecha)
      
      const movsDelMes = movimientos.filter(m => {
        const f = parseISO(m.fecha)
        return isWithinInterval(f, { start: inicio, end: fin })
      })
      
      let ingresos = 0
      let egresos = 0
      let transferencias = 0
      
      for (const mov of movsDelMes) {
        if (mov.tipo === 'ingreso') ingresos += mov.monto
        else if (mov.tipo === 'egreso') egresos += mov.monto
        else transferencias += mov.monto
      }
      
      // Calcular saldo final hasta ese mes
      let saldoFinal = 0
      const movsHastaFin = movimientos.filter(m => parseISO(m.fecha) <= fin)
      for (const mov of movsHastaFin) {
        if (mov.tipo === 'ingreso') saldoFinal += mov.monto
        else if (mov.tipo === 'egreso') saldoFinal -= mov.monto
      }
      
      resumen.push({
        mes: MESES[fecha.getMonth()],
        anio: fecha.getFullYear(),
        ingresos,
        egresos,
        transferencias,
        saldoFinal
      })
    }
    
    return resumen
  }, [movimientos])

  const handleSaveMovimiento = (data: Omit<Movimiento, 'id' | 'created_at'>) => {
    const input = {
      tipo: data.tipo,
      monto: data.monto,
      enPoderDe: data.enPoderDe,
      de: data.de,
      para: data.para,
      descripcion: data.descripcion,
      fecha: data.fecha,
    }

    if (movimientoEditar) {
      const id = movimientoEditar.id
      // Optimista
      setMovimientos(prev => prev.map(m => (m.id === id ? { ...m, ...data } : m)))
      startTransition(async () => {
        try {
          await updateMovimientoCaja(id, input)
          router.refresh()
        } catch {
          toast.error('Error al actualizar el movimiento')
          router.refresh()
        }
      })
    } else {
      const tempId = crypto.randomUUID()
      const nuevo: Movimiento = {
        ...data,
        id: tempId,
        created_at: new Date().toISOString(),
      }
      // Optimista
      setMovimientos(prev => [...prev, nuevo])
      startTransition(async () => {
        try {
          await createMovimientoCaja(input)
          router.refresh()
        } catch {
          toast.error('Error al guardar el movimiento')
          // Revertir
          setMovimientos(prev => prev.filter(m => m.id !== tempId))
        }
      })
    }
    setMovimientoEditar(null)
  }

  const handleEliminar = (id: string) => {
    if (confirm('¿Eliminar este movimiento?')) {
      const previo = movimientos
      setMovimientos(prev => prev.filter(m => m.id !== id))
      startTransition(async () => {
        try {
          await deleteMovimientoCaja(id)
          toast.success('Movimiento eliminado')
          router.refresh()
        } catch {
          toast.error('Error al eliminar el movimiento')
          setMovimientos(previo)
        }
      })
    }
  }

  const navegarMes = (direccion: number) => {
    let nuevoMes = mesSeleccionado + direccion
    let nuevoAnio = anioSeleccionado
    
    if (nuevoMes < 0) {
      nuevoMes = 11
      nuevoAnio--
    } else if (nuevoMes > 11) {
      nuevoMes = 0
      nuevoAnio++
    }
    
    setMesSeleccionado(nuevoMes)
    setAnioSeleccionado(nuevoAnio)
  }

  const getTipoBadge = (tipo: TipoMovimiento) => {
    switch (tipo) {
      case 'ingreso':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <TrendingUp className="w-3 h-3 mr-1" />
            Ingreso
          </Badge>
        )
      case 'egreso':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <TrendingDown className="w-3 h-3 mr-1" />
            Egreso
          </Badge>
        )
      case 'transferencia':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <ArrowLeftRight className="w-3 h-3 mr-1" />
            Transferencia
          </Badge>
        )
    }
  }

  const formatMonto = (monto: number, tipo: TipoMovimiento) => {
    const formatted = `$ ${monto.toLocaleString('es-AR')}`
    if (tipo === 'ingreso') return <span className="text-green-400">{formatted}</span>
    if (tipo === 'egreso') return <span className="text-red-400">-{formatted}</span>
    return <span className="text-blue-400">{formatted}</span>
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#1A1A1A] border border-[#2A2A2A]">
          <TabsTrigger 
            value="movimientos" 
            className="data-[state=active]:bg-[#7EC99A] data-[state=active]:text-black"
          >
            Movimientos
          </TabsTrigger>
          <TabsTrigger 
            value="resumen" 
            className="data-[state=active]:bg-[#7EC99A] data-[state=active]:text-black"
          >
            Resumen de saldos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="movimientos" className="space-y-6">
          {/* Cards de saldo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[#888888] text-sm">Secretaria</p>
                  <p className="text-xl font-semibold text-[#E5E5E5]">
                    $ {calcularSaldos.saldoSecretaria.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-[#888888] text-sm">Mama</p>
                  <p className="text-xl font-semibold text-[#E5E5E5]">
                    $ {calcularSaldos.saldoMama.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#111111] border border-[#7EC99A]/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#7EC99A]/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#7EC99A]" />
                </div>
                <div>
                  <p className="text-[#888888] text-sm">Total en circulacion</p>
                  <p className="text-xl font-semibold text-[#7EC99A]">
                    $ {(calcularSaldos.saldoSecretaria + calcularSaldos.saldoMama).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navegarMes(-1)}
                className="text-[#888888] hover:text-[#E5E5E5]"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-[#E5E5E5] min-w-[140px] text-center">
                {MESES[mesSeleccionado]} {anioSeleccionado}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navegarMes(1)}
                className="text-[#888888] hover:text-[#E5E5E5]"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[160px] bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <SelectItem value="todos" className="text-[#E5E5E5]">Todos los tipos</SelectItem>
                <SelectItem value="ingreso" className="text-[#E5E5E5]">Ingresos</SelectItem>
                <SelectItem value="egreso" className="text-[#E5E5E5]">Egresos</SelectItem>
                <SelectItem value="transferencia" className="text-[#E5E5E5]">Transferencias</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroPersona} onValueChange={setFiltroPersona}>
              <SelectTrigger className="w-[160px] bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]">
                <SelectValue placeholder="Persona" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <SelectItem value="todos" className="text-[#E5E5E5]">Todas</SelectItem>
                <SelectItem value="secretaria" className="text-[#E5E5E5]">Secretaria</SelectItem>
                <SelectItem value="mama" className="text-[#E5E5E5]">Mama</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1" />

            <Button 
              onClick={() => {
                setMovimientoEditar(null)
                setModalOpen(true)
              }}
              className="bg-[#7EC99A] hover:bg-[#6BB889] text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo movimiento
            </Button>
          </div>

          {/* Tabla */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#2A2A2A] hover:bg-transparent">
                  <TableHead className="text-[#888888]">Fecha</TableHead>
                  <TableHead className="text-[#888888]">Tipo</TableHead>
                  <TableHead className="text-[#888888]">Descripcion</TableHead>
                  <TableHead className="text-[#888888] text-right">Monto</TableHead>
                  <TableHead className="text-[#888888]">En poder de</TableHead>
                  <TableHead className="text-[#888888]">Registrado por</TableHead>
                  <TableHead className="text-[#888888] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-[#888888]">
                      No hay movimientos en este periodo
                    </TableCell>
                  </TableRow>
                ) : (
                  movimientosFiltrados.map((mov) => (
                    <TableRow 
                      key={mov.id} 
                      className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]"
                    >
                      <TableCell className="text-[#E5E5E5]">
                        {format(parseISO(mov.fecha), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>{getTipoBadge(mov.tipo)}</TableCell>
                      <TableCell className="text-[#E5E5E5] max-w-[250px] truncate">
                        {mov.descripcion}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatMonto(mov.monto, mov.tipo)}
                      </TableCell>
                      <TableCell className="text-[#888888]">
                        {mov.tipo === 'transferencia' 
                          ? `${mov.de === 'secretaria' ? 'Secretaria' : 'Mama'} → ${mov.para === 'secretaria' ? 'Secretaria' : 'Mama'}`
                          : mov.enPoderDe === 'secretaria' ? 'Secretaria' : 'Mama'
                        }
                      </TableCell>
                      <TableCell className="text-[#888888]">{mov.registradoPor}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setMovimientoEditar(mov)
                              setModalOpen(true)
                            }}
                            className="text-[#888888] hover:text-[#E5E5E5]"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEliminar(mov.id)}
                            className="text-[#888888] hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="resumen" className="space-y-6">
          {/* Cards grandes de saldo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-[#888888] text-sm">Secretaria</p>
                  <p className="text-2xl font-bold text-[#E5E5E5]">
                    $ {calcularSaldos.saldoSecretaria.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
              {ultimoMovimiento('secretaria') && (
                <div className="text-xs text-[#666666] border-t border-[#2A2A2A] pt-3">
                  Ultimo mov: {ultimoMovimiento('secretaria')!.descripcion.slice(0, 30)}...
                  <br />
                  {format(parseISO(ultimoMovimiento('secretaria')!.fecha), 'dd/MM/yyyy')}
                </div>
              )}
            </div>

            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-[#888888] text-sm">Mama</p>
                  <p className="text-2xl font-bold text-[#E5E5E5]">
                    $ {calcularSaldos.saldoMama.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
              {ultimoMovimiento('mama') && (
                <div className="text-xs text-[#666666] border-t border-[#2A2A2A] pt-3">
                  Ultimo mov: {ultimoMovimiento('mama')!.descripcion.slice(0, 30)}...
                  <br />
                  {format(parseISO(ultimoMovimiento('mama')!.fecha), 'dd/MM/yyyy')}
                </div>
              )}
            </div>

            <div className="bg-[#111111] border border-[#7EC99A]/30 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#7EC99A]/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#7EC99A]" />
                </div>
                <div>
                  <p className="text-[#888888] text-sm">Total en circulacion</p>
                  <p className="text-2xl font-bold text-[#7EC99A]">
                    $ {(calcularSaldos.saldoSecretaria + calcularSaldos.saldoMama).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
              <div className="text-xs text-[#666666] border-t border-[#2A2A2A] pt-3">
                Efectivo total disponible entre ambas
              </div>
            </div>
          </div>

          {/* Grafico de evolucion */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6">
            <h3 className="text-[#E5E5E5] font-medium mb-4">Evolucion del efectivo (ultimos 6 meses)</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datosEvolucion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="mes" stroke="#888888" fontSize={12} />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1A1A1A', 
                      border: '1px solid #2A2A2A',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#E5E5E5' }}
                    formatter={(value: number) => [`$ ${value.toLocaleString('es-AR')}`, 'Total']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#7EC99A" 
                    strokeWidth={2}
                    dot={{ fill: '#7EC99A', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla resumen mensual */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#2A2A2A]">
              <h3 className="text-[#E5E5E5] font-medium">Resumen mensual</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#2A2A2A] hover:bg-transparent">
                  <TableHead className="text-[#888888]">Mes</TableHead>
                  <TableHead className="text-[#888888] text-right">Ingresos</TableHead>
                  <TableHead className="text-[#888888] text-right">Egresos</TableHead>
                  <TableHead className="text-[#888888] text-right">Transferencias</TableHead>
                  <TableHead className="text-[#888888] text-right">Saldo final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumenMensual.map((res, idx) => (
                  <TableRow key={idx} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                    <TableCell className="text-[#E5E5E5]">{res.mes} {res.anio}</TableCell>
                    <TableCell className="text-right text-green-400">
                      $ {res.ingresos.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell className="text-right text-red-400">
                      $ {res.egresos.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell className="text-right text-blue-400">
                      $ {res.transferencias.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell className="text-right text-[#E5E5E5] font-medium">
                      $ {res.saldoFinal.toLocaleString('es-AR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Detalle por persona */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#2A2A2A]">
              <h3 className="text-[#E5E5E5] font-medium mb-3">Detalle por persona</h3>
              <Tabs value={personaDetalle} onValueChange={(v) => setPersonaDetalle(v as PersonaCaja)}>
                <TabsList className="bg-[#0A0A0A]">
                  <TabsTrigger 
                    value="secretaria" 
                    className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
                  >
                    Secretaria
                  </TabsTrigger>
                  <TabsTrigger 
                    value="mama" 
                    className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400"
                  >
                    Mama
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#2A2A2A] hover:bg-transparent">
                  <TableHead className="text-[#888888]">Fecha</TableHead>
                  <TableHead className="text-[#888888]">Tipo</TableHead>
                  <TableHead className="text-[#888888]">Descripcion</TableHead>
                  <TableHead className="text-[#888888] text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientosPersona.slice(0, 10).map((mov) => (
                  <TableRow key={mov.id} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                    <TableCell className="text-[#E5E5E5]">
                      {format(parseISO(mov.fecha), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{getTipoBadge(mov.tipo)}</TableCell>
                    <TableCell className="text-[#E5E5E5] max-w-[250px] truncate">
                      {mov.descripcion}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMonto(mov.monto, mov.tipo)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <MovimientoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveMovimiento}
        movimiento={movimientoEditar}
        saldoSecretaria={calcularSaldos.saldoSecretaria}
        saldoMama={calcularSaldos.saldoMama}
      />
    </div>
  )
}
