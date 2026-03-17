import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Upload,
  TrendingUp,
  Menu,
  Sun,
  Moon,
} from 'lucide-react'

import { dishes, businessUnits, period } from './data/mockData'
import { generateRecommendations } from './utils/insights'

import TopDishes from './components/TopDishes'
import UnitPerformance from './components/UnitPerformance'
import Recommendations from './components/Recommendations'
import DishesTable from './components/DishesTable'
import ChatAssistant from './components/ChatAssistant'
import CarnecitaDrawer from './components/CarnecitaDrawer'

type View = 'dashboard' | 'dishes' | 'chat'

const recommendations = generateRecommendations([...dishes])
const totalRevenue = dishes.reduce((s, d) => s + d.revenue, 0)
const avgMargin = dishes.reduce((s, d) => s + d.margin, 0) / dishes.length
const bestUnit = [...businessUnits].sort((a, b) => b.monthlySales - a.monthlySales)[0]
const highPriorityCount = recommendations.filter((r) => r.priority === 'alta').length

function getMountTime() {
  return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatPEN(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE')}`
}

const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
  { id: 'dishes',    label: 'Platos',    icon: <UtensilsCrossed size={17} /> },
]

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('beefhouse-theme')
    return saved ? saved === 'dark' : true
  })
  const [mountTime] = useState(getMountTime)
  const [carnecitaOpen, setCarnecitaOpen] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
    localStorage.setItem('beefhouse-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <div className="flex h-screen bg-[#0b0b0b] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-52 bg-[#0b0b0b] border-r border-[#1d1d1d] flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 py-5 border-b border-[#1d1d1d]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center flex-shrink-0">
              <span className="text-black font-black text-[10px]">BH</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">Beef House</p>
              <p className="text-[#444] text-xs">Piura · Perú</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 pt-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                view === item.id
                  ? 'bg-[#1d1d1d] text-white font-medium'
                  : 'text-[#555] hover:bg-[#161616] hover:text-[#999]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-[#1d1d1d]">
          <p className="text-[#3a3a3a] text-xs">{period}</p>
          <p className="text-[#3a3a3a] text-xs mt-0.5">4 locales activos</p>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-200 ${
          carnecitaOpen ? 'xl:mr-[380px]' : ''
        }`}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-[#1d1d1d] bg-[#0b0b0b] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-[#444] hover:text-white transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>
            <span className="text-[#666] text-sm font-medium">
              {view === 'dashboard' && 'Panel Operativo'}
              {view === 'dishes' && 'Análisis de Platos'}
              {view === 'chat' && 'Asistente de Inteligencia'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsDark((d) => !d)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-[#444] hover:text-[#999] hover:bg-[#1d1d1d] transition-all duration-150"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button className="flex items-center gap-1.5 text-xs text-[#444] hover:text-[#999] hover:bg-[#1d1d1d] px-3 py-1.5 rounded-md transition-all duration-150">
              <Upload size={13} />
              <span className="hidden sm:inline">Importar Excel</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">

          {/* ══════ DASHBOARD ══════ */}
          {view === 'dashboard' && (
            <div>

              {/* ── HERO ── */}
              <div className="px-8 pt-10 pb-10">
                {/* Status row */}
                <div className="flex items-center gap-3 mb-8">
                  {highPriorityCount > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/8 border border-red-500/15 rounded-full px-3 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                      {highPriorityCount} {highPriorityCount === 1 ? 'acción urgente' : 'acciones urgentes'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 rounded-full px-3 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Todo en orden
                    </span>
                  )}
                  <span className="text-[#3a3a3a] text-xs ml-auto">Actualizado {mountTime}</span>
                </div>

                {/* Main KPI */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                  <div>
                    <p className="text-[#444] text-xs font-medium tracking-widest uppercase mb-3">
                      Ventas totales · {period}
                    </p>
                    <p
                      className="text-white font-black leading-none"
                      style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatPEN(totalRevenue)}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-semibold">
                        <TrendingUp size={13} strokeWidth={2.5} />
                        +8.3%
                      </span>
                      <span className="text-[#3a3a3a] text-xs">vs mes anterior</span>
                    </div>
                  </div>

                  <div className="hidden lg:block w-px h-12 bg-[#1d1d1d] flex-shrink-0" />

                  <div className="flex gap-10">
                    <div>
                      <p className="text-[#444] text-xs tracking-widest uppercase mb-2">Ganancia prom.</p>
                      <p className="text-white text-2xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {avgMargin.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[#444] text-xs tracking-widest uppercase mb-2">Local líder</p>
                      <p className="text-white text-xl font-bold leading-tight">{bestUnit.name}</p>
                    </div>
                    <div>
                      <p className="text-[#444] text-xs tracking-widest uppercase mb-2">Platos</p>
                      <p className="text-white text-2xl font-bold">{dishes.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RECOMENDACIONES ── */}
              <div className="px-8 pb-10">
                <Recommendations recommendations={recommendations} />
              </div>

              {/* ── GRÁFICOS ── */}
              <div className="px-8 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <TopDishes dishes={dishes} />
                  <UnitPerformance units={businessUnits} />
                </div>
              </div>

              {/* ── ESTADO DEL MENÚ ── */}
              <div className="px-8 pb-10">
                <p className="text-[#3a3a3a] text-xs tracking-widest uppercase mb-5">Estado del menú</p>
                <div className="flex flex-wrap gap-8">
                  {(['Ganador', 'Tractor', 'Oportunidad', 'Problema'] as const).map((cls) => {
                    const count = dishes.filter((d) => d.classification === cls).length
                    const dot: Record<string, string> = {
                      Ganador: 'bg-emerald-500', Tractor: 'bg-[#555]',
                      Oportunidad: 'bg-amber-500', Problema: 'bg-red-500',
                    }
                    const num: Record<string, string> = {
                      Ganador: 'text-emerald-400', Tractor: 'text-[#666]',
                      Oportunidad: 'text-amber-400', Problema: 'text-red-400',
                    }
                    return (
                      <div key={cls} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot[cls]}`} />
                        <span className={`text-2xl font-bold ${num[cls]}`} style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                        <span className="text-[#555] text-sm">{cls}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ══════ PLATOS ══════ */}
          {view === 'dishes' && (
            <div className="p-6">
              <DishesTable dishes={dishes} />
            </div>
          )}

          {/* ══════ ASISTENTE ══════ */}
          {view === 'chat' && (
            <div className="p-6" style={{ height: 'calc(100vh - 49px)' }}>
              <ChatAssistant dishes={dishes} units={businessUnits} />
            </div>
          )}

        </main>
      </div>

      <CarnecitaDrawer dishes={dishes} units={businessUnits} onOpenChange={setCarnecitaOpen} />
    </div>
  )
}
