import type { Movimiento, TipoMovimiento, PersonaCaja } from '@/types/caja'

// Normaliza el valor crudo de `en_poder_de` (DB) al slot interno PersonaCaja.
// Eugenia ES la secretaria, por eso cualquier variante de su nombre mapea a 'secretaria'.
// Tolera acentos y mayúsculas (ej: 'Eugenia', 'EUGENIA', 'Mamá').
export function normalizePersona(value?: string | null): PersonaCaja {
  const normalized = (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

  if (normalized === 'secretaria' || normalized.startsWith('eugenia')) return 'secretaria'
  if (normalized === 'mama' || normalized.startsWith('mam')) return 'mama'
  // Por defecto, tratamos cualquier otro valor como la secretaria (Eugenia)
  return 'secretaria'
}

// Mapea una fila de la tabla `caja` (Supabase) al tipo `Movimiento` del cliente
export function mapRowToMovimiento(row: any): Movimiento {
  const tipo: TipoMovimiento =
    row.tipo === 'transferencia_interna' ? 'transferencia' : (row.tipo as TipoMovimiento)

  // En la DB, para transferencias guardamos `en_poder_de` = origen (de)
  const enPoderDeRaw = normalizePersona(row.en_poder_de)
  let de: PersonaCaja | undefined
  let para: PersonaCaja | undefined
  let enPoderDe: PersonaCaja = enPoderDeRaw

  if (tipo === 'transferencia') {
    de = enPoderDeRaw
    para = enPoderDeRaw === 'secretaria' ? 'mama' : 'secretaria'
    enPoderDe = para
  }

  return {
    id: row.id,
    fecha: row.fecha,
    tipo,
    descripcion: row.descripcion ?? '',
    monto: Number(row.monto),
    enPoderDe,
    de,
    para,
    registradoPor: row.usuarios?.nombre ?? 'Admin',
    created_at: row.created_at,
  }
}

// Calcula el saldo real de cada persona a partir de la lista de movimientos.
// Es la misma lógica que usa la página /caja (componente CajaClient).
export function calcularSaldos(movimientos: Movimiento[]): {
  saldoSecretaria: number
  saldoMama: number
} {
  let saldoSecretaria = 0
  let saldoMama = 0

  const sorted = [...movimientos].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  )

  for (const mov of sorted) {
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
}
