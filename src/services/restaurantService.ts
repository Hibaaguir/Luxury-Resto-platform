import { supabase } from '@/config/supabase'
import { Restaurant } from '@/types/database.types'

export interface RestaurantWithImages extends Restaurant {
  restaurant_images?: Array<{
    id: string
    image_url: string
    is_cover_image: boolean
  }>
  reviews?: Array<{ rating: number }>
}

export interface RestaurantFilters {
  search?: string
  country?: string
  city?: string
  cuisineType?: string[]
  priceRange?: string[]
  minRating?: number
  sortBy?: 'rating' | 'name' | 'price_asc' | 'price_desc'
}

export const restaurantService = {
  async getRestaurants(filters?: RestaurantFilters, page = 1, limit = 12) {
    let query = supabase
      .from('restaurants')
      .select('*, restaurant_images(id, image_url, is_cover_image), reviews(rating)', { count: 'exact' })
      .eq('operational_status', 'active')
    // Apply filters
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%`)
    }

    if (filters?.country) {
      query = query.eq('country', filters.country)
    }

    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }

    if (filters?.cuisineType && filters.cuisineType.length > 0) {
      query = query.overlaps('cuisine_type', filters.cuisineType)
    }

    if (filters?.priceRange && filters.priceRange.length > 0) {
      query = query.in('price_range', filters.priceRange)
    }

    if (filters?.minRating) {
      query = query.gte('average_rating', filters.minRating)
    }

    // Sorting
    switch (filters?.sortBy) {
      case 'rating':
        query = query.order('average_rating', { ascending: false })
        break
      case 'name':
        query = query.order('name')
        break
      case 'price_asc':
        query = query.order('price_range')
        break
      case 'price_desc':
        query = query.order('price_range', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return { 
      data: data as RestaurantWithImages[] || [], 
      count: count || 0, 
      totalPages: Math.ceil((count || 0) / limit) 
    }
  },

  // Get single restaurant by ID
  async getRestaurantById(id: string) {
    const { data, error } = await supabase
      .from('restaurants')
      .select(`
        *,
        restaurant_images(*),
        menus(*, menu_items(*)),
        reviews(*, users(full_name, profile_picture))
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Get featured restaurants (highest rated)
  async getFeaturedRestaurants(limit = 6) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*, restaurant_images(id, image_url, is_cover_image)')
      .eq('operational_status', 'active')
      .order('average_rating', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as RestaurantWithImages[] || []
  },

  // Get unique countries
  async getCountries() {
    const { data, error } = await supabase
      .from('restaurants')
      .select('country')
      .eq('operational_status', 'active')

    if (error) throw error
    
    const countries = [...new Set(data?.map(r => r.country) || [])]
    return countries.sort()
  },

  // Get unique cuisine types
  async getCuisineTypes() {
    const { data, error } = await supabase
      .from('restaurants')
      .select('cuisine_type')
      .eq('operational_status', 'active')

    if (error) throw error
    
    const cuisines = new Set<string>()
    data?.forEach(r => {
      r.cuisine_type?.forEach((c: string) => cuisines.add(c))
    })
    
    return Array.from(cuisines).sort()
  },
}
