import { useState } from 'react'
import { reviewService } from '@/services/reviewService'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/common/Button'
import { PhotoUpload } from '@/components/reviews/PhotoUpload'
import { HiX, HiStar } from 'react-icons/hi'
import { motion } from 'framer-motion'

interface ReviewModalProps {
  restaurantId: string
  restaurantName: string
  onClose: () => void
  onSuccess: () => void
}

export function ReviewModal({
  restaurantId,
  restaurantName,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert('Please login to leave a review')
      return
    }

    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    if (!comment.trim()) {
      alert('Please write a comment')
      return
    }

    try {
      setLoading(true)
      await reviewService.createReview({
        restaurantId,
        rating,
        comment,
        photos: photos.length > 0 ? photos : undefined,
      })
      onSuccess()
    } catch (error: any) {
      alert(error.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 backdrop-blur-sm bg-charcoal/80"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl overflow-y-auto card max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-h2 text-gradient-gold">Write a Review</h2>
              <p className="text-champagne/70">{restaurantName}</p>
            </div>
            <button
              onClick={onClose}
              className="transition-colors text-champagne hover:text-primary"
            >
              <HiX className="text-2xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block mb-3 text-sm font-medium text-champagne">
                Your Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <HiStar
                      className={`text-4xl ${
                        star <= (hoveredRating || rating)
                          ? 'text-primary'
                          : 'text-taupe/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="mt-2 text-sm text-champagne/70">
                  {rating === 5 && '⭐ Excellent!'}
                  {rating === 4 && '😊 Very Good'}
                  {rating === 3 && '🙂 Good'}
                  {rating === 2 && '😐 Average'}
                  {rating === 1 && '😞 Poor'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block mb-2 text-sm font-medium text-champagne">
                Your Review *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={5}
                maxLength={500}
                className="w-full resize-none input"
                required
              />
              <p className="mt-1 text-xs text-champagne/50">
                {comment.length} / 500 characters
              </p>
            </div>

            {/* Photo Upload */}
            <PhotoUpload photos={photos} onPhotosChange={setPhotos} maxPhotos={5} />

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-taupe/20">
              <Button type="submit" loading={loading} className="flex-1">
                Submit Review
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  )
}
