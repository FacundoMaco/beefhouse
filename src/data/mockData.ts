import type { BusinessUnit } from '../types'
import { classifyDishes } from '../utils/classification'
import { getInsight } from '../utils/insights'

interface RawDish {
  id: string
  name: string
  category: 'Hamburguesas' | 'Entradas' | 'Principales' | 'Acompañamientos' | 'Postres' | 'Bebidas'
  unitsSold: number
  pricePerUnit: number
  costPerUnit: number
}

const rawDishes: RawDish[] = [
  { id: 'd1',  name: 'BBQ Burger',         category: 'Hamburguesas',    unitsSold: 320, pricePerUnit: 42,   costPerUnit: 18  },
  { id: 'd2',  name: 'Burger Clásica',      category: 'Hamburguesas',    unitsSold: 280, pricePerUnit: 35,   costPerUnit: 12  },
  { id: 'd3',  name: 'Doble Smash',         category: 'Hamburguesas',    unitsSold: 195, pricePerUnit: 52,   costPerUnit: 24  },
  { id: 'd4',  name: 'Alitas BBQ',          category: 'Entradas',        unitsSold: 410, pricePerUnit: 38,   costPerUnit: 22  },
  { id: 'd5',  name: 'Alitas Crispy',       category: 'Entradas',        unitsSold: 290, pricePerUnit: 36,   costPerUnit: 20  },
  { id: 'd6',  name: 'Costillas BBQ',       category: 'Principales',     unitsSold: 145, pricePerUnit: 68,   costPerUnit: 28  },
  { id: 'd7',  name: 'Medallones de Lomo',  category: 'Principales',     unitsSold: 98,  pricePerUnit: 85,   costPerUnit: 28  },
  { id: 'd8',  name: 'Pulled Pork',         category: 'Principales',     unitsSold: 112, pricePerUnit: 58,   costPerUnit: 22  },
  { id: 'd9',  name: 'Papas Fritas',        category: 'Acompañamientos', unitsSold: 520, pricePerUnit: 18,   costPerUnit: 4   },
  { id: 'd10', name: 'Onion Rings',         category: 'Acompañamientos', unitsSold: 210, pricePerUnit: 20,   costPerUnit: 8   },
  { id: 'd11', name: 'Cheesecake',          category: 'Postres',         unitsSold: 88,  pricePerUnit: 28,   costPerUnit: 14  },
  { id: 'd12', name: 'Brownie',             category: 'Postres',         unitsSold: 76,  pricePerUnit: 25,   costPerUnit: 12  },
  { id: 'd13', name: 'Limonada',            category: 'Bebidas',         unitsSold: 380, pricePerUnit: 15,   costPerUnit: 3   },
  { id: 'd14', name: 'Chicha Morada',       category: 'Bebidas',         unitsSold: 290, pricePerUnit: 14,   costPerUnit: 2.5 },
]

// Compute financials
const dishesWithFinancials = rawDishes.map((d) => {
  const revenue = d.unitsSold * d.pricePerUnit
  const totalCost = d.unitsSold * d.costPerUnit
  const margin = ((d.pricePerUnit - d.costPerUnit) / d.pricePerUnit) * 100
  return { ...d, revenue, totalCost, margin, classification: 'Ganador' as const, insight: '' }
})

// Apply classification
const classified = classifyDishes(dishesWithFinancials)

// Apply insights
export const dishes = classified.map((d) => ({
  ...d,
  insight: getInsight(d.classification),
}))

export const businessUnits: BusinessUnit[] = [
  { id: 'u1', name: 'Santa Isabel',          monthlySales: 48500, target: 55000 },
  { id: 'u2', name: 'La Legua',              monthlySales: 41200, target: 50000 },
  { id: 'u3', name: 'Máncora',              monthlySales: 35800, target: 45000 },
  { id: 'u4', name: 'Concesiones (UTP/UDEP)', monthlySales: 29400, target: 40000 },
]

export const period = 'Marzo 2026'
