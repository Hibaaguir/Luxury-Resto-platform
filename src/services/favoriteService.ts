import { supabase } from '@/config/supabase'

export const favoriteService = {
  // Add restaurant to favorites
  async addFavorite(restaurantId: string) {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('favorites')
      .insert([
        {
          user_id: user.user.id,
          restaurant_id: restaurantId,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Remove restaurant from favorites
  async removeFavorite(restaurantId: string) {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.user.id)
      .eq('restaurant_id', restaurantId)

    if (error) throw error
  },

  // Check if restaurant is favorited
  async isFavorite(restaurantId: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return false

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.user.id)
      .eq('restaurant_id', restaurantId)
      .single()

    return !error && !!data
  },

  // Get user's favorite restaurants
  async getUserFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        restaurants (
          *,
          restaurant_images!restaurant_images_restaurant_id_fkey (image_url, is_cover_image)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform data to include cover image
    return data?.map((fav) => ({
      ...fav,
      restaurant: {
        ...fav.restaurants,
        coverImage: fav.restaurants.restaurant_images?.find((img: any) => img.is_cover_image)?.image_url,
      },
    })) || []
  },

  // Toggle favorite
  async toggleFavorite(restaurantId: string): Promise<boolean> {
    const isFav = await this.isFavorite(restaurantId)
    
    if (isFav) {
      await this.removeFavorite(restaurantId)
      return false
    } else {
      await this.addFavorite(restaurantId)
      return true
    }
  },
}
