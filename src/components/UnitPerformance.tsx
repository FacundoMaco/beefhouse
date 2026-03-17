import { useState } from 'react'
import type { BusinessUnit } from '../types'

interface UnitPerformanceProps {
  units: BusinessUnit[]
}

function formatPEN(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

const SHORT_NAMES: Record<string, string> = {
  'Santa Isabel':           'S. Isabel',
  'La Legua':               'La Legua',
  'Máncora':               'Máncora',
  'Concesiones (UTP/UDEP)': 'Concesiones',
}

// One color per unit
const UNIT_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#a78bfa']

// Simulated weekly distribution — 5 points, each unit has a distinct shape
const WEEKLY_DIST = [
  [0.18, 0.22, 0.21, 0.24, 0.15], // S. Isabel  — strong mid-month
  [0.21, 0.19, 0.23, 0.21, 0.16], // La Legua   — steady
  [0.17, 0.25, 0.19, 0.22, 0.17], // Máncora    — spike sem2
  [0.20, 0.18, 0.20, 0.20, 0.22], // Concesiones — grows toward end
]

const WEEK_LABELS = ['S1', 'S2', 'S3', 'S4', 'S5']

function smoothPath(pts: { x: number; y: number }[], tension = 0.3): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(i + 2, pts.length - 1)]
    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

export default function UnitPerformance({ units }: UnitPerformanceProps) {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null)

  const VW = 400
  const VH = 155
  const PL = 8
  const PR = 8
  const PT = 12
  const PB = 22
  const chartW = VW - PL - PR
  const chartH = VH - PT - PB

  // Compute weekly values per unit
  const weeklyData = units.map((u, ui) =>
    WEEKLY_DIST[ui].map((f) => Math.round(u.monthlySales * f))
  )

  const allVals = weeklyData.flat()
  const maxVal = Math.max(...allVals) * 1.12
  const minVal = Math.min(...allVals) * 0.88

  function xFor(wi: number) {
    return PL + (wi / (WEEK_LABELS.length - 1)) * chartW
  }
  function yFor(v: number) {
    return PT + chartH - ((v - minVal) / (maxVal - minVal)) * chartH
  }

  const unitPoints = weeklyData.map((weeks) =>
    weeks.map((v, wi) => ({ x: xFor(wi), y: yFor(v) }))
  )
  const unitPaths = unitPoints.map((pts) => smoothPath(pts))

  const totalSales = units.reduce((s, u) => s + u.monthlySales, 0)
  const topUnit = [...units].sort((a, b) => b.monthlySales - a.monthlySales)[0]

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * VW
    let closest = 0
    let minDist = Infinity
    for (let wi = 0; wi < WEEK_LABELS.length; wi++) {
      const d = Math.abs(xFor(wi) - relX)
      if (d < minDist) { minDist = d; closest = wi }
    }
    setHoveredWeek(closest)
  }

  return (
    <div className="bg-[#111] border border-[#1d1d1d] rounded-xl p-5">
      {/* Header + legend */}
      <div className="flex items-start justify-between mb-4">
        <p className="text-[#555] text-xs tracking-widest uppercase">Rendimiento por Local</p>
        <div className="flex flex-col gap-1 items-end">
          {units.map((u, i) => (
            <span key={u.id} className="flex items-center gap-1.5">
              <span className="text-[#444] text-[10px]">{SHORT_NAMES[u.name] ?? u.name}</span>
              <span style={{ width: 16, height: 2, background: UNIT_COLORS[i], display: 'inline-block', borderRadius: 2, flexShrink: 0 }} />
            </span>
          ))}
        </div>
      </div>

      {/* Chart */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full"
        style={{ overflow: 'visible', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredWeek(null)}
      >
        {/* Baseline only */}
        <line
          x1={PL} y1={PT + chartH}
          x2={VW - PR} y2={PT + chartH}
          stroke="#1d1d1d" strokeWidth="1"
        />

        {/* Lines — dimmed on hover */}
        {unitPaths.map((path, i) => (
          <path
            key={i}
            d={path}
            fill="none"
            stroke={UNIT_COLORS[i]}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity={hoveredWeek !== null ? 0.25 : 0.85}
            style={{ transition: 'opacity 0.15s' }}
          />
        ))}

        {/* Hover state */}
        {hoveredWeek !== null && (() => {
          const hx = xFor(hoveredWeek)
          // Tooltip placement
          const tw = 162
          const tx = hx + 14 > VW - tw ? hx - tw - 14 : hx + 14
          const ty = PT

          return (
            <>
              {/* Vertical crosshair */}
              <line x1={hx} y1={PT} x2={hx} y2={PT + chartH} stroke="#1d1d1d" strokeWidth="1" />

              {/* Highlighted lines at full opacity */}
              {unitPaths.map((path, i) => (
                <path
                  key={i}
                  d={path}
                  fill="none"
                  stroke={UNIT_COLORS[i]}
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity={0.9}
                />
              ))}

              {/* Dots at hovered column */}
              {unitPoints.map((pts, i) => (
                <circle
                  key={i}
                  cx={pts[hoveredWeek].x}
                  cy={pts[hoveredWeek].y}
                  r={4}
                  fill={UNIT_COLORS[i]}
                  stroke="#111"
                  strokeWidth="2"
                />
              ))}

              {/* Tooltip */}
              <foreignObject x={tx} y={ty} width={tw} height={120}
                style={{ overflow: 'visible', pointerEvents: 'none' }}>
                <div style={{
                  background: '#161616',
                  border: '1px solid #222',
                  borderRadius: 8,
                  padding: '8px 11px',
                  fontSize: 11,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                }}>
                  <p style={{ color: '#444', fontSize: 10, marginBottom: 6 }}>
                    Semana {hoveredWeek + 1}
                  </p>
                  {units.map((u, i) => (
                    <div key={u.id} style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', gap: 10, marginBottom: 3,
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#666' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: UNIT_COLORS[i], flexShrink: 0, display: 'inline-block' }} />
                        {SHORT_NAMES[u.name] ?? u.name}
                      </span>
                      <span style={{ color: UNIT_COLORS[i], fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        {formatPEN(weeklyData[i][hoveredWeek])}
                      </span>
                    </div>
                  ))}
                </div>
              </foreignObject>
            </>
          )
        })()}

        {/* X labels */}
        {WEEK_LABELS.map((label, wi) => (
          <text
            key={wi}
            x={xFor(wi)} y={VH}
            textAnchor="middle"
            fill={hoveredWeek === wi ? '#555' : '#2a2a2a'}
            fontSize="9"
            style={{ transition: 'fill 0.12s' }}
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Bottom stats */}
      <div className="flex items-end justify-between pt-4 mt-2 border-t border-[#1d1d1d]">
        <div>
          <p className="text-[#444] text-xs mb-1">Ventas del mes</p>
          <p className="text-white text-xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatPEN(totalSales)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[#444] text-xs mb-1">Local líder</p>
          <p className="text-amber-400 text-base font-semibold">{SHORT_NAMES[topUnit.name] ?? topUnit.name}</p>
          <p className="text-[#333] text-xs">{formatPEN(topUnit.monthlySales)}</p>
        </div>
      </div>
    </div>
  )
}
