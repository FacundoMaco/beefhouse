import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string
  change: number
  icon: React.ReactNode
  accent?: boolean
  size?: 'primary' | 'secondary' | 'tertiary'
}

export default function KPICard({ label, value, change, icon, accent, size = 'secondary' }: KPICardProps) {
  const positive = change >= 0

  const valueClass =
    size === 'primary'
      ? `text-3xl font-bold ${accent ? 'text-amber-400' : 'text-white'}`
      : size === 'tertiary'
      ? `text-lg font-semibold ${accent ? 'text-amber-400' : 'text-gray-300'}`
      : `text-2xl font-bold ${accent ? 'text-amber-400' : 'text-white'}`

  return (
    <div
      className={`rounded-xl p-5 border transition-all duration-200 hover:border-amber-500/30 ${
        accent
          ? 'bg-amber-500/10 border-amber-500/20'
          : 'bg-[#1e1e1e] border-[#2a2a2a]'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${accent ? 'bg-amber-500/20' : 'bg-[#2a2a2a]'}`}>
          {icon}
        </div>
        {change !== 0 && (
          <span
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              positive
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-red-400 bg-red-500/10'
            }`}
          >
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {positive ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={valueClass}>{value}</p>
    </div>
  )
}
