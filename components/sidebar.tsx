'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  Briefcase, 
  Tv, 
  Wallet, 
  Receipt,
  Settings,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Usuario } from '@/types/user'

interface SidebarProps {
  user: Usuario
  onLogout: () => void
  atrasadosCount?: number
  solicitudesCount?: number
}

const navItems = [
  {
    section: 'General',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: '#C9A96E', badgeKey: 'solicitudes' },
    ]
  },
  {
    section: 'Unidades',
    items: [
      { name: 'Cursos', href: '/cursos', icon: BookOpen, color: '#C9A96E', badgeKey: 'cursos' },
      { name: 'Agencia', href: '/agencia', icon: Briefcase, color: '#8FB3C9' },
      { name: 'Social TV', href: '/social-tv', icon: Tv, color: '#B09EC9' },
    ]
  },
  {
    section: 'Finanzas',
    items: [
      { name: 'Caja Nativa', href: '/caja', icon: Wallet, color: '#C9A96E' },
      { name: 'Gastos', href: '/gastos', icon: Receipt, color: '#C9A96E' },
    ]
  },
  {
    section: 'Sistema',
    items: [
      { name: 'Configuracion', href: '/configuracion', icon: Settings, color: '#C9A96E', adminOnly: true },
    ]
  },
]

export function Sidebar({ user, onLogout, atrasadosCount = 0, solicitudesCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  
  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(href)
  }

  const getBadgeCount = (badgeKey?: string) => {
    if (badgeKey === 'cursos') return atrasadosCount
    if (badgeKey === 'solicitudes') return solicitudesCount
    return 0
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#111111] border-r border-[rgba(201,169,110,0.15)] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[rgba(201,169,110,0.15)]">
        <h1 className="font-serif text-[22px] text-[#C9A96E] tracking-[0.2em]">
          NATIVA
        </h1>
        <p className="text-[10px] text-[#888888] uppercase tracking-wider mt-1">
          Models - Gestion
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((section) => (
          <div key={section.section} className="mb-4">
            <p className="px-6 mb-2 text-[10px] text-[#888888] uppercase tracking-wider">
              {section.section}
            </p>
            <ul>
              {section.items.map((item) => {
                // Hide admin-only items for non-admin users
                if (item.adminOnly && user.rol !== 'admin') return null
                
                const active = isActive(item.href)
                const Icon = item.icon
                const badgeCount = getBadgeCount(item.badgeKey)
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-6 py-2.5 transition-colors',
                        active 
                          ? 'bg-[rgba(201,169,110,0.1)] text-[#C9A96E]' 
                          : 'text-[#E8E8E8] hover:bg-[#1A1A1A]'
                      )}
                    >
                      <span 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.name}</span>
                      {badgeCount > 0 && (
                        <span className="ml-auto bg-amber-500 text-black text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {badgeCount}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer - User Info */}
      <div className="p-4 border-t border-[rgba(201,169,110,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#C9A96E] flex items-center justify-center">
            <span className="text-[#0A0A0A] font-medium text-sm">
              {user.nombre.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#E8E8E8] truncate">{user.nombre}</p>
            <p className="text-[10px] text-[#888888] capitalize">
              {user.rol === 'admin' ? 'Administradora' : 'Secretaria'}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-[#888888] hover:text-[#C9A96E] transition-colors"
            title="Cerrar sesion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
