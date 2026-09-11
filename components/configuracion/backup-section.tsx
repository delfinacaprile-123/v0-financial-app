'use client'

import { useRef, useState } from 'react'
import { Download, Upload, Database, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
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

export function BackupSection() {
  const [descargando, setDescargando] = useState(false)
  const [importando, setImportando] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [archivoPendiente, setArchivoPendiente] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDescargar = async () => {
    setDescargando(true)
    try {
      const res = await fetch('/api/backup/export')
      if (!res.ok) {
        const info = await res.json().catch(() => ({}))
        throw new Error(info.error || 'No se pudo generar el backup')
      }
      // Deriva el nombre del archivo del header Content-Disposition.
      const disposition = res.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename="(.+?)"/)
      const nombre = match?.[1] || 'backup.zip'

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nombre
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Backup descargado')
    } catch (error) {
      console.error('[v0] Error al descargar backup:', error)
      toast.error(error instanceof Error ? error.message : 'Error al descargar el backup')
    } finally {
      setDescargando(false)
    }
  }

  const handleSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setArchivoPendiente(file)
      setConfirmOpen(true)
    }
    // Permite volver a elegir el mismo archivo mas tarde.
    e.target.value = ''
  }

  const handleImportar = async () => {
    if (!archivoPendiente) return
    setConfirmOpen(false)
    setImportando(true)
    try {
      const formData = new FormData()
      formData.append('file', archivoPendiente)
      const res = await fetch('/api/backup/import', { method: 'POST', body: formData })
      const info = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(info.error || 'No se pudo importar el backup')
      }
      const totalFilas = Object.values(info.resumen ?? {}).reduce(
        (sum: number, n) => sum + Number(n),
        0,
      )
      toast.success(`Backup importado: ${totalFilas} registros restaurados`)
    } catch (error) {
      console.error('[v0] Error al importar backup:', error)
      toast.error(error instanceof Error ? error.message : 'Error al importar el backup')
    } finally {
      setImportando(false)
      setArchivoPendiente(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(201,169,110,0.1)]">
          <Database className="h-5 w-5 text-[#C9A96E]" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-[#E5E5E5]">Backup de datos</h2>
          <p className="text-sm text-[#888888]">
            Descargá una copia completa de todas las tablas o restaurá una copia previa.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Descargar */}
        <div className="rounded-xl border border-[rgba(201,169,110,0.15)] bg-[#0A0A0A] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Download className="h-4 w-4 text-[#C9A96E]" />
            <h3 className="font-medium text-[#E5E5E5]">Descargar backup</h3>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-[#888888]">
            Genera un archivo ZIP con un CSV por cada tabla de la base de datos. El nombre incluye
            la fecha del día (backup_AAAA-MM-DD.zip).
          </p>
          <Button
            onClick={handleDescargar}
            disabled={descargando}
            className="w-full bg-[#C9A96E] text-[#0A0A0A] hover:bg-[#B89860]"
          >
            {descargando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar backup
              </>
            )}
          </Button>
        </div>

        {/* Importar */}
        <div className="rounded-xl border border-[rgba(201,169,110,0.15)] bg-[#0A0A0A] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Upload className="h-4 w-4 text-[#C9A96E]" />
            <h3 className="font-medium text-[#E5E5E5]">Importar backup</h3>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-[#888888]">
            Restaurá los datos desde un ZIP descargado previamente. Los registros existentes se
            actualizan por su identificador.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".zip,application/zip"
            onChange={handleSeleccionArchivo}
            className="hidden"
          />
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={importando}
            variant="outline"
            className="w-full border-[rgba(201,169,110,0.3)] bg-transparent text-[#E5E5E5] hover:bg-[rgba(201,169,110,0.1)]"
          >
            {importando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importar backup
              </>
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="border-[rgba(201,169,110,0.2)] bg-[#0A0A0A]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[#E5E5E5]">
              <AlertTriangle className="h-5 w-5 text-[#C9A96E]" />
              Confirmar importación
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#888888]">
              Vas a restaurar los datos desde{' '}
              <span className="text-[#E5E5E5]">{archivoPendiente?.name}</span>. Los registros con el
              mismo identificador serán sobrescritos con los del backup. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setArchivoPendiente(null)}
              className="border-[rgba(201,169,110,0.2)] bg-transparent text-[#E5E5E5] hover:bg-[rgba(201,169,110,0.1)]"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleImportar}
              className="bg-[#C9A96E] text-[#0A0A0A] hover:bg-[#B89860]"
            >
              Importar y sobrescribir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
