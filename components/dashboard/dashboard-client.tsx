'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  GraduationCap,
  Briefcase,
  Tv,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SolicitudesPanel, type SolicitudCorreccion } from './solicitudes-panel'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// Types
interface PeriodData {
  total: number
  cursos: { monto: number; cantidad: number }
  agencia: { monto: number; cantidad: number }
  socialTv: { monto: number; cantidad: number }
}

interface EvolutionData {
  mes: string
  cursos: number
  agencia: number
  socialTv: number
}

interface Alert {
  id: string
  nombre: string
  modulo: 'cursos' | 'social-tv'
  descripcion: string
  tipo: 'revisar' | 'atrasada' | 'pendiente'
}

interface ProductoIngreso {
  nombre: string
  monto: number
  color: string
  unidad: string
}

// Mock Data
const MOCK_DATA: Record<string, PeriodData> = {
  'abril-2026': {
    total: 3380000,
    cursos: { monto: 980000, cantidad: 42 },
    agencia: { monto: 1260000, cantidad: 5 },
    socialTv: { monto: 1140000, cantidad: 6 }
  },
  'marzo-2026': {
    total: 2840000,
    cursos: { monto: 830000, cantidad: 38 },
    agencia: { monto: 1180000, cantidad: 4 },
    socialTv: { monto: 830000, cantidad: 6 }
  },
  'febrero-2026': {
    total: 2720000,
    cursos: { monto: 890000, cantidad: 40 },
    agencia: { monto: 1050000, cantidad: 3 },
    socialTv: { monto: 780000, cantidad: 5 }
  },
  'enero-2026': {
    total: 2350000,
    cursos: { monto: 760000, cantidad: 35 },
    agencia: { monto: 850000, cantidad: 2 },
    socialTv: { monto: 740000, cantidad: 5 }
  }
}

const EVOLUTION_DATA: EvolutionData[] = [
  { mes: 'Nov 25', cursos: 720000, agencia: 980000, socialTv: 740000 },
  { mes: 'Dic 25', cursos: 810000, agencia: 1100000, socialTv: 780000 },
  { mes: 'Ene 26', cursos: 760000, agencia: 850000, socialTv: 740000 },
  { mes: 'Feb 26', cursos: 890000, agencia: 1050000, socialTv: 780000 },
  { mes: 'Mar 26', cursos: 830000, agencia: 1180000, socialTv: 830000 },
  { mes: 'Abr 26', cursos: 980000, agencia: 1260000, socialTv: 1140000 }
]

const MINI_BAR_DATA = [
  { mes: 'Nov', total: 2440 },
  { mes: 'Dic', total: 2690 },
  { mes: 'Ene', total: 2350 },
  { mes: 'Feb', total: 2720 },
  { mes: 'Mar', total: 2840 },
  { mes: 'Abr', total: 3380 }
]

const PRODUCTOS: ProductoIngreso[] = [
  { nombre: 'Cuotas cursos', monto: 980000, color: '#C9A96E', unidad: 'cursos' },
  { nombre: 'Producciones', monto: 870000, color: '#8FB3C9', unidad: 'agencia' },
  { nombre: 'Desfiles', monto: 800000, color: '#8FB3C9', unidad: 'agencia' },
  { nombre: 'Social TV cuotas', monto: 740000, color: '#B09EC9', unidad: 'social-tv' },
  { nombre: 'Promos', monto: 550000, color: '#B09EC9', unidad: 'social-tv' },
  { nombre: 'Fotos', monto: 280000, color: '#8FB3C9', unidad: 'agencia' }
]

interface CajaSaldos {
  secretaria: number
  mama: number
}

// Helpers
const formatMoney = (amount: number) => {
  return `$ ${amount.toLocaleString('es-AR')}`
}

const formatCompactMoney = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  return `$${(amount / 1000).toFixed(0)}K`
}

// Mes actual calculado en tiempo real (ej: "Agosto 2026")
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const CURRENT_PERIOD_LABEL = capitalize(
  new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
)
// Clave para buscar en MOCK_DATA (ej: "agosto-2026")
const CURRENT_PERIOD_KEY = `${new Date()
  .toLocaleDateString('es-AR', { month: 'long' })
  .toLowerCase()}-${new Date().getFullYear()}`

// Components
function PeriodSelector({ 
  selected, 
  onSelect,
  compareMode,
  onCompareToggle 
}: { 
  selected: string
  onSelect: (period: string) => void
  compareMode: boolean
  onCompareToggle: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={selected === '3m' && !compareMode ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect('3m')}
        className={selected === '3m' && !compareMode ? 'bg-[#C9A96E] hover:bg-[#B89A5F] text-[#0A0A0A]' : ''}
      >
        3 meses
      </Button>
      <Button
        variant={selected === '6m' && !compareMode ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect('6m')}
        className={selected === '6m' && !compareMode ? 'bg-[#C9A96E] hover:bg-[#B89A5F] text-[#0A0A0A]' : ''}
      >
        6 meses
      </Button>
      <Button
        variant={selected === '1y' && !compareMode ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect('1y')}
        className={selected === '1y' && !compareMode ? 'bg-[#C9A96E] hover:bg-[#B89A5F] text-[#0A0A0A]' : ''}
      >
        Este año
      </Button>
      <Button
        variant={compareMode ? 'default' : 'outline'}
        size="sm"
        onClick={onCompareToggle}
        className={compareMode ? 'bg-[#C9A96E] hover:bg-[#B89A5F] text-[#0A0A0A]' : ''}
      >
        Comparar
      </Button>
    </div>
  )
}

function CompareSelector({ 
  period1, 
  period2, 
  onPeriod1Change, 
  onPeriod2Change 
}: {
  period1: string
  period2: string
  onPeriod1Change: (p: string) => void
  onPeriod2Change: (p: string) => void
}) {
  const periods = [
    { value: 'abril-2026', label: 'Abril 2026' },
    { value: 'marzo-2026', label: 'Marzo 2026' },
    { value: 'febrero-2026', label: 'Febrero 2026' },
    { value: 'enero-2026', label: 'Enero 2026' }
  ]

  return (
    <div className="flex items-center gap-4 mt-4">
      <select
        value={period1}
        onChange={(e) => onPeriod1Change(e.target.value)}
        className="bg-[#1A1A1A] border border-[rgba(201,169,110,0.3)] rounded-lg px-3 py-2 text-sm text-[#E8E8E8]"
      >
        {periods.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      <span className="text-[#888888]">vs</span>
      <select
        value={period2}
        onChange={(e) => onPeriod2Change(e.target.value)}
        className="bg-[#1A1A1A] border border-[rgba(201,169,110,0.3)] rounded-lg px-3 py-2 text-sm text-[#E8E8E8]"
      >
        {periods.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
    </div>
  )
}

function TotalCard({ 
  data, 
  previousData,
  compareMode,
  compareData
}: { 
  data: PeriodData
  previousData: PeriodData
  compareMode: boolean
  compareData?: { period1: PeriodData; period2: PeriodData; label1: string; label2: string }
}) {
  const [animated, setAnimated] = useState(false)
  
  useEffect(() => {
    setAnimated(false)
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [data])

  const percentChange = ((data.total - previousData.total) / previousData.total) * 100
  const isPositive = percentChange > 0

  if (compareMode && compareData) {
    const diff = compareData.period1.total - compareData.period2.total
    const diffPercent = ((diff) / compareData.period2.total) * 100
    
    return (
      <Card className="bg-[#111111] border-t-2 border-t-[#C9A96E] border-[rgba(201,169,110,0.15)]">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[#888888] text-sm mb-2">{compareData.label1}</p>
              <p className="font-serif text-4xl text-[#E8E8E8]">
                {formatMoney(compareData.period1.total)}
              </p>
            </div>
            <div>
              <p className="text-[#888888] text-sm mb-2">{compareData.label2}</p>
              <p className="font-serif text-4xl text-[#E8E8E8]">
                {formatMoney(compareData.period2.total)}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[rgba(201,169,110,0.15)]">
            <div className="flex items-center gap-2">
              <span className="text-[#888888]">Diferencia:</span>
              <span className={`font-semibold ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {diff >= 0 ? '+' : ''}{formatMoney(diff)} ({diffPercent >= 0 ? '+' : ''}{diffPercent.toFixed(1)}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#111111] border-t-2 border-t-[#C9A96E] border-[rgba(201,169,110,0.15)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-[#888888] text-sm mb-2">Ingreso total · {CURRENT_PERIOD_LABEL}</p>
            <p 
              className="font-serif text-5xl text-[#E8E8E8] transition-all duration-700"
              style={{ 
                opacity: animated ? 1 : 0,
                transform: animated ? 'translateY(0)' : 'translateY(10px)'
              }}
            >
              {formatMoney(data.total)}
            </p>
            <div className="flex items-center gap-2 mt-3">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{percentChange.toFixed(1)}% vs mes anterior
              </span>
            </div>
          </div>
          
          {/* Mini bar chart */}
          <div className="w-48 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MINI_BAR_DATA}>
                <Bar 
                  dataKey="total" 
                  fill="#888888"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function UnitCard({ 
  title, 
  icon: Icon, 
  monto, 
  total, 
  cantidad, 
  label,
  color,
  href
}: {
  title: string
  icon: React.ElementType
  monto: number
  total: number
  cantidad: number
  label: string
  color: string
  href: string
}) {
  const [animated, setAnimated] = useState(false)
  const percentage = (monto / total) * 100

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Link href={href}>
      <Card className="bg-[#111111] border-[rgba(201,169,110,0.15)] hover:border-[rgba(201,169,110,0.3)] transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <span className="text-[#E8E8E8] font-medium">{title}</span>
          </div>
          
          <p 
            className="font-serif text-2xl text-[#E8E8E8] mb-1 transition-all duration-700"
            style={{ 
              opacity: animated ? 1 : 0,
              transform: animated ? 'translateY(0)' : 'translateY(10px)'
            }}
          >
            {formatMoney(monto)}
          </p>
          
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-[#888888]">{percentage.toFixed(1)}% del total</span>
            <span className="text-[#888888]">{cantidad} {label}</span>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: animated ? `${percentage}%` : '0%',
                backgroundColor: color 
              }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  const getBadgeStyle = (tipo: Alert['tipo']) => {
    switch (tipo) {
      case 'revisar':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'atrasada':
        return 'bg-[#C9A96E]/10 text-[#C9A96E] border-[#C9A96E]/20'
      case 'pendiente':
        return 'bg-[#C9A96E]/10 text-[#C9A96E] border-[#C9A96E]/20'
    }
  }

  const getBadgeText = (tipo: Alert['tipo']) => {
    switch (tipo) {
      case 'revisar': return 'Revisar'
      case 'atrasada': return 'Atrasada'
      case 'pendiente': return 'Pendiente'
    }
  }

  return (
    <Card className="bg-[#111111] border-[rgba(201,169,110,0.15)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-[#E8E8E8] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#C9A96E]" />
            Alertas
          </CardTitle>
          <Link 
            href="/cursos?tab=atrasados" 
            className="text-sm text-[#C9A96E] hover:text-[#E8D5B0] flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-8 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>Todo al dia</span>
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id}
              className="flex items-start justify-between p-3 bg-[#0A0A0A] rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#E8E8E8] font-medium">{alert.nombre}</span>
                  <Badge variant="outline" className="text-xs capitalize border-[rgba(201,169,110,0.3)]">
                    {alert.modulo === 'cursos' ? 'Cursos' : 'Social TV'}
                  </Badge>
                </div>
                <p className="text-sm text-[#888888]">{alert.descripcion}</p>
              </div>
              <Badge className={`${getBadgeStyle(alert.tipo)} border`}>
                {getBadgeText(alert.tipo)}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function EvolutionPanel({ data, period }: { data: EvolutionData[]; period: string }) {
  const filteredData = period === '3m' ? data.slice(-3) : data

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A1A] border border-[rgba(201,169,110,0.3)] rounded-lg p-3">
          <p className="text-[#E8E8E8] font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[#888888]">{entry.name}:</span>
              <span className="text-[#E8E8E8]">{formatMoney(entry.value)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-[#111111] border-[rgba(201,169,110,0.15)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-[#E8E8E8]">
            Evolucion {period === '3m' ? '3 meses' : period === '6m' ? '6 meses' : 'anual'}
          </CardTitle>
          <Link 
            href="#" 
            className="text-sm text-[#C9A96E] hover:text-[#E8D5B0] flex items-center gap-1"
          >
            Ver historico <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis 
                dataKey="mes" 
                tick={{ fill: '#888888', fontSize: 12 }}
                axisLine={{ stroke: '#2A2A2A' }}
              />
              <YAxis 
                tick={{ fill: '#888888', fontSize: 12 }}
                axisLine={{ stroke: '#2A2A2A' }}
                tickFormatter={(value) => formatCompactMoney(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span className="text-[#888888] text-sm">{value}</span>}
              />
              <Bar dataKey="cursos" name="Cursos" fill="#C9A96E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="agencia" name="Agencia" fill="#8FB3C9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="socialTv" name="Social TV" fill="#B09EC9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function CajaPanel({ caja }: { caja: CajaSaldos }) {
  const total = caja.secretaria + caja.mama

  return (
    <Card className="bg-[#111111] border-[rgba(201,169,110,0.15)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-[#E8E8E8]">
            Caja en efectivo
          </CardTitle>
          <Link 
            href="/caja" 
            className="text-sm text-[#C9A96E] hover:text-[#E8D5B0] flex items-center gap-1"
          >
            Ver movimientos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
          <span className="text-[#E8E8E8]">Eugenia</span>
          <span className="text-green-500 font-medium">{formatMoney(caja.secretaria)}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
          <span className="text-[#E8E8E8]">Mama</span>
          <span className="text-green-500 font-medium">{formatMoney(caja.mama)}</span>
        </div>
        <div className="border-t border-[rgba(201,169,110,0.15)] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-[#888888]">Total en circulacion</span>
            <span className="font-serif text-2xl text-[#C9A96E]">{formatMoney(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductosPanel({ productos }: { productos: ProductoIngreso[] }) {
  const maxMonto = Math.max(...productos.map(p => p.monto))

  return (
    <Card className="bg-[#111111] border-[rgba(201,169,110,0.15)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-[#E8E8E8]">
            Ingresos por producto
          </CardTitle>
          <Link 
            href="#" 
            className="text-sm text-[#C9A96E] hover:text-[#E8D5B0] flex items-center gap-1"
          >
            Ver detalle <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {productos.map((producto, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#E8E8E8]">{producto.nombre}</span>
              <span className="text-[#888888]">{formatMoney(producto.monto)}</span>
            </div>
            <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ 
                  width: `${(producto.monto / maxMonto) * 100}%`,
                  backgroundColor: producto.color 
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Main Dashboard Component
export function DashboardClient({
  caja,
  alertas,
  solicitudes = [],
  ingresos,
  esAdmin = false,
}: {
  caja: CajaSaldos
  alertas: Alert[]
  solicitudes?: SolicitudCorreccion[]
  ingresos?: PeriodData
  esAdmin?: boolean
}) {
  const [period, setPeriod] = useState('6m')
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriod1, setComparePeriod1] = useState('abril-2026')
  const [comparePeriod2, setComparePeriod2] = useState('marzo-2026')

  // Ingresos reales del periodo actual desde Supabase; fallback a mock si no llegan.
  const currentData = ingresos ?? MOCK_DATA[CURRENT_PERIOD_KEY] ?? MOCK_DATA['abril-2026']
  const previousData = MOCK_DATA['marzo-2026']

  const handlePeriodSelect = (p: string) => {
    setCompareMode(false)
    setPeriod(p)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-4xl text-[#E8E8E8]">Resumen general</h1>
          <p className="text-[#888888] mt-1">{CURRENT_PERIOD_LABEL}</p>
        </div>
        <div>
          <PeriodSelector 
            selected={period} 
            onSelect={handlePeriodSelect}
            compareMode={compareMode}
            onCompareToggle={() => setCompareMode(!compareMode)}
          />
          {compareMode && (
            <CompareSelector
              period1={comparePeriod1}
              period2={comparePeriod2}
              onPeriod1Change={setComparePeriod1}
              onPeriod2Change={setComparePeriod2}
            />
          )}
        </div>
      </div>

      {/* Total Card */}
      <TotalCard 
        data={currentData} 
        previousData={previousData}
        compareMode={compareMode}
        compareData={compareMode ? {
          period1: MOCK_DATA[comparePeriod1] || currentData,
          period2: MOCK_DATA[comparePeriod2] || previousData,
          label1: comparePeriod1.replace('-', ' ').replace(/^\w/, c => c.toUpperCase()),
          label2: comparePeriod2.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())
        } : undefined}
      />

      {/* Unit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UnitCard
          title="Cursos"
          icon={GraduationCap}
          monto={currentData.cursos.monto}
          total={currentData.total}
          cantidad={currentData.cursos.cantidad}
          label="alumnos"
          color="#C9A96E"
          href="/cursos"
        />
        <UnitCard
          title="Agencia"
          icon={Briefcase}
          monto={currentData.agencia.monto}
          total={currentData.total}
          cantidad={currentData.agencia.cantidad}
          label="trabajos"
          color="#8FB3C9"
          href="/agencia"
        />
        <UnitCard
          title="Social TV"
          icon={Tv}
          monto={currentData.socialTv.monto}
          total={currentData.total}
          cantidad={currentData.socialTv.cantidad}
          label="clientes"
          color="#B09EC9"
          href="/social-tv"
        />
      </div>

      {/* Solicitudes de correccion (seccion dedicada, solo visible para la admin) */}
      {esAdmin && <SolicitudesPanel solicitudes={solicitudes} />}

      {/* Bottom Panels - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AlertsPanel alerts={alertas} />
        <EvolutionPanel data={EVOLUTION_DATA} period={period} />
        <CajaPanel caja={caja} />
        <ProductosPanel productos={PRODUCTOS} />
      </div>
    </div>
  )
}
