import { useState, useEffect } from 'react'
import type { Recommendation } from '../types'
import { TrendingUp, Star, DollarSign, Trash2 } from 'lucide-react'

interface RecommendationsProps {
  recommendations: Recommendation[]
}

const priorityOrder = { alta: 0, media: 1, baja: 2 }

const STEPS_BY_TYPE: Record<Recommendation['type'], string[]> = {
  price_up:    ['Calcular nuevo precio (+5% sobre actual)', 'Actualizar carta física y digital', 'Comunicar cambio a personal de caja'],
  promote:     ['Agregar foto destacada en carta', 'Publicar en redes sociales esta semana', 'Mencionar al cliente como sugerencia del día'],
  review_cost: ['Solicitar cotización a proveedor alternativo', 'Revisar gramaje actual del plato', 'Evaluar ajuste de receta'],
  remove:      ['Verificar stock actual del plato', 'Definir fecha de retiro del menú', 'Reemplazar con una nueva propuesta'],
}

function loadChecks(recId: string, stepCount: number): boolean[] {
  try {
    const raw = localStorage.getItem(`beefhouse-tasks-${recId}`)
    if (!raw) return Array(stepCount).fill(false)
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.slice(0, stepCount)
  } catch { /* ignore */ }
  return Array(stepCount).fill(false)
}

const typeIcon = {
  price_up:    <TrendingUp size={13} className="text-[#555]" />,
  promote:     <Star size={13} className="text-[#555]" />,
  review_cost: <DollarSign size={13} className="text-[#555]" />,
  remove:      <Trash2 size={13} className="text-[#555]" />,
}

const priorityLabel = { alta: 'Urgente', media: 'Revisar', baja: 'Baja' }

const priorityBorderColor = {
  alta:  'border-l-red-500',
  media: 'border-l-amber-500',
  baja:  'border-l-[#2a2a2a]',
}

const priorityBadgeStyle = {
  alta:  'text-red-400 bg-red-500/10',
  media: 'text-amber-400 bg-amber-500/10',
  baja:  'text-[#555] bg-[#1a1a1a]',
}

function RecCard({ rec }: { rec: Recommendation }) {
  const steps = STEPS_BY_TYPE[rec.type]
  const [checked, setChecked] = useState<boolean[]>(() => loadChecks(rec.id, steps.length))

  useEffect(() => {
    localStorage.setItem(`beefhouse-tasks-${rec.id}`, JSON.stringify(checked))
  }, [checked, rec.id])

  const allDone = checked.every(Boolean)

  function toggle(i: number) {
    setChecked((prev) => { const n = [...prev]; n[i] = !n[i]; return n })
  }

  return (
    <div className={`pl-5 border-l-2 transition-all duration-200 ${priorityBorderColor[rec.priority]} ${allDone ? 'opacity-40' : ''}`}>
      {/* Action + badge row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${allDone ? 'line-through text-[#444]' : 'text-white'}`}>
            {rec.action}
          </p>
          <p className="text-amber-500/70 text-xs mt-1 leading-relaxed">{rec.impact}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          <span className="text-[#444]">{typeIcon[rec.type]}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${priorityBadgeStyle[rec.priority]}`}>
            {priorityLabel[rec.priority]}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="mt-3 space-y-2">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="flex items-center gap-2.5 w-full text-left group"
          >
            <div
              className={`w-3.5 h-3.5 rounded-sm border flex-shrink-0 flex items-center justify-center transition-all duration-150 ${
                checked[i] ? 'bg-amber-500 border-amber-500' : 'border-[#2e2e2e] bg-transparent group-hover:border-[#555]'
              }`}
            >
              {checked[i] && (
                <svg width="8" height="7" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={`text-xs leading-relaxed ${checked[i] ? 'line-through text-[#444]' : 'text-[#666]'}`}>
              {step}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  const sorted = [...recommendations].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  const urgentCount = sorted.filter((r) => r.priority === 'alta').length

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm">🔥</span>
        <h2 className="text-[#999] text-xs font-semibold tracking-widest uppercase">Recomendaciones del día</h2>
        {urgentCount > 0 && (
          <span className="ml-auto text-xs text-red-400 font-medium">{urgentCount} urgente{urgentCount > 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="space-y-6">
        {sorted.map((rec) => <RecCard key={rec.id} rec={rec} />)}
      </div>
    </div>
  )
}
