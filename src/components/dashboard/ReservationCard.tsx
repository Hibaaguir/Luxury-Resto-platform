import { motion } from 'framer-motion'
import { HiClock, HiUsers, HiLocationMarker, HiX, HiStar } from 'react-icons/hi'
import { Button } from '@/components/common/Button'

interface ReservationCardProps {
  reservation: any
  onCancel?: (id: string) => void
  onReview?: (restaurantId: string) => void
  showActions?: boolean
}

export function ReservationCard({
  reservation,
  onCancel,
  onReview,
  showActions = true,
}: ReservationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-forest/20 text-forest-light border-forest'
      case 'pending':
        return 'bg-primary/20 text-primary border-primary'
      case 'cancelled':
        return 'bg-rose-900/20 text-rose-300 border-rose-700'
      case 'completed':
        return 'bg-taupe/20 text-champagne border-taupe'
      default:
        return 'bg-taupe/20 text-champagne border-taupe'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isPast = new Date(reservation.reservation_date) < new Date()
  const canCancel = !isPast && reservation.status !== 'cancelled' && reservation.status !== 'completed'
  const canReview = reservation.status === 'completed'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="transition-all card hover:border-primary/30"
    >
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Restaurant Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="mb-1 text-h4 text-champagne">
                {reservation.restaurants?.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-champagne/70">
                <HiLocationMarker />
                <span>
                  {reservation.restaurants?.city}, {reservation.restaurants?.country}
                </span>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                reservation.status
              )}`}
            >
              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
            </span>
          </div>

          {/* Reservation Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="mb-1 text-sm text-champagne/70">Date & Time</p>
              <p className="font-semibold text-champagne">
                {formatDate(reservation.reservation_date)}
              </p>
              <p className="flex items-center gap-1 mt-1 text-champagne/70">
                <HiClock className="text-sm" />
                {reservation.reservation_time}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm text-champagne/70">Party Size</p>
              <p className="flex items-center gap-2 font-semibold text-champagne">
                <HiUsers />
                {reservation.number_of_people} guests
              </p>
              <p className="mt-1 text-champagne/70">
                Table {reservation.restaurant_tables?.table_number}
              </p>
            </div>
          </div>

          {/* Confirmation Code */}
          <div className="inline-block px-4 py-2 rounded-lg bg-charcoal-light">
            <p className="mb-1 text-xs text-champagne/70">Confirmation Code</p>
            <p className="font-mono font-bold tracking-wider text-primary">
              {reservation.confirmation_code}
            </p>
          </div>

          {/* Special Requests */}
          {reservation.special_requests && (
            <div className="p-3 mt-4 rounded-lg bg-taupe/10">
              <p className="mb-1 text-xs text-champagne/70">Special Requests</p>
              <p className="text-sm text-champagne">{reservation.special_requests}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col gap-2 md:w-40">
            {canReview && onReview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReview(reservation.restaurant_id)}
                className="flex items-center justify-center w-full gap-2"
              >
                <HiStar className="mr-2" />
                Write Review
              </Button>
            )}
            {canCancel && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(reservation.id)}
                className="flex items-center justify-center w-full gap-2 text-rose-300 border-rose-700 hover:bg-rose-900/20"
              >
                <HiX className="mr-2" />
                Cancel
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = `/restaurants/${reservation.restaurant_id}`}
              className="w-full"
            >
              View Restaurant
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
