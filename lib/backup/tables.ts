// Tablas incluidas en el backup, ordenadas por dependencias de clave foranea.
// El ORDEN IMPORTA para la importacion: primero las tablas "padre" y luego las
// que las referencian, para no violar constraints de FK al hacer upsert.
export const BACKUP_TABLES = [
  'unidades_negocio',
  'usuarios',
  'cursos',
  'clientes',
  'alumnos',
  'trabajos',
  'modelos_trabajo',
  'pagos_cursos',
  'pagos_social_tv',
  'seguimiento_alumnos',
  'gastos',
  'gastos_social_tv',
  'solicitudes_correccion',
  'caja',
] as const

export type BackupTable = (typeof BACKUP_TABLES)[number]

// Nombre del archivo de backup con la fecha del dia: backup_YYYY-MM-DD.zip
export function nombreArchivoBackup(fecha = new Date()): string {
  const yyyy = fecha.getFullYear()
  const mm = String(fecha.getMonth() + 1).padStart(2, '0')
  const dd = String(fecha.getDate()).padStart(2, '0')
  return `backup_${yyyy}-${mm}-${dd}.zip`
}
