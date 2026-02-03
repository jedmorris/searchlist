import {
  Scale,
  FileSearch,
  Calculator,
  Landmark,
  Handshake,
  Shield,
  PiggyBank,
  Users,
  LucideIcon,
} from 'lucide-react'

// Map icon names from database to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Scale,
  FileSearch,
  Calculator,
  Landmark,
  Handshake,
  Shield,
  PiggyBank,
  Users,
}

interface DynamicIconProps {
  name: string | null
  className?: string
}

export function DynamicIcon({ name, className }: DynamicIconProps) {
  if (!name || !iconMap[name]) {
    // Fallback icon
    return <Users className={className} />
  }

  const IconComponent = iconMap[name]
  return <IconComponent className={className} />
}

export { iconMap }
