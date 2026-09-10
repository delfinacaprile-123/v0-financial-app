'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Search, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { UsuarioModal } from './usuario-modal'
import { CursoModal } from './curso-modal'
import { ClienteModal } from './cliente-modal'
import type { UsuarioConfig, CursoConfig, ClienteConfig } from '@/types/configuracion'
import { createCurso, updateCurso } from '@/lib/actions'
import { BackupSection } from '@/components/configuracion/backup-section'

interface ConfiguracionClientProps {
  usuarios: UsuarioConfig[]
  cursos: CursoConfig[]
  clientes: ClienteConfig[]
  esAdmin?: boolean
}

type TabType = 'usuarios' | 'cursos' | 'clientes' | 'backup'

export function ConfiguracionClient({ 
  usuarios: initialUsuarios, 
  cursos: initialCursos, 
  clientes: initialClientes,
  esAdmin = false,
}: ConfiguracionClientProps) {
  const router = useRouter()
  // La administrativa (Eugenia) solo accede a Cursos; el resto es solo admin.
  const [activeTab, setActiveTab] = useState<TabType>(esAdmin ? 'usuarios' : 'cursos')
  const [searchTerm, setSearchTerm] = useState('')
  const [unidadFilter, setUnidadFilter] = useState<'todos' | 'agencia' | 'social_tv'>('todos')
  
  // Data state
  const [usuarios, setUsuarios] = useState(initialUsuarios)
  const [cursos, setCursos] = useState(initialCursos)
  const [clientes, setClientes] = useState(initialClientes)

  // Mantiene la lista de cursos en sync con los datos del servidor tras router.refresh()
  useEffect(() => {
    setCursos(initialCursos)
  }, [initialCursos])
  
  // Modal state
  const [usuarioModalOpen, setUsuarioModalOpen] = useState(false)
  const [usuarioModalMode, setUsuarioModalMode] = useState<'invite' | 'edit'>('invite')
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioConfig | null>(null)
  
  const [cursoModalOpen, setCursoModalOpen] = useState(false)
  const [selectedCurso, setSelectedCurso] = useState<CursoConfig | null>(null)
  
  const [clienteModalOpen, setClienteModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<ClienteConfig | null>(null)
  
  // Alert dialog for deactivating curso
  const [deactivateCursoAlert, setDeactivateCursoAlert] = useState(false)
  const [cursoToDeactivate, setCursoToDeactivate] = useState<CursoConfig | null>(null)

  const allTabs: { id: TabType; label: string; adminOnly: boolean }[] = [
    { id: 'usuarios', label: 'Usuarios', adminOnly: true },
    { id: 'cursos', label: 'Cursos', adminOnly: false },
    { id: 'clientes', label: 'Clientes', adminOnly: true },
    { id: 'backup', label: 'Backup', adminOnly: true },
  ]
  // La administrativa (Eugenia) solo ve la pestana Cursos.
  const tabs = allTabs.filter((tab) => esAdmin || !tab.adminOnly)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Usuario handlers
  const handleInviteUsuario = () => {
    setSelectedUsuario(null)
    setUsuarioModalMode('invite')
    setUsuarioModalOpen(true)
  }

  const handleEditUsuario = (usuario: UsuarioConfig) => {
    setSelectedUsuario(usuario)
    setUsuarioModalMode('edit')
    setUsuarioModalOpen(true)
  }

  const handleSaveUsuario = (data: Partial<UsuarioConfig>) => {
    if (usuarioModalMode === 'invite') {
      const newUsuario: UsuarioConfig = {
        id: `user-${Date.now()}`,
        nombre: data.nombre || '',
        email: data.email || '',
        rol: data.rol || 'administrativa',
        created_at: new Date().toISOString(),
      }
      setUsuarios([...usuarios, newUsuario])
    } else if (selectedUsuario) {
      setUsuarios(usuarios.map(u => 
        u.id === selectedUsuario.id ? { ...u, ...data } : u
      ))
    }
  }

  // Curso handlers
  const handleNewCurso = () => {
    setSelectedCurso(null)
    setCursoModalOpen(true)
  }

  const handleEditCurso = (curso: CursoConfig) => {
    setSelectedCurso(curso)
    setCursoModalOpen(true)
  }

  const handleSaveCurso = async (data: Partial<CursoConfig>) => {
    try {
      if (selectedCurso) {
        await updateCurso(selectedCurso.id, {
          nombre: data.nombre,
          precio_mensual: data.precio_mensual,
          activo: data.activo,
        })
        setCursos(cursos.map(c =>
          c.id === selectedCurso.id ? { ...c, ...data } : c
        ))
        toast.success('Curso actualizado')
      } else {
        await createCurso({
          nombre: data.nombre || '',
          precio_mensual: data.precio_mensual || 0,
          activo: data.activo ?? true,
        })
        toast.success('Curso creado')
        // El revalidatePath del server action refresca la lista con el id real
        router.refresh()
      }
    } catch (error) {
      console.error('[v0] Error al guardar curso:', error)
      toast.error('No se pudo guardar el curso')
    }
  }

  const persistToggleCurso = async (curso: CursoConfig, nuevoActivo: boolean) => {
    try {
      await updateCurso(curso.id, { activo: nuevoActivo })
      setCursos(cursos.map(c =>
        c.id === curso.id ? { ...c, activo: nuevoActivo } : c
      ))
      toast.success(nuevoActivo ? 'Curso activado' : 'Curso desactivado')
    } catch (error) {
      console.error('[v0] Error al cambiar estado del curso:', error)
      toast.error('No se pudo cambiar el estado del curso')
    }
  }

  const handleToggleCursoActivo = (curso: CursoConfig) => {
    if (curso.activo && curso.alumnos_activos > 0) {
      setCursoToDeactivate(curso)
      setDeactivateCursoAlert(true)
    } else {
      persistToggleCurso(curso, !curso.activo)
    }
  }

  const confirmDeactivateCurso = () => {
    if (cursoToDeactivate) {
      persistToggleCurso(cursoToDeactivate, false)
    }
    setDeactivateCursoAlert(false)
    setCursoToDeactivate(null)
  }

  // Cliente handlers
  const handleNewCliente = () => {
    setSelectedCliente(null)
    setClienteModalOpen(true)
  }

  const handleEditCliente = (cliente: ClienteConfig) => {
    setSelectedCliente(cliente)
    setClienteModalOpen(true)
  }

  const handleSaveCliente = (data: Partial<ClienteConfig>) => {
    if (selectedCliente) {
      setClientes(clientes.map(c => 
        c.id === selectedCliente.id ? { ...c, ...data } : c
      ))
    } else {
      const newCliente: ClienteConfig = {
        id: `cliente-${Date.now()}`,
        nombre: data.nombre || '',
        unidad: data.unidad || 'agencia',
        activo: data.activo ?? true,
        trabajos_count: 0,
        monto_mensual: data.monto_mensual,
        metodo_pago: data.metodo_pago,
      }
      setClientes([...clientes, newCliente])
    }
  }

  const handleToggleClienteActivo = (cliente: ClienteConfig) => {
    setClientes(clientes.map(c => 
      c.id === cliente.id ? { ...c, activo: !c.activo } : c
    ))
    toast.success(cliente.activo ? 'Cliente desactivado' : 'Cliente activado')
  }

  // Filter data
  const filteredUsuarios = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCursos = cursos.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredClientes = clientes.filter(c => {
    const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesUnidad = unidadFilter === 'todos' || c.unidad === unidadFilter
    return matchesSearch && matchesUnidad
  })

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-[rgba(201,169,110,0.15)] pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setSearchTerm('')
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#C9A96E] text-[#0A0A0A]'
                : 'text-[#888888] hover:text-[#E5E5E5] hover:bg-[rgba(201,169,110,0.1)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Usuarios Tab */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] placeholder:text-[#555555]"
              />
            </div>
            <Button 
              onClick={handleInviteUsuario}
              className="bg-[#C9A96E] text-[#0A0A0A] hover:bg-[#B8986D]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Invitar usuario
            </Button>
          </div>

          <div className="bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(201,169,110,0.1)] hover:bg-transparent">
                  <TableHead className="text-[#888888]">Usuario</TableHead>
                  <TableHead className="text-[#888888]">Email</TableHead>
                  <TableHead className="text-[#888888]">Rol</TableHead>
                  <TableHead className="text-[#888888]">Fecha de alta</TableHead>
                  <TableHead className="text-[#888888] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => (
                  <TableRow 
                    key={usuario.id}
                    className="border-[rgba(201,169,110,0.1)] hover:bg-[rgba(201,169,110,0.05)]"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[rgba(201,169,110,0.2)] flex items-center justify-center">
                          <span className="text-[#C9A96E] font-medium text-sm">
                            {usuario.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[#E5E5E5] font-medium">{usuario.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#888888]">{usuario.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={usuario.rol === 'admin' 
                          ? 'border-[#C9A96E] text-[#C9A96E] bg-[rgba(201,169,110,0.1)]'
                          : 'border-[#666666] text-[#888888]'
                        }
                      >
                        {usuario.rol === 'admin' ? 'Admin' : 'Administrativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#888888]">
                      {formatDate(usuario.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUsuario(usuario)}
                        className="text-[#888888] hover:text-[#C9A96E] hover:bg-[rgba(201,169,110,0.1)]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Cursos Tab */}
      {activeTab === 'cursos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] placeholder:text-[#555555]"
              />
            </div>
            <Button 
              onClick={handleNewCurso}
              className="bg-[#C9A96E] text-[#0A0A0A] hover:bg-[#B8986D]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo curso
            </Button>
          </div>

          <div className="bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(201,169,110,0.1)] hover:bg-transparent">
                  <TableHead className="text-[#888888]">Nombre</TableHead>
                  <TableHead className="text-[#888888]">Precio mensual</TableHead>
                  <TableHead className="text-[#888888]">Alumnos activos</TableHead>
                  <TableHead className="text-[#888888]">Estado</TableHead>
                  <TableHead className="text-[#888888] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCursos.map((curso) => (
                  <TableRow 
                    key={curso.id}
                    className="border-[rgba(201,169,110,0.1)] hover:bg-[rgba(201,169,110,0.05)]"
                  >
                    <TableCell className="text-[#E5E5E5] font-medium">{curso.nombre}</TableCell>
                    <TableCell className="text-[#C9A96E] font-medium">
                      {formatCurrency(curso.precio_mensual)}
                    </TableCell>
                    <TableCell className="text-[#888888]">{curso.alumnos_activos}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Solo admin puede activar/desactivar (eliminar) un curso */}
                        {esAdmin && (
                          <Switch
                            checked={curso.activo}
                            onCheckedChange={() => handleToggleCursoActivo(curso)}
                            className="data-[state=checked]:bg-[#22C55E] data-[state=unchecked]:bg-[#444444]"
                          />
                        )}
                        <span className={curso.activo ? 'text-[#22C55E]' : 'text-[#666666]'}>
                          {curso.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCurso(curso)}
                        className="text-[#888888] hover:text-[#C9A96E] hover:bg-[rgba(201,169,110,0.1)]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Clientes Tab */}
      {activeTab === 'clientes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5] placeholder:text-[#555555]"
                />
              </div>
              <Select
                value={unidadFilter}
                onValueChange={(value: 'todos' | 'agencia' | 'social_tv') => setUnidadFilter(value)}
              >
                <SelectTrigger className="w-40 bg-[#0A0A0A] border-[rgba(201,169,110,0.15)] text-[#E5E5E5]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[rgba(201,169,110,0.2)]">
                  <SelectItem value="todos" className="text-[#E5E5E5]">Todos</SelectItem>
                  <SelectItem value="agencia" className="text-[#E5E5E5]">Agencia</SelectItem>
                  <SelectItem value="social_tv" className="text-[#E5E5E5]">Social TV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleNewCliente}
              className="bg-[#C9A96E] text-[#0A0A0A] hover:bg-[#B8986D]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo cliente
            </Button>
          </div>

          <div className="bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(201,169,110,0.1)] hover:bg-transparent">
                  <TableHead className="text-[#888888]">Nombre</TableHead>
                  <TableHead className="text-[#888888]">Unidad</TableHead>
                  <TableHead className="text-[#888888]">Estado</TableHead>
                  <TableHead className="text-[#888888]">Trabajos/Monto</TableHead>
                  <TableHead className="text-[#888888] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow 
                    key={cliente.id}
                    className="border-[rgba(201,169,110,0.1)] hover:bg-[rgba(201,169,110,0.05)]"
                  >
                    <TableCell className="text-[#E5E5E5] font-medium">{cliente.nombre}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={cliente.unidad === 'agencia' 
                          ? 'border-[#3B82F6] text-[#3B82F6] bg-[rgba(59,130,246,0.1)]'
                          : 'border-[#8B5CF6] text-[#8B5CF6] bg-[rgba(139,92,246,0.1)]'
                        }
                      >
                        {cliente.unidad === 'agencia' ? 'Agencia' : 'Social TV'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={cliente.activo}
                          onCheckedChange={() => handleToggleClienteActivo(cliente)}
                          className="data-[state=checked]:bg-[#22C55E] data-[state=unchecked]:bg-[#444444]"
                        />
                        <span className={cliente.activo ? 'text-[#22C55E]' : 'text-[#666666]'}>
                          {cliente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#888888]">
                      {cliente.unidad === 'agencia' 
                        ? `${cliente.trabajos_count || 0} trabajos`
                        : formatCurrency(cliente.monto_mensual || 0) + '/mes'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCliente(cliente)}
                        className="text-[#888888] hover:text-[#C9A96E] hover:bg-[rgba(201,169,110,0.1)]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Backup Tab (solo admin) */}
      {activeTab === 'backup' && esAdmin && <BackupSection />}

      {/* Modals */}
      <UsuarioModal
        open={usuarioModalOpen}
        onOpenChange={setUsuarioModalOpen}
        usuario={selectedUsuario}
        onSave={handleSaveUsuario}
        mode={usuarioModalMode}
      />

      <CursoModal
        open={cursoModalOpen}
        onOpenChange={setCursoModalOpen}
        curso={selectedCurso}
        onSave={handleSaveCurso}
      />

      <ClienteModal
        open={clienteModalOpen}
        onOpenChange={setClienteModalOpen}
        cliente={selectedCliente}
        onSave={handleSaveCliente}
      />

      {/* Deactivate Curso Alert */}
      <AlertDialog open={deactivateCursoAlert} onOpenChange={setDeactivateCursoAlert}>
        <AlertDialogContent className="bg-[#111111] border-[rgba(201,169,110,0.2)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E5E5E5]">Desactivar curso</AlertDialogTitle>
            <AlertDialogDescription className="text-[#888888]">
              Este curso tiene {cursoToDeactivate?.alumnos_activos} alumnos activos. 
              Los alumnos actuales no seran afectados, pero no se podran inscribir nuevos alumnos en este curso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[rgba(201,169,110,0.3)] text-[#888888] hover:bg-[rgba(201,169,110,0.1)]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeactivateCurso}
              className="bg-[#EF4444] text-white hover:bg-[#DC2626]"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
