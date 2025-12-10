import { supabase } from '@/config/supabase'

export const adminService = {
  // Get all users with stats
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        reservations:reservations(count),
        reviews:reviews(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Update user role
  async updateUserRole(userId: string, role: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete user
  async deleteUser(userId: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) throw error
  },

  // Get all restaurants with owner info
  async getAllRestaurants() {
    const { data, error } = await supabase
      .from('restaurants')
      .select(`
        *,
        users:owner_id (full_name, email),
        reservations:reservations(count),
        reviews:reviews(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Delete restaurant
  async deleteRestaurant(restaurantId: string) {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', restaurantId)

    if (error) throw error
  },

  // Get all reservations
  async getAllReservations(filters?: {
    status?: string
    date?: string
    limit?: number
  }) {
    let query = supabase
      .from('reservations')
      .select(`
        *,
        users (full_name, email),
        restaurants (name, city),
        restaurant_tables (table_number, capacity)
      `)
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

  // Get system statistics
  async getSystemStats() {
    // Get user counts
    const { data: users } = await supabase
      .from('users')
      .select('role')

    // Get restaurant count
    const { count: restaurantCount } = await supabase
      .from('restaurants')
      .select('id', { count: 'exact', head: true })

    // Get reservation stats
    const { data: reservations } = await supabase
      .from('reservations')
      .select('status, created_at')

    // Get review count
    const { count: reviewCount } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })

    const today = new Date().toISOString().split('T')[0]
    const thisMonth = new Date().toISOString().substring(0, 7)

    return {
      totalUsers: users?.length || 0,
      customerCount: users?.filter(u => u.role === 'customer').length || 0,
      ownerCount: users?.filter(u => u.role === 'restaurant_owner').length || 0,
      totalRestaurants: restaurantCount || 0,
      totalReservations: reservations?.length || 0,
      todayReservations: reservations?.filter(
        r => r.created_at.split('T')[0] === today
      ).length || 0,
      thisMonthReservations: reservations?.filter(
        r => r.created_at.startsWith(thisMonth)
      ).length || 0,
      pendingReservations: reservations?.filter(
        r => r.status === 'pending'
      ).length || 0,
      totalReviews: reviewCount || 0,
    }
  },

  // Get recent activity
  async getRecentActivity(limit: number = 10) {
    const { data: reservations } = await supabase
      .from('reservations')
      .select(`
        id,
        created_at,
        status,
        users (full_name),
        restaurants (name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    const { data: reviews } = await supabase
      .from('reviews')
      .select(`
        id,
        created_at,
        rating,
        users (full_name),
        restaurants (name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    return {
      reservations: reservations || [],
      reviews: reviews || [],
    }
  },
}
