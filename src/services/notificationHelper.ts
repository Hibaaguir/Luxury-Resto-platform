import { supabase } from '@/config/supabase'

export const notificationHelper = {
  // Create notification for new reservation (notify owner)
  async createReservationNotification(
    ownerId: string,
    reservationId: string,
    restaurantName: string,
    reservationDate: string,
    reservationTime: string,
    guests: number
  ) {
    try {
      const { error } = await supabase.from('notifications').insert([
        {
          user_id: ownerId,
          type: 'reservation_new',
          title: 'New Reservation',
          message: `New reservation for ${guests} guests at ${restaurantName} on ${reservationDate} at ${reservationTime}`,
          related_id: reservationId,
          is_read: false,
        },
      ])

      if (error) throw error
    } catch (error) {
      console.error('Error creating reservation notification:', error)
    }
  },

  // Create notification for reservation confirmation (notify customer)
  async createConfirmationNotification(
    userId: string,
    reservationId: string,
    restaurantName: string,
    reservationDate: string,
    reservationTime: string,
    confirmationCode: string
  ) {
    try {
      const { error } = await supabase.from('notifications').insert([
        {
          user_id: userId,
          type: 'reservation_confirmed',
          title: 'Reservation Confirmed',
          message: `Your reservation at ${restaurantName} on ${reservationDate} at ${reservationTime} has been confirmed. Confirmation code: ${confirmationCode}`,
          related_id: reservationId,
          is_read: false,
        },
      ])

      if (error) throw error
    } catch (error) {
      console.error('Error creating confirmation notification:', error)
    }
  },

  // Create notification for reservation cancellation (notify customer)
  async createCancellationNotification(
    userId: string,
    reservationId: string,
    restaurantName: string,
    reservationDate: string,
    reservationTime: string
  ) {
    try {
      const { error } = await supabase.from('notifications').insert([
        {
          user_id: userId,
          type: 'reservation_cancelled',
          title: 'Reservation Cancelled',
          message: `Your reservation at ${restaurantName} on ${reservationDate} at ${reservationTime} has been cancelled.`,
          related_id: reservationId,
          is_read: false,
        },
      ])

      if (error) throw error
    } catch (error) {
      console.error('Error creating cancellation notification:', error)
    }
  },

  // Create notification for new review (notify owner)
  async createReviewNotification(
    ownerId: string,
    reviewId: string,
    restaurantName: string,
    rating: number,
    customerName: string
  ) {
    try {
      const { error } = await supabase.from('notifications').insert([
        {
          user_id: ownerId,
          type: 'review',
          title: 'New Review',
          message: `${customerName} left a ${rating}-star review for ${restaurantName}`,
          related_id: reviewId,
          is_read: false,
        },
      ])

      if (error) throw error
    } catch (error) {
      console.error('Error creating review notification:', error)
    }
  },
}
