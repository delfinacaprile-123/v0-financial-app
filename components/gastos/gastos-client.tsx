'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createGasto, updateGasto, toggleGastoPagado, deleteGasto } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { GastoModal } from './gasto-modal'
import { toast } from 'sonner'
import type { Gasto, CategoriaGasto } from '@/types/gastos'
import { CATEGORIA_LABELS, FRECUENCIA_LABELS, METODO_LABELS } from '@/types/gastos'

interface GastosClientProps {
  initialGastos: Gasto[]
}

const CATEGORIA_STYLES: Record<CategoriaGasto, string> = {
  sueldo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  impuesto: 'bg-red-500/20 text-red-400 border-red-500/30',
  gasto_fijo: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  otro: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
}

export function GastosClient({ initialGastos }: GastosClientProps) {
  const [gastos, setGastos] = useState<Gasto[]>(initialGastos)

  // Sincroniza con los datos del servidor tras router.refresh()
  useEffect(() => {
    setGastos(initialGastos)
  }, [initialGastos])

  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [gastoEditar, setGastoEditar] = useState<Gasto | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const gastosFiltrados = useMemo(() => {
    return gastos.filter((g) => {
      if (filtroCategoria !== 'todos' && g.categoria !== filtroCategoria) return false
      if (filtroEstado === 'pagado' && !g.pagado) return false
      if (filtroEstado === 'pendiente' && g.pagado) return false
      return true
    })
  }, [gastos, filtroCategoria, filtroEstado])

  const totales = useMemo(() => {
    const total = gastos.reduce((sum, g) => sum + g.monto, 0)
    const pagado = gastos.filter((g) => g.pagado).reduce((sum, g) => sum + g.monto, 0)
    const pendiente = total - pagado
    return { total, pagado, pendiente }
  }, [gastos])

  const handleSaveGasto = (data: Omit<Gasto, 'id' | 'created_at'>) => {
    const input = {
      nombre: data.nombre,
      categoria: data.categoria,
      monto: data.monto,
      frecuencia: data.frecuencia,
      metodo: data.metodo,
      fecha_pago: data.fecha_pago,
      mes_correspondiente: data.mes_correspondiente,
      pagado: data.pagado,
      notas: data.notas,
    }

    if (gastoEditar) {
      const id = gastoEditar.id
      setGastos((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)))
      startTransition(async () => {
        try {
          await updateGasto(id, input)
          toast.success('Gasto actualizado')
          router.refresh()
        } catch {
          toast.error('Error al actualizar el gasto')
          router.refresh()
        }
      })
    } else {
      const tempId = crypto.randomUUID()
      const nuevo: Gasto = { ...data, id: tempId, created_at: new Date().toISOString() }
      setGastos((prev) => [nuevo, ...prev])
      startTransition(async () => {
        try {
          await createGasto(input)
          toast.success('Gasto registrado')
          router.refresh()
        } catch {
          toast.error('Error al guardar el gasto')
          setGastos((prev) => prev.filter((g) => g.id !== tempId))
        }
      })
    }
    setGastoEditar(null)
  }

  const handleTogglePagado = (id: string, pagado: boolean) => {
    const previo = gastos
    setGastos((prev) => prev.map((g) => (g.id === id ? { ...g, pagado } : g)))
    startTransition(async () => {
      try {
        await toggleGastoPagado(id, pagado)
        router.refresh()
      } catch {
        toast.error('Error al actualizar el estado')
        setGastos(previo)
      }
    })
  }

  const handleEliminar = (id: string) => {
    if (confirm('¿Eliminar este gasto?')) {
      const previo = gastos
      setGastos((prev) => prev.filter((g) => g.id !== id))
      startTransition(async () => {
        try {
          await deleteGasto(id)
          toast.success('Gasto eliminado')
          router.refresh()
        } catch {
          toast.error('Error al eliminar el gasto')
          setGastos(previo)
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C9A96E]/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#C9A96E]" />
            </div>
            <div>
              <p className="text-[#888888] text-sm">Total gastos</p>
              <p className="text-xl font-semibold text-[#E5E5E5]">
                $ {totales.total.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-[#888888] text-sm">Pagado</p>
              <p className="text-xl font-semibold text-green-400">
                $ {totales.pagado.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-[#888888] text-sm">Pendiente</p>
              <p className="text-xl font-semibold text-red-400">
                $ {totales.pendiente.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-[180px] bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
            <SelectItem value="todos" className="text-[#E5E5E5]">Todas las categorías</SelectItem>
            {(Object.keys(CATEGORIA_LABELS) as CategoriaGasto[]).map((c) => (
              <SelectItem key={c} value={c} className="text-[#E5E5E5]">
                {CATEGORIA_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-[160px] bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
            <SelectItem value="todos" className="text-[#E5E5E5]">Todos</SelectItem>
            <SelectItem value="pagado" className="text-[#E5E5E5]">Pagados</SelectItem>
            <SelectItem value="pendiente" className="text-[#E5E5E5]">Pendientes</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button
          onClick={() => {
            setGastoEditar(null)
            setModalOpen(true)
          }}
          className="bg-[#C9A96E] hover:bg-[#B89860] text-black"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo gasto
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#2A2A2A] hover:bg-transparent">
              <TableHead className="text-[#888888]">Nombre</TableHead>
              <TableHead className="text-[#888888]">Categoría</TableHead>
              <TableHead className="text-[#888888] text-right">Monto</TableHead>
              <TableHead className="text-[#888888]">Frecuencia</TableHead>
              <TableHead className="text-[#888888]">Método</TableHead>
              <TableHead className="text-[#888888]">Fecha pago</TableHead>
              <TableHead className="text-[#888888]">Mes</TableHead>
              <TableHead className="text-[#888888] text-center">Pagado</TableHead>
              <TableHead className="text-[#888888] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gastosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-[#888888]">
                  No hay gastos registrados
                </TableCell>
              </TableRow>
            ) : (
              gastosFiltrados.map((g) => (
                <TableRow key={g.id} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                  <TableCell className="text-[#E5E5E5]">{g.nombre}</TableCell>
                  <TableCell>
                    <Badge className={CATEGORIA_STYLES[g.categoria]}>
                      {CATEGORIA_LABELS[g.categoria]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-[#E5E5E5]">
                    $ {g.monto.toLocaleString('es-AR')}
                  </TableCell>
                  <TableCell className="text-[#888888]">{FRECUENCIA_LABELS[g.frecuencia]}</TableCell>
                  <TableCell className="text-[#888888]">{METODO_LABELS[g.metodo]}</TableCell>
                  <TableCell className="text-[#E5E5E5]">
                    {format(parseISO(g.fecha_pago), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="text-[#888888]">{g.mes_correspondiente || '—'}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={g.pagado}
                        onCheckedChange={(checked) => handleTogglePagado(g.id, checked)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setGastoEditar(g)
                          setModalOpen(true)
                        }}
                        className="text-[#888888] hover:text-[#E5E5E5]"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEliminar(g.id)}
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

      <GastoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveGasto}
        gasto={gastoEditar}
      />
    </div>
  )
}
