'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Trabajo,
  Cliente,
  TipoServicio,
  EstadoTrabajo,
  MetodoPago,
  ModeloAsignada,
  formatARS,
  tipoServicioConfig,
  estadoTrabajoConfig,
  metodoPagoConfig,
} from '@/types/agencia'
import { toast } from 'sonner'

interface TrabajoModalProps {
  isOpen: boolean
  onClose: () => void
  trabajo?: Trabajo | null
  clientes: Cliente[]
  onSave: (trabajo: Partial<Trabajo>, isNew: boolean) => void
  preselectedClienteId?: string
}

export function TrabajoModal({
  isOpen,
  onClose,
  trabajo,
  clientes,
  onSave,
  preselectedClienteId,
}: TrabajoModalProps) {
  const [clienteId, setClienteId] = useState(trabajo?.cliente_id || preselectedClienteId || '')
  const [nuevoCliente, setNuevoCliente] = useState('')
  const [creandoCliente, setCreandoCliente] = useState(false)
  const [tipo, setTipo] = useState<TipoServicio>(trabajo?.tipo || 'produccion')
  const [fecha, setFecha] = useState(trabajo?.fecha || new Date().toISOString().split('T')[0])
  const [montoCobrado, setMontoCobrado] = useState(trabajo?.monto_cobrado?.toString() || '')
  const [estado, setEstado] = useState<EstadoTrabajo>(trabajo?.estado || 'pendiente')
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(trabajo?.metodo_pago || 'transferencia')
  const [notas, setNotas] = useState(trabajo?.notas || '')
  const [modelos, setModelos] = useState<ModeloAsignada[]>(
    trabajo?.modelos || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (trabajo) {
      setClienteId(trabajo.cliente_id)
      setTipo(trabajo.tipo)
      setFecha(trabajo.fecha)
      setMontoCobrado(trabajo.monto_cobrado.toString())
      setEstado(trabajo.estado)
      setMetodoPago(trabajo.metodo_pago)
      setNotas(trabajo.notas || '')
      setModelos(trabajo.modelos || [])
    } else {
      setClienteId(preselectedClienteId || '')
      setTipo('produccion')
      setFecha(new Date().toISOString().split('T')[0])
      setMontoCobrado('')
      setEstado('pendiente')
      setMetodoPago('transferencia')
      setNotas('')
      setModelos([])
    }
    setCreandoCliente(false)
    setNuevoCliente('')
  }, [trabajo, isOpen, preselectedClienteId])

  const totalCachets = modelos.reduce((sum, m) => sum + m.cachet, 0)
  const gananciaNeta = (parseFloat(montoCobrado) || 0) - totalCachets

  const handleAddModelo = () => {
    setModelos([
      ...modelos,
      { id: Date.now().toString(), nombre: '', cachet: 0 },
    ])
  }

  const handleRemoveModelo = (id: string) => {
    setModelos(modelos.filter((m) => m.id !== id))
  }

  const handleModeloChange = (id: string, field: 'nombre' | 'cachet', value: string | number) => {
    setModelos(
      modelos.map((m) =>
        m.id === id ? { ...m, [field]: field === 'cachet' ? Number(value) : value } : m
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const trabajoData: Partial<Trabajo> = {
        cliente_id: creandoCliente ? 'new' : clienteId,
        tipo,
        fecha,
        monto_cobrado: parseFloat(montoCobrado),
        estado,
        metodo_pago: metodoPago,
        notas: notas || undefined,
        modelos: modelos.filter((m) => m.nombre.trim() !== ''),
      }

      if (creandoCliente && nuevoCliente.trim()) {
        // En modo real, aquí crearíamos el cliente primero
        trabajoData.cliente = {
          id: Date.now().toString(),
          nombre: nuevoCliente.trim(),
          activo: true,
        }
      }

      onSave(trabajoData, !trabajo)
      toast.success(trabajo ? 'Trabajo actualizado' : 'Trabajo creado')
      onClose()
    } catch {
      toast.error('Error al guardar el trabajo')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111111] border border-[rgba(143,179,201,0.2)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-[#111111] border-b border-[rgba(143,179,201,0.15)] p-4 flex items-center justify-between z-10">
          <h2 className="font-serif text-xl text-[#E8E8E8]">
            {trabajo ? 'Editar trabajo' : 'Nuevo trabajo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#888888]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cliente */}
          <div className="space-y-2">
            <Label className="text-[#AAAAAA]">Cliente</Label>
            {creandoCliente ? (
              <div className="flex gap-2">
                <Input
                  value={nuevoCliente}
                  onChange={(e) => setNuevoCliente(e.target.value)}
                  placeholder="Nombre del nuevo cliente"
                  className="bg-[#0A0A0A] border-[rgba(143,179,201,0.2)] text-[#E8E8E8] focus:border-[#8FB3C9]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setCreandoCliente(false)
                    setNuevoCliente('')
                  }}
                  className="text-[#888888] hover:text-[#E8E8E8]"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[rgba(143,179,201,0.2)] text-[#E8E8E8] focus:border-[#8FB3C9]">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[rgba(143,179,201,0.2)]">
                    {clientes.map((cliente) => (
                      <SelectItem
                        key={cliente.id}
                        value={cliente.id}
                        className="text-[#E8E8E8] focus:bg-[#2A2A2A] focus:text-[#E8E8E8]"
                      >
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreandoCliente(true)}
                  className="border-[rgba(143,179,201,0.3)] text-[#8FB3C9] hover:bg-[#8FB3C9]/10 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nuevo
                </Button>
              </div>
            )}
          </div>

          {/* Tipo y Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#AAAAAA]">Tipo de servicio</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoServicio)}>
                <SelectTrigger className="bg-[#0A0A0A] border-[rgba(143,179,201,0.2)] text-[#E8E8E8] focus:border-[#8FB3C9]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[rgba(143,179,201,0.2)]">
                  {Object.entries(tipoServicioConfig).map(([key, config]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="text-[#E8E8E8] focus:bg-[#2A2A2A] focus:text-[#E8E8E8]"
                    >
                      {config.icon} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#AAAAAA]">Fecha</Label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="bg-[#0A0A0A] border-[rgba(143,179,201,0.2)] text-[#E8E8E8] focus:border-[#8FB3C9]"
              />
            </div>
          </div>

          {/* Monto y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#AAAAAA]">Monto cobrado (ARS)</Label>
              <Input
                type="number"
                value={montoCobrado}
                onChange={(e) => setMontoCobrado(e.target.value)}
                placeholder="0"
                className="bg-[#0A0A0A] border-[rgba(143,179,201,0.2)] text-[#E8E8E8] focus:border-[#8FB3C9]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#AAAAAA]">Estado</Label>
              <Select value={estado} onValueChange={(v) => setEstado(v as EstadoTrabajo)}>
                <SelectTrigger className="bg-[#0A0A0A] border-[rgba(143,179,201,0.2)] text-[#E8E8E8] focus:border-[#8FB3C9]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[rgba(143,179,201,0.2)]">
                  {Object.entries(estadoTrabajoConfig).map(([key, config]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="text-[#E8E8E8] focus:bg-[#2A2A2A] focus:text-[#E8E8E8]"
                    >
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <Label className="text-[#AAAAAA]">Método de pago</Label>
            <Select value={metodoPago} onValueChange={(v) => setMetodoPago(v as MetodoPago)}>
              <SelectTrigger className="bg-[#0A0A0A] border-[rgba(143,179,201,0.2)] text-[#E8E8E8] focus:border-[#8FB3C9]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[rgba(143,179,201,0.2)]">
                {Object.entries(metodoPagoConfig).map(([key, config]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="text-[#E8E8E8] focus:bg-[#2A2A2A] focus:text-[#E8E8E8]"
                  >
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modelos asignadas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[#AAAAAA]">Modelos asignadas</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddModelo}
                className="text-[#8FB3C9] hover:text-[#8FB3C9] hover:bg-[#8FB3C9]/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar modelo
              </Button>
            </div>
            
            {modelos.length === 0 ? (
              <p className="text-[#666666] text-sm py-2">Sin modelos asignadas</p>
            ) : (
              <div className="space-y-2">
                {modelos.map((modelo) => (
                  <div key={modelo.id} className="flex gap-2 items-center">
                    <Input
                      placeholder="Nombre de la modelo"
                      value={modelo.nombre}
                      onChange={(e) => handleModeloChange(modelo.id, 'nombre', e.target.value)}
                      className="flex-1 bg-[#0A0A0A] border-[rgba(143,179,201,0.2)] text-[#E8E8E8] focus:border-[#8FB3C9]"
                    />
                    <Input
                      type="number"
                      placeholder="Cachet"
                      value={modelo.cachet || ''}
                      onChange={(e) => handleModeloChange(modelo.id, 'cachet', e.target.value)}
                      className="w-32 bg-[#0A0A0A] border-[rgba(143,179,201,0.2)] text-[#E8E8E8] focus:border-[#8FB3C9]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveModelo(modelo.id)}
                      className="p-2 text-[#666666] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Resumen de ganancia */}
            <div className="bg-[#0A0A0A] border border-[rgba(143,179,201,0.15)] rounded-lg p-4 mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#888888]">Total cachets:</span>
                <span className="text-[#E8E8E8]">{formatARS(totalCachets)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#AAAAAA] font-medium">Ganancia neta:</span>
                <span className={`text-lg font-semibold ${gananciaNeta < 0 ? 'text-red-400' : 'text-[#8FB3C9]'}`}>
                  {formatARS(gananciaNeta)}
                </span>
              </div>
              {gananciaNeta < 0 && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>La ganancia es negativa</span>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label className="text-[#AAAAAA]">Notas (opcional)</Label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas adicionales sobre el trabajo..."
              className="bg-[#0A0A0A] border-[rgba(143,179,201,0.2)] text-[#E8E8E8] focus:border-[#8FB3C9] min-h-[80px]"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-[#888888] hover:text-[#E8E8E8] hover:bg-[#1A1A1A]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (!clienteId && !nuevoCliente.trim()) || !montoCobrado}
              className="flex-1 bg-[#8FB3C9] hover:bg-[#7DA3B9] text-[#0A0A0A] font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : trabajo ? 'Guardar cambios' : 'Crear trabajo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
