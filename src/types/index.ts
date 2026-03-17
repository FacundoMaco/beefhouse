export type DishCategory =
  | 'Hamburguesas'
  | 'Entradas'
  | 'Principales'
  | 'Acompañamientos'
  | 'Postres'
  | 'Bebidas'

export type DishClassification = 'Ganador' | 'Tractor' | 'Oportunidad' | 'Problema'

export interface Dish {
  id: string
  name: string
  category: DishCategory
  unitsSold: number
  pricePerUnit: number  // PEN
  costPerUnit: number   // PEN
  // computed:
  revenue: number
  totalCost: number
  margin: number        // percentage
  classification: DishClassification
  insight: string
}

export interface BusinessUnit {
  id: string
  name: string
  monthlySales: number  // PEN
  target: number        // PEN
}

export interface KPI {
  label: string
  value: string
  change: number  // percentage change vs last month
  icon: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Recommendation {
  id: string
  type: 'price_up' | 'promote' | 'review_cost' | 'remove'
  dish: string
  action: string
  impact: string
  priority: 'alta' | 'media' | 'baja'
}
