import { useState } from 'react'
import type { Dish, DishCategory, DishClassification } from '../types'
import { ChevronUp, ChevronDown, Filter } from 'lucide-react'

interface DishesTableProps {
  dishes: Dish[]
}

function formatPEN(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE')}`
}

const classificationBadge: Record<DishClassification, string> = {
  Ganador:    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  Tractor:    'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  Oportunidad:'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  Problema:   'bg-red-500/15 text-red-400 border border-red-500/30',
}

const actionLabel: Record<DishClassification, { text: string; color: string }> = {
  Ganador:     { text: 'Mantener',           color: 'text-emerald-400' },
  Tractor:     { text: 'Subir precio',       color: 'text-blue-400' },
  Oportunidad: { text: 'Promocionar',        color: 'text-amber-400' },
  Problema:    { text: 'Evaluar eliminación', color: 'text-red-400' },
}

const categories: DishCategory[] = [
  'Hamburguesas', 'Entradas', 'Principales', 'Acompañamientos', 'Postres', 'Bebidas',
]

type SortField = 'margin' | 'revenue' | 'unitsSold'
type SortDir = 'asc' | 'desc'

export default function DishesTable({ dishes }: DishesTableProps) {
  const [filterCat, setFilterCat] = useState<DishCategory | 'Todos'>('Todos')
  const [filterClass, setFilterClass] = useState<DishClassification | null>(null)
  const [sortField, setSortField] = useState<SortField>('margin')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function toggleClassFilter(cls: DishClassification) {
    setFilterClass((prev) => (prev === cls ? null : cls))
    setFilterCat('Todos')
  }

  const filtered = dishes
    .filter((d) => filterCat === 'Todos' || d.category === filterCat)
    .filter((d) => filterClass === null || d.classification === filterClass)
    .sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1
      return (a[sortField] - b[sortField]) * mult
    })

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronDown size={12} className="text-gray-600" />
    return sortDir === 'desc'
      ? <ChevronDown size={12} className="text-amber-400" />
      : <ChevronUp size={12} className="text-amber-400" />
  }

  return (
    <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl">
      {/* Filter bar — categorías */}
      <div className="flex items-center gap-2 p-4 pb-2 flex-wrap">
        <Filter size={14} className="text-gray-500" />
        <span className="text-gray-400 text-sm mr-1">Categoría:</span>
        {(['Todos', ...categories] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => { setFilterCat(cat as DishCategory | 'Todos'); setFilterClass(null) }}
            className={`text-xs px-3 py-1.5 rounded-full transition-all duration-150 ${
              filterCat === cat && filterClass === null
                ? 'bg-amber-500 text-black font-semibold'
                : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter bar — clasificación rápida */}
      <div className="flex items-center gap-2 px-4 pb-3 pt-1 border-b border-[#2a2a2a] flex-wrap">
        <span className="text-gray-500 text-xs mr-1">Vista rápida:</span>
        <button
          onClick={() => toggleClassFilter('Problema')}
          className={`text-xs px-3 py-1.5 rounded-full transition-all duration-150 border ${
            filterClass === 'Problema'
              ? 'bg-red-500/20 text-red-300 border-red-500/40 font-semibold'
              : 'bg-red-500/8 text-red-400 border-red-500/20 hover:bg-red-500/15'
          }`}
        >
          Problemas
        </button>
        <button
          onClick={() => toggleClassFilter('Oportunidad')}
          className={`text-xs px-3 py-1.5 rounded-full transition-all duration-150 border ${
            filterClass === 'Oportunidad'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
              : 'bg-amber-500/8 text-amber-400 border-amber-500/20 hover:bg-amber-500/15'
          }`}
        >
          Oportunidades
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs border-b border-[#2a2a2a]">
              <th className="text-left px-4 py-3 font-medium">Plato</th>
              <th className="text-left px-4 py-3 font-medium">Categoría</th>
              <th
                className="text-right px-4 py-3 font-medium cursor-pointer hover:text-amber-400 transition-colors"
                onClick={() => handleSort('unitsSold')}
              >
                <span className="flex items-center justify-end gap-1">
                  Ventas <SortIcon field="unitsSold" />
                </span>
              </th>
              <th
                className="text-right px-4 py-3 font-medium cursor-pointer hover:text-amber-400 transition-colors"
                onClick={() => handleSort('revenue')}
              >
                <span className="flex items-center justify-end gap-1">
                  Ingresos <SortIcon field="revenue" />
                </span>
              </th>
              <th className="text-right px-4 py-3 font-medium">Precio</th>
              <th className="text-right px-4 py-3 font-medium">Costo</th>
              <th
                className="text-right px-4 py-3 font-medium cursor-pointer hover:text-amber-400 transition-colors"
                onClick={() => handleSort('margin')}
              >
                <span className="flex items-center justify-end gap-1">
                  Ganancia (%) <SortIcon field="margin" />
                </span>
              </th>
              <th className="text-center px-4 py-3 font-medium">Clasificación</th>
              <th className="text-left px-4 py-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((dish, i) => (
              <tr
                key={dish.id}
                className={`border-b border-[#222] transition-colors hover:bg-[#252525] ${
                  i % 2 === 0 ? '' : 'bg-[#1a1a1a]/50'
                }`}
              >
                <td className="px-4 py-3 text-white font-medium">{dish.name}</td>
                <td className="px-4 py-3 text-gray-400">{dish.category}</td>
                <td className="px-4 py-3 text-right text-gray-300">{dish.unitsSold.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-amber-400 font-semibold">
                  {formatPEN(dish.revenue)}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">{formatPEN(dish.pricePerUnit)}</td>
                <td className="px-4 py-3 text-right text-gray-400">{formatPEN(dish.costPerUnit)}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-semibold ${
                      dish.margin >= 60
                        ? 'text-emerald-400'
                        : dish.margin >= 40
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {dish.margin.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      classificationBadge[dish.classification]
                    }`}
                  >
                    {dish.classification}
                  </span>
                </td>
                <td className={`px-4 py-3 text-xs font-semibold ${actionLabel[dish.classification].color}`}>
                  {actionLabel[dish.classification].text}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 text-gray-600 text-xs border-t border-[#2a2a2a]">
        Mostrando {filtered.length} de {dishes.length} platos
      </div>
    </div>
  )
}
