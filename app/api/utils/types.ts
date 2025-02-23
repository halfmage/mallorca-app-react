import { SORTING_ORDER_NEW, SORTING_ORDER_OLD } from '@/app/api/utils/constants'

export interface Provider {
  id: string
  slug: string
  name: string
  maincategories?: {
    id?: number
    name?: string
    slug?: string
  }
  subcategories: {
    id?: number
    name?: string
    slug?: string
  }[]
  savedCount?: number
  mainImage?: {
    publicUrl?: string
  },
  address?: string
}

export interface Category {
  id: string
  name: string
  slug?: string
}

export type SortingOrder = typeof SORTING_ORDER_NEW | typeof SORTING_ORDER_OLD

export interface Message {
  id: string
  receivedCount?: number|null
  viewedCount?: number|null
}

export interface ProviderTab {
  key: string
  label: string
  mainImage: string
  maincategory: string
  provider_images: Array<{ publicUrl?: string|null }>
}
