import type { DishClassification } from '../types'

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

export function classifyDishes<T extends { margin: number; unitsSold: number }>(
  dishes: T[]
): (T & { classification: DishClassification })[] {
  const medianMargin = median(dishes.map((d) => d.margin))
  const medianSales = median(dishes.map((d) => d.unitsSold))

  return dishes.map((dish) => {
    const highMargin = dish.margin > medianMargin
    const highSales = dish.unitsSold > medianSales

    let classification: DishClassification
    if (highMargin && highSales) classification = 'Ganador'
    else if (!highMargin && highSales) classification = 'Tractor'
    else if (highMargin && !highSales) classification = 'Oportunidad'
    else classification = 'Problema'

    return { ...dish, classification }
  })
}
