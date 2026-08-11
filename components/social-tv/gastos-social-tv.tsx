'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { createGastoSocialTV, deleteGastoSocialTV, type GastoSocialTVInput } from '@/lib/actions'
import {
  formatARS,
  categoriaGastoTVConfig,
  type GastoSocialTV,
  type CategoriaGastoTV,
} from '@/types/social-tv'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const CATEGORIAS = Object.keys(categoriaGastoTVConfig) as CategoriaGastoTV[]

interface GastosSocialTVProps {
  gastosIniciales: GastoSocialTV[]
}

export function GastosSocialTV({ gastosIniciales }: GastosSocialTVProps) {
  const router = useRouter()
  const [gastos, setGastos] = useState<GastoSocialTV[]>(gastosIniciales)
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [anio, setAnio] = useState(new Date().getFullYear())
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form
  const [categoria, setCategoria] = useState<CategoriaGastoTV>('notas')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'))

  const gastosFiltrados = useMemo(() => {
    return gastos
      .filter((g) => g.mes === mes && g.anio === anio)
      .filter((g) => filtroCategoria === 'todos' || g.categoria === filtroCategoria)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [gastos, mes, anio, filtroCategoria])

  const totalMes = useMemo(
    () => gastosFiltrados.reduce((sum, g) => sum + Number(g.monto), 0),
    [gastosFiltrados]
  )

  const totalesPorCategoria = useMemo(() => {
    const map: Record<string, number> = {}
    for (const g of gastos.filter((x) => x.mes === mes && x.anio === anio)) {
      map[g.categoria] = (map[g.categoria] ?? 0) + Number(g.monto)
    }
    return map
  }, [gastos, mes, anio])

  const cambiarMes = (delta: number) => {
    let nuevoMes = mes + delta
    let nuevoAnio = anio
    if (nuevoMes < 1) { nuevoMes = 12; nuevoAnio -= 1 }
    if (nuevoMes > 12) { nuevoMes = 1; nuevoAnio += 1 }
    setMes(nuevoMes)
    setAnio(nuevoAnio)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = parseFloat(monto)
    if (!montoNum || montoNum <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }

    const input: GastoSocialTVInput = {
      categoria,
      descripcion: descripcion.trim() || undefined,
      monto: montoNum,
      fecha,
    }

    const tempId = crypto.randomUUID()
    const d = new Date(fecha)
    const optimista: GastoSocialTV = {
      id: tempId,
      categoria,
      descripcion: descripcion.trim() || null,
      monto: montoNum,
      fecha,
      mes: d.getUTCMonth() + 1,
      anio: d.getUTCFullYear(),
    }
    setGastos((prev) => [optimista, ...prev])
    setModalOpen(false)
    setDescripcion('')
    setMonto('')
    setCategoria('notas')
    setFecha(format(new Date(), 'yyyy-MM-dd'))

    startTransition(async () => {
      try {
        await createGastoSocialTV(input)
        toast.success('Gasto registrado')
        router.refresh()
      } catch {
        toast.error('Error al registrar el gasto')
        setGastos((prev) => prev.filter((g) => g.id !== tempId))
      }
    })
  }

  const handleDelete = (id: string) => {
    setGastos((prev) => prev.filter((g) => g.id !== id))
    startTransition(async () => {
      try {
        await deleteGastoSocialTV(id)
        router.refresh()
      } catch {
        toast.error('Error al eliminar el gasto')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header con navegacion de mes */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => cambiarMes(-1)}
            className="text-[#888888] hover:text-[#E5E5E5]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[150px] text-center font-medium text-[#E5E5E5]">
            {MESES[mes - 1]} {anio}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => cambiarMes(1)}
            className="text-[#888888] hover:text-[#E5E5E5]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-[190px] bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
            <SelectItem value="todos" className="text-[#E5E5E5]">Todas las categorias</SelectItem>
            {CATEGORIAS.map((cat) => (
              <SelectItem key={cat} value={cat} className="text-[#E5E5E5]">
                {categoriaGastoTVConfig[cat].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-[#B09EC9] text-black hover:bg-[#9d89ba]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo gasto
        </Button>
      </div>

      {/* Resumen por categoria */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {CATEGORIAS.map((cat) => (
          <div
            key={cat}
            className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: categoriaGastoTVConfig[cat].color }}
              />
              <span className="text-xs text-[#888888]">{categoriaGastoTVConfig[cat].label}</span>
            </div>
            <p className="mt-2 text-lg font-medium text-[#E5E5E5]">
              {formatARS(totalesPorCategoria[cat] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      {/* Total del mes */}
      <div className="flex items-center justify-between rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3">
        <span className="text-sm text-[#888888]">
          Total gastos {MESES[mes - 1]} {anio}
          {filtroCategoria !== 'todos' && ` · ${categoriaGastoTVConfig[filtroCategoria as CategoriaGastoTV].label}`}
        </span>
        <span className="text-xl font-semibold text-[#B09EC9]">{formatARS(totalMes)}</span>
      </div>

      {/* Lista */}
      <div className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#111111]">
        {gastosFiltrados.length === 0 ? (
          <p className="py-10 text-center text-[#888888]">No hay gastos registrados en este periodo</p>
        ) : (
          <ul className="divide-y divide-[#2A2A2A]">
            {gastosFiltrados.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="shrink-0 border-[#2A2A2A]"
                    style={{ color: categoriaGastoTVConfig[g.categoria].color }}
                  >
                    {categoriaGastoTVConfig[g.categoria].label}
                  </Badge>
                  <div>
                    <p className="text-sm text-[#E5E5E5]">
                      {g.descripcion || categoriaGastoTVConfig[g.categoria].label}
                    </p>
                    <p className="text-xs text-[#888888]">
                      {format(new Date(g.fecha), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#E5E5E5]">{formatARS(Number(g.monto))}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(g.id)}
                    className="text-[#888888] hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal nuevo gasto */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md border-[#2A2A2A] bg-[#111111] text-[#E5E5E5]">
          <DialogHeader>
            <DialogTitle className="text-[#E5E5E5]">Nuevo gasto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#888888]">Categoria</Label>
              <Select value={categoria} onValueChange={(v) => setCategoria(v as CategoriaGastoTV)}>
                <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  {CATEGORIAS.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-[#E5E5E5]">
                      {categoriaGastoTVConfig[cat].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#888888]">Monto</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]">$</span>
                <Input
                  type="text"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value.replace(/[^\d]/g, ''))}
                  className="bg-[#1A1A1A] border-[#2A2A2A] pl-7 text-[#E5E5E5]"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#888888]">Descripcion (opcional)</Label>
              <Textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="min-h-[70px] bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]"
                placeholder="Ej: Viaje de grabacion, alquiler equipo..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#888888]">Fecha</Label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="flex-1 border-[#2A2A2A] text-[#888888] hover:bg-[#1A1A1A]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-[#B09EC9] text-black hover:bg-[#9d89ba]"
              >
                {isPending ? 'Guardando...' : 'Registrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
