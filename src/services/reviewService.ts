import { supabase } from '@/config/supabase'
import { notificationHelper } from './notificationHelper'
import { photoUpload } from '@/utils/photoUpload'

export const reviewService = {
  // Create review with photos
  async createReview(reviewData: {
    restaurantId: string
    rating: number
    comment: string
    photos?: File[]
  }) {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    // Upload photos if any
    let photoUrls: string[] = []
    if (reviewData.photos && reviewData.photos.length > 0) {
      try {
        photoUrls = await photoUpload.uploadPhotos(reviewData.photos, user.user.id)
      } catch (error) {
        console.error('Error uploading photos:', error)
        throw new Error('Failed to upload photos')
      }
    }

    // Create review
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          user_id: user.user.id,
          restaurant_id: reviewData.restaurantId,
          rating: reviewData.rating,
          comment: reviewData.comment,
          photos: photoUrls.length > 0 ? photoUrls : null,
        },
      ])
      .select(
        `
        *,
        users (full_name, email),
        restaurants (name, owner_id)
      `
      )
      .single()

    if (error) throw error

    // Create notification for restaurant owner
    if (data && data.restaurants && data.users) {
      await notificationHelper.createReviewNotification(
        data.restaurants.owner_id,
        data.id,
        data.restaurants.name,
        data.rating,
        data.users.full_name || 'A customer'
      )
    }

    return data
  },

  // Get restaurant reviews with photos
  async getRestaurantReviews(restaurantId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(
        `
        *,
        users (full_name, email)
      `
      )
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get user reviews
  async getUserReviews(userId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(
        `
        *,
        restaurants (
          id,
          name,
          city,
          restaurant_images (image_url, is_cover_image)
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Update review
  async updateReview(reviewId: string, updates: any, newPhotos?: File[]) {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    // Upload new photos if any
    let photoUrls: string[] = []
    if (newPhotos && newPhotos.length > 0) {
      photoUrls = await photoUpload.uploadPhotos(newPhotos, user.user.id)
    }

    // Merge with existing photos if needed
    if (photoUrls.length > 0 && updates.photos) {
      updates.photos = [...(updates.photos || []), ...photoUrls]
    } else if (photoUrls.length > 0) {
      updates.photos = photoUrls
    }

    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete review (and photos)
  async deleteReview(reviewId: string) {
    // Get review to delete photos
    const { data: review } = await supabase
      .from('reviews')
      .select('photos')
      .eq('id', reviewId)
      .single()

    // Delete photos from storage
    if (review?.photos && review.photos.length > 0) {
      for (const photoUrl of review.photos) {
        try {
          await photoUpload.deletePhoto(photoUrl)
        } catch (error) {
          console.error('Error deleting photo:', error)
        }
      }
    }

    // Delete review
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId)

    if (error) throw error
  },

  // Check if user has reviewed restaurant
  async hasUserReviewed(userId: string, restaurantId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  },

  // Get user's review for restaurant
  async getUserReviewForRestaurant(userId: string, restaurantId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },
}
