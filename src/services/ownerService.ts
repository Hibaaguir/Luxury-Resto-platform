import { supabase } from '@/config/supabase'

export const ownerService = {
  // Get owner's restaurants
  async getOwnerRestaurants(ownerId: string) {
    const { data, error } = await supabase
      .from('restaurants')
      .select(`
        *,
        restaurant_images (image_url, is_cover_image)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get restaurant analytics
  async getRestaurantAnalytics(restaurantId: string) {
    // Get total reservations
    const { data: reservations } = await supabase
      .from('reservations')
      .select('id, status, created_at, reservation_date')
      .eq('restaurant_id', restaurantId)

    // Get reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, created_at')
      .eq('restaurant_id', restaurantId)

    // Get favorites count
    const { count: favoritesCount } = await supabase
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)

    const today = new Date().toISOString().split('T')[0]
    const thisMonth = new Date().toISOString().substring(0, 7)

    return {
      totalReservations: reservations?.length || 0,
      upcomingReservations: reservations?.filter(
        r => r.reservation_date >= today && r.status !== 'cancelled'
      ).length || 0,
      todayReservations: reservations?.filter(
        r => r.reservation_date === today && r.status !== 'cancelled'
      ).length || 0,
      thisMonthReservations: reservations?.filter(
        r => r.reservation_date.startsWith(thisMonth)
      ).length || 0,
      totalReviews: reviews?.length || 0,
      averageRating: reviews?.length 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0,
      totalFavorites: favoritesCount || 0,
      recentReservations: reservations?.slice(0, 5) || [],
    }
  },

  // Get restaurant reservations with filters
  async getRestaurantReservations(
    restaurantId: string,
    filters?: {
      status?: string
      date?: string
      limit?: number
    }
  ) {
    let query = supabase
      .from('reservations')
      .select(`
        *,
        users (full_name, email, phone),
        restaurant_tables (table_number, capacity)
      `)
      .eq('restaurant_id', restaurantId)
      .order('reservation_date', { ascending: false })
      .order('reservation_time', { ascending: true })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.date) {
      query = query.eq('reservation_date', filters.date)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  // Update restaurant
  async updateRestaurant(restaurantId: string, updates: any) {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', restaurantId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Create restaurant
  async createRestaurant(ownerId: string, restaurantData: any) {
    const { data, error } = await supabase
      .from('restaurants')
      .insert([
        {
          owner_id: ownerId,
          ...restaurantData,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Upload restaurant image
  async uploadRestaurantImage(
    restaurantId: string,
    file: File,
    isCoverImage: boolean = false
  ) {
    // Upload to storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${restaurantId}/${Math.random()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('restaurant-images')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(fileName)

    // Save to database
    const { data, error } = await supabase
      .from('restaurant_images')
      .insert([
        {
          restaurant_id: restaurantId,
          image_url: urlData.publicUrl,
          is_cover_image: isCoverImage,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get menus with items
  async getRestaurantMenus(restaurantId: string) {
    const { data, error } = await supabase
      .from('menus')
      .select(`
        *,
        menu_items (*)
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Create menu
  async createMenu(restaurantId: string, menuData: any) {
    const { data, error } = await supabase
      .from('menus')
      .insert([
        {
          restaurant_id: restaurantId,
          ...menuData,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update menu
  async updateMenu(menuId: string, updates: any) {
    const { data, error } = await supabase
      .from('menus')
      .update(updates)
      .eq('id', menuId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete menu
  async deleteMenu(menuId: string) {
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId)

    if (error) throw error
  },

  // Create menu item
  async createMenuItem(menuId: string, itemData: any) {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([
        {
          menu_id: menuId,
          ...itemData,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update menu item
  async updateMenuItem(itemId: string, updates: any) {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete menu item
  async deleteMenuItem(itemId: string) {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
  },

  // Get tables
  async getRestaurantTables(restaurantId: string) {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Create table
  async createTable(restaurantId: string, tableData: any) {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .insert([
        {
          restaurant_id: restaurantId,
          ...tableData,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update table
  async updateTable(tableId: string, updates: any) {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .update(updates)
      .eq('id', tableId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete table
  async deleteTable(tableId: string) {
    const { error } = await supabase
      .from('restaurant_tables')
      .delete()
      .eq('id', tableId)

    if (error) throw error
  },
  // Get restaurant reviews
async getRestaurantReviews(restaurantId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      users (full_name, email)
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
},

// Respond to review
async respondToReview(reviewId: string, response: string) {
  const { data, error } = await supabase
    .from('reviews')
    .update({
      owner_response: response,
      owner_response_date: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select()
    .single()

  if (error) throw error
  return data
},

}
