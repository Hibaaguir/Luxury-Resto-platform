import { supabase } from '@/config/supabase'

export const userService = {
  // Get user profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  // Update user profile
  async updateProfile(userId: string, updates: {
    full_name?: string
    phone?: string
    preferences?: any
  }) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user statistics
  async getUserStats(userId: string) {
    // Get reservation count
    const { data: reservations } = await supabase
      .from('reservations')
      .select('id, status')
      .eq('user_id', userId)

    // Get review count
    const { data: reviews } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)

    // Get favorites count
    const { data: favorites } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)

    const upcomingReservations = reservations?.filter(
      r => r.status === 'confirmed' || r.status === 'pending'
    ).length || 0

    const completedReservations = reservations?.filter(
      r => r.status === 'completed'
    ).length || 0

    return {
      totalReservations: reservations?.length || 0,
      upcomingReservations,
      completedReservations,
      totalReviews: reviews?.length || 0,
      totalFavorites: favorites?.length || 0,
    }
  },
}
