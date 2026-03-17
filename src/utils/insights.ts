import type { Dish, DishClassification, Recommendation } from '../types'

export function getInsight(classification: DishClassification): string {
  switch (classification) {
    case 'Ganador':
      return 'Plato estrella. Alto margen y alta rotación. Asegurar disponibilidad constante.'
    case 'Tractor':
      return 'Alta rotación pero margen ajustado. Revisar costos o considerar ajuste de precio (+5-8%).'
    case 'Oportunidad':
      return 'Excelente margen pero baja rotación. Ideal para promocionar en carta o redes.'
    case 'Problema':
      return 'Bajo margen y baja rotación. Evaluar rediseño o eliminación del menú.'
  }
}

export function generateRecommendations(dishes: Dish[]): Recommendation[] {
  const recommendations: Recommendation[] = []

  // 1. High sales but margin < 40% → suggest price increase
  const highSalesLowMargin = dishes
    .filter((d) => d.margin < 40)
    .sort((a, b) => b.unitsSold - a.unitsSold)[0]

  if (highSalesLowMargin) {
    const newPrice = (highSalesLowMargin.pricePerUnit * 1.05).toFixed(0)
    recommendations.push({
      id: 'rec-1',
      type: 'price_up',
      dish: highSalesLowMargin.name,
      action: `Subir precio de ${highSalesLowMargin.name} a S/ ${newPrice} (+5%)`,
      impact: `+S/ ${(highSalesLowMargin.unitsSold * highSalesLowMargin.pricePerUnit * 0.05).toFixed(0)} adicionales al mes`,
      priority: 'alta',
    })
  }

  // 2. Oportunidad with highest margin → promote
  const bestOpportunity = dishes
    .filter((d) => d.classification === 'Oportunidad')
    .sort((a, b) => b.margin - a.margin)[0]

  if (bestOpportunity) {
    recommendations.push({
      id: 'rec-2',
      type: 'promote',
      dish: bestOpportunity.name,
      action: `Promocionar ${bestOpportunity.name} esta semana en carta y redes`,
      impact: `Margen del ${bestOpportunity.margin.toFixed(0)}% — alto potencial sin explotar`,
      priority: 'alta',
    })
  }

  // 3. Lowest margin overall → review cost
  const lowestMargin = dishes.sort((a, b) => a.margin - b.margin)[0]
  if (lowestMargin) {
    recommendations.push({
      id: 'rec-3',
      type: 'review_cost',
      dish: lowestMargin.name,
      action: `Revisar costo de ${lowestMargin.name} con proveedor`,
      impact: `Margen actual: ${lowestMargin.margin.toFixed(0)}% — por debajo del umbral rentable`,
      priority: 'media',
    })
  }

  // 4. Problema dish → evaluate removal
  const problemDish = dishes
    .filter((d) => d.classification === 'Problema')
    .sort((a, b) => a.margin - b.margin)[0]

  if (problemDish) {
    recommendations.push({
      id: 'rec-4',
      type: 'remove',
      dish: problemDish.name,
      action: `Evaluar eliminación de ${problemDish.name} del menú`,
      impact: `Solo ${problemDish.unitsSold} unidades vendidas con margen del ${problemDish.margin.toFixed(0)}%`,
      priority: 'baja',
    })
  }

  // 5. Local-specific: La Legua low rotation alert
  recommendations.push({
    id: 'rec-5',
    type: 'review_cost',
    dish: 'La Legua',
    action: 'Revisar desempeño de La Legua en productos de baja rotación',
    impact: 'Local al 82% del objetivo — oportunidad de mejora en mix de carta',
    priority: 'media',
  })

  return recommendations
}
