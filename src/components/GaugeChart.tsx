interface GaugeChartProps {
  value: number  // 0-100
  label: string
}

function getArcCoords(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function buildArcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const sweep = endDeg - startDeg
  if (sweep <= 0) return ''
  const largeArc = sweep > 180 ? 1 : 0
  const start = getArcCoords(cx, cy, r, startDeg)
  const end = getArcCoords(cx, cy, r, endDeg)
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

export default function GaugeChart({ value, label }: GaugeChartProps) {
  const CX = 100
  const CY = 100
  const R = 80
  const SW = 16

  // Background arc: from 180° to 360° (left to right in standard SVG coords)
  // Standard SVG: 0° = right, 90° = down, 180° = left, 270° = up
  // We want semicircle: starts at left (180°) goes to right (360°)
  const bgPath = buildArcPath(CX, CY, R, 180, 360)

  // Filled arc: proportional to value
  const filledEndDeg = 180 + (value / 100) * 180
  const filledPath = value > 0 ? buildArcPath(CX, CY, R, 180, Math.min(filledEndDeg, 359.9)) : ''

  // Color based on value
  const arcColor = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#f43f5e'

  return (
    <div>
      <svg viewBox="0 0 200 120" className="w-full max-w-[240px] mx-auto block">
        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth={SW}
          strokeLinecap="round"
        />

        {/* Filled arc */}
        {filledPath && (
          <path
            d={filledPath}
            fill="none"
            stroke={arcColor}
            strokeWidth={SW}
            strokeLinecap="round"
          />
        )}

        {/* Value text */}
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize="22"
          fontWeight="bold"
        >
          {value.toFixed(1)}%
        </text>

        {/* Label text */}
        <text
          x={CX}
          y={CY + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#9ca3af"
          fontSize="8"
        >
          {label}
        </text>

        {/* Min/Max labels */}
        <text x="18" y="108" textAnchor="middle" fill="#4b5563" fontSize="8">0%</text>
        <text x="182" y="108" textAnchor="middle" fill="#4b5563" fontSize="8">100%</text>
      </svg>
    </div>
  )
}
