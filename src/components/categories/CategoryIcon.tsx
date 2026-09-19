import type { CSSProperties } from 'react'
import {
  Book,
  Briefcase,
  Car,
  Code,
  Dumbbell,
  GraduationCap,
  Heart,
  Home,
  Music,
  PawPrint,
  Plane,
  ShoppingCart,
  Star,
  Tag,
  Utensils,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { CATEGORY_ICONS } from '@/types'

const ICON_MAP: Record<string, LucideIcon> = {
  tag: Tag,
  star: Star,
  heart: Heart,
  home: Home,
  briefcase: Briefcase,
  book: Book,
  dumbbell: Dumbbell,
  'shopping-cart': ShoppingCart,
  car: Car,
  plane: Plane,
  music: Music,
  code: Code,
  'graduation-cap': GraduationCap,
  utensils: Utensils,
  wrench: Wrench,
  'paw-print': PawPrint,
}

export function CategoryIcon({
  name,
  className,
  style,
}: {
  name: string
  className?: string
  style?: CSSProperties
}) {
  const Icon = ICON_MAP[name] ?? Tag
  return <Icon className={className} style={style} />
}

export const CATEGORY_ICON_NAMES: readonly string[] = CATEGORY_ICONS