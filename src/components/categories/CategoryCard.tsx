import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { DynamicIcon } from '@/components/shared/Icons'
import type { Category } from '@/types/database'

interface CategoryCardProps {
  category: Category
  providerCount?: number
}

export function CategoryCard({ category, providerCount }: CategoryCardProps) {
  return (
    <Link href={`/${category.slug}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer group">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <DynamicIcon name={category.icon} className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {category.description}
              </p>
            )}
            {typeof providerCount === 'number' && (
              <p className="text-xs text-muted-foreground">
                {providerCount} {providerCount === 1 ? 'provider' : 'providers'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
