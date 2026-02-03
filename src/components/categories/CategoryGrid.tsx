import { CategoryCard } from './CategoryCard'
import type { Category } from '@/types/database'

interface CategoryGridProps {
  categories: Category[]
  providerCounts?: Record<string, number>
}

export function CategoryGrid({ categories, providerCounts }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          providerCount={providerCounts?.[category.id]}
        />
      ))}
    </div>
  )
}
