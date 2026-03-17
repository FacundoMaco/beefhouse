import type { Dish } from '../types'

interface TopDishesProps {
  dishes: Dish[]
}

function formatPEN(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE')}`
}

export default function TopDishes({ dishes }: TopDishesProps) {
  const top5 = [...dishes].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  const maxRevenue = top5[0]?.revenue ?? 1

  return (
    <div className="bg-[#111] border border-[#1d1d1d] rounded-xl p-5">
      <p className="text-[#555] text-xs tracking-widest uppercase mb-5">Top 5 por ingresos</p>
      <div className="space-y-4">
        {top5.map((dish, index) => {
          const pct = (dish.revenue / maxRevenue) * 100
          return (
            <div key={dish.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[#333] text-xs font-mono w-4">#{index + 1}</span>
                  <span className="text-white text-sm font-medium">{dish.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#555] text-xs">{dish.unitsSold} uds</span>
                  <span className="text-amber-400 text-sm font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatPEN(dish.revenue)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-amber-500/70 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[#3a3a3a] text-xs mt-1">
                Ganancia {dish.margin.toFixed(0)}%
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
