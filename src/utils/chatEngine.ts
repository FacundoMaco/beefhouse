import type { Dish, BusinessUnit } from '../types'

function formatPEN(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function generateResponse(
  query: string,
  dishes: Dish[],
  units: BusinessUnit[]
): string {
  const q = query.toLowerCase()

  // Least margin / worst margin
  if (q.includes('menos margen') || q.includes('peor margen') || q.includes('menor margen')) {
    const bottom3 = [...dishes].sort((a, b) => a.margin - b.margin).slice(0, 3)
    const lines = bottom3.map(
      (d, i) => `${i + 1}. **${d.name}** — margen ${d.margin.toFixed(1)}% (precio ${formatPEN(d.pricePerUnit)}, costo ${formatPEN(d.costPerUnit)})`
    )
    return `Los 3 platos con menor margen son:\n\n${lines.join('\n')}\n\nEspecialmente **${bottom3[0].name}** merece atención urgente — es clasificado como "${bottom3[0].classification}".`
  }

  // Eliminate / remove
  if (q.includes('eliminar') || q.includes('quitar') || q.includes('sacar del menú') || q.includes('sacar del menu')) {
    const problems = dishes.filter((d) => d.classification === 'Problema')
    if (problems.length === 0) {
      return 'No hay platos clasificados como "Problema" en este momento. ¡Buen trabajo!'
    }
    const lines = problems.map(
      (d) => `• **${d.name}** — ${d.unitsSold} unidades vendidas, margen ${d.margin.toFixed(1)}%`
    )
    return `Los platos candidatos a eliminación (clasificados como "Problema") son:\n\n${lines.join('\n')}\n\nEstos platos tienen baja rotación y bajo margen. Considera rediseñarlos o reemplazarlos.`
  }

  // Best product / most profitable
  if (
    q.includes('mejor producto') ||
    q.includes('más rentable') ||
    q.includes('mas rentable') ||
    q.includes('mejor plato') ||
    q.includes('estrella')
  ) {
    const ganadores = dishes.filter((d) => d.classification === 'Ganador')
    if (ganadores.length === 0) {
      const best = [...dishes].sort((a, b) => b.margin - a.margin)[0]
      return `No hay "Ganadores" clasificados actualmente. El plato más rentable es **${best.name}** con ${best.margin.toFixed(1)}% de margen e ingresos de ${formatPEN(best.revenue)}.`
    }
    const top = [...ganadores].sort((a, b) => b.revenue - a.revenue)[0]
    return `Tu mejor producto actualmente es **${top.name}** 🏆\n\n• Ingresos: ${formatPEN(top.revenue)}\n• Margen: ${top.margin.toFixed(1)}%\n• Unidades vendidas: ${top.unitsSold}\n\nEs un plato "Ganador" — alta rotación y alto margen. Asegura stock constante y úsalo como ancla en tu carta.`
  }

  // Unit / branch performance
  if (
    q.includes('unidad') ||
    q.includes('local') ||
    q.includes('sede') ||
    q.includes('sucursal') ||
    q.includes('rinde') ||
    q.includes('rendimiento')
  ) {
    const sorted = [...units].sort((a, b) => b.monthlySales - a.monthlySales)
    const lines = sorted.map((u, i) => {
      const pct = ((u.monthlySales / u.target) * 100).toFixed(0)
      const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '📍'
      return `${emoji} **${u.name}** — ${formatPEN(u.monthlySales)} (${pct}% del objetivo)`
    })
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    return `Rendimiento de locales en Marzo 2026 — Piura:\n\n${lines.join('\n')}\n\n**${best.name}** lidera el mes como local principal. **${worst.name}** necesita atención — es el local con menor performance del período.`
  }

  // Top sellers
  if (q.includes('top') || q.includes('más vendido') || q.includes('mas vendido') || q.includes('mayor rotación') || q.includes('mayor rotacion')) {
    const top3 = [...dishes].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 3)
    const lines = top3.map(
      (d, i) => `${i + 1}. **${d.name}** — ${d.unitsSold} unidades, ${formatPEN(d.revenue)} en ingresos`
    )
    return `Los 3 platos más vendidos del mes son:\n\n${lines.join('\n')}\n\nEstos son tus tractores de volumen. Considera si sus márgenes permiten mayor rentabilidad.`
  }

  // Default — general summary
  const totalRevenue = dishes.reduce((s, d) => s + d.revenue, 0)
  const avgMargin = dishes.reduce((s, d) => s + d.margin, 0) / dishes.length
  const totalUnits = dishes.reduce((s, d) => s + d.unitsSold, 0)
  const ganadores = dishes.filter((d) => d.classification === 'Ganador').length
  const problemas = dishes.filter((d) => d.classification === 'Problema').length

  return `Resumen de Beef House Piura — Marzo 2026:\n\n• **Ingresos totales:** ${formatPEN(totalRevenue)}\n• **Margen promedio:** ${avgMargin.toFixed(1)}%\n• **Unidades vendidas:** ${totalUnits.toLocaleString()}\n• **Platos Ganadores:** ${ganadores}\n• **Platos Problema:** ${problemas}\n• **Locales activos:** Santa Isabel, La Legua, Máncora y Concesiones (UTP/UDEP)\n\nPuedes preguntarme sobre márgenes, platos a eliminar, tu mejor producto o el rendimiento de tus locales.`
}
