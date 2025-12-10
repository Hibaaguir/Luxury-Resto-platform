import { motion } from 'framer-motion'
import { HiStar, HiLocationMarker } from 'react-icons/hi'

interface ReviewCardProps {
  review: any
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="transition-all card hover:border-primary/30"
    >
      {/* Restaurant Info */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="mb-1 text-h4 text-champagne">
            {review.restaurants?.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-champagne/70">
            <HiLocationMarker />
            <span>
              {review.restaurants?.city}, {review.restaurants?.country}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <HiStar
              key={i}
              className={`text-xl ${
                i < review.rating ? 'text-primary' : 'text-taupe/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <h4 className="mb-2 text-lg font-semibold text-champagne">
          {review.title}
        </h4>
        <p className="leading-relaxed text-champagne/80">{review.comment}</p>
      </div>

      {/* Review Meta */}
      <div className="flex items-center justify-between pt-4 border-t border-taupe/20">
        <span className="text-sm text-champagne/50">
          Reviewed on {formatDate(review.created_at)}
        </span>
        <a
          href={`/restaurants/${review.restaurant_id}`}
          className="text-sm font-semibold transition-colors text-primary hover:text-primary/80"
        >
          View Restaurant →
        </a>
      </div>
    </motion.div>
  )
}
