import { useState } from 'react'
import type { Dish } from '../types'

interface PieChartProps {
  dishes: Dish[]
}

const CATEGORY_COLORS: Record<string, string> = {
  Hamburguesas:    '#f59e0b',
  Entradas:        '#3b82f6',
  Principales:     '#10b981',
  'Acompañamientos': '#8b5cf6',
  Postres:         '#f43f5e',
  Bebidas:         '#06b6d4',
}

function formatPEN(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE')}`
}

const toRad = (deg: number) => (deg * Math.PI) / 180

function getCoords(cx: number, cy: number, r: number, angleDeg: number) {
  return {
    x: cx + r * Math.cos(toRad(angleDeg - 90)),
    y: cy + r * Math.sin(toRad(angleDeg - 90)),
  }
}

interface Segment {
  category: string
  revenue: number
  pct: number
  startAngle: number
  endAngle: number
  color: string
}

export default function PieChart({ dishes }: PieChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null)

  // Group by category
  const byCategory: Record<string, number> = {}
  for (const d of dishes) {
    byCategory[d.category] = (byCategory[d.category] ?? 0) + d.revenue
  }

  const total = Object.values(byCategory).reduce((s, v) => s + v, 0)
  const entries = Object.entries(byCategory)

  // Build segments
  const segments: Segment[] = []
  let cumAngle = 0
  for (const [category, revenue] of entries) {
    const pct = revenue / total
    const sweep = entries.length === 1 ? 359.9 : pct * 360
    segments.push({
      category,
      revenue,
      pct,
      startAngle: cumAngle,
      endAngle: cumAngle + sweep,
      color: CATEGORY_COLORS[category] ?? '#888',
    })
    cumAngle += sweep
  }

  const CX = 100
  const CY = 100
  const R_OUTER = 75
  const R_INNER = 45

  function buildPath(seg: Segment, scale = 1) {
    const start = seg.startAngle
    const end = seg.endAngle
    const largeArc = end - start > 180 ? 1 : 0

    // Scale outward from center for hover
    const outerR = scale === 1 ? R_OUTER : R_OUTER * scale
    const innerR = scale === 1 ? R_INNER : R_INNER * scale

    const o1 = getCoords(CX, CY, outerR, start)
    const o2 = getCoords(CX, CY, outerR, end)
    const i1 = getCoords(CX, CY, innerR, end)
    const i2 = getCoords(CX, CY, innerR, start)

    return [
      `M ${o1.x} ${o1.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
      `L ${i1.x} ${i1.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${i2.x} ${i2.y}`,
      'Z',
    ].join(' ')
  }

  const hoveredSeg = segments.find((s) => s.category === hoveredCategory)

  return (
    <div>
      <div className="relative flex justify-center">
        <svg
          viewBox="0 0 200 200"
          className="w-full max-w-[200px]"
          onMouseLeave={() => { setHoveredCategory(null); setTooltip(null) }}
        >
          {segments.map((seg) => {
            const isHovered = seg.category === hoveredCategory
            return (
              <path
                key={seg.category}
                d={buildPath(seg, isHovered ? 1.06 : 1)}
                fill={seg.color}
                opacity={hoveredCategory && !isHovered ? 0.5 : 1}
                style={{
                  transformOrigin: `${CX}px ${CY}px`,
                  transition: 'opacity 0.15s, transform 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  setHoveredCategory(seg.category)
                  const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
                  setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                }}
                onMouseMove={(e) => {
                  const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
                  setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                }}
              />
            )
          })}

          {/* Center text */}
          <text
            x={CX}
            y={CY - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="bold"
          >
            {formatPEN(total)}
          </text>
          <text
            x={CX}
            y={CY + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#9ca3af"
            fontSize="7"
          >
            ventas totales
          </text>
        </svg>

        {/* Tooltip */}
        {hoveredSeg && tooltip && (
          <div
            className="absolute bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs rounded-lg px-3 py-2 z-10 pointer-events-none whitespace-nowrap"
            style={{ left: tooltip.x + 8, top: Math.max(0, tooltip.y - 10) }}
          >
            <p className="font-semibold" style={{ color: hoveredSeg.color }}>{hoveredSeg.category}</p>
            <p className="text-gray-300">{formatPEN(hoveredSeg.revenue)}</p>
            <p className="text-gray-400">{(hoveredSeg.pct * 100).toFixed(1)}% del total</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {segments.map((seg) => (
          <div key={seg.category} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-gray-400 text-xs truncate">{seg.category}</span>
            <span className="text-gray-500 text-xs ml-auto">{(seg.pct * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
