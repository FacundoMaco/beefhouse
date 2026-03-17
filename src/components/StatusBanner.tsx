import type { Recommendation } from '../types'
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'

interface StatusBannerProps {
  recommendations: Recommendation[]
}

export default function StatusBanner({ recommendations }: StatusBannerProps) {
  const highCount = recommendations.filter((r) => r.priority === 'alta').length
  const medCount = recommendations.filter((r) => r.priority === 'media').length

  if (highCount > 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
        <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
        <p className="text-red-300 text-sm font-medium">
          Atención requerida — {highCount} {highCount === 1 ? 'acción urgente' : 'acciones urgentes'} pendiente{highCount > 1 ? 's' : ''}
        </p>
      </div>
    )
  }

  if (medCount > 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
        <p className="text-amber-300 text-sm font-medium">
          Revisar hoy — {medCount} {medCount === 1 ? 'punto' : 'puntos'} para revisar
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
      <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
      <p className="text-emerald-300 text-sm font-medium">Todo en orden — sin alertas activas hoy</p>
    </div>
  )
}
