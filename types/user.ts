export type UserRole = 'admin' | 'administrativa'

export interface Usuario {
  id: string
  email: string
  nombre: string
  rol: UserRole
  created_at: string
}
