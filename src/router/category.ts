import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { Category } from '@services/../pl-serve-type-main/type/main'

export type RoutedCategory = Extract<Category, 'Experiment' | 'Discussion' | 'User'>

type RouteCategoryInput = string | string[] | null | undefined

const categoryAliases: Record<string, RoutedCategory> = {
  e: 'Experiment',
  exp: 'Experiment',
  experiment: 'Experiment',
  p: 'Experiment',
  project: 'Experiment',
  d: 'Discussion',
  disc: 'Discussion',
  discussion: 'Discussion',
  c: 'Discussion',
  comment: 'Discussion',
  u: 'User',
  user: 'User',
}

export function normalizeRouteCategory(category: RouteCategoryInput): RoutedCategory | undefined
export function normalizeRouteCategory(
  category: RouteCategoryInput,
  fallback: RoutedCategory,
): RoutedCategory
export function normalizeRouteCategory(
  category: RouteCategoryInput,
  fallback?: RoutedCategory,
): RoutedCategory | undefined {
  const value = Array.isArray(category) ? category[0] : category
  if (!value) return fallback
  return categoryAliases[value.toLowerCase()] ?? fallback
}

export function getRouteCategory(route: RouteLocationNormalizedLoaded): RoutedCategory | undefined
export function getRouteCategory(
  route: RouteLocationNormalizedLoaded,
  fallback: RoutedCategory,
): RoutedCategory
export function getRouteCategory(
  route: RouteLocationNormalizedLoaded,
  fallback?: RoutedCategory,
): RoutedCategory | undefined {
  return normalizeRouteCategory(
    route.params.category as RouteCategoryInput,
    fallback as RoutedCategory,
  )
}
