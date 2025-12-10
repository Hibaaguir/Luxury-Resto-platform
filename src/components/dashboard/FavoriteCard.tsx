import { motion } from 'framer-motion'
import { HiStar, HiLocationMarker, HiHeart, HiCalendar } from 'react-icons/hi'
import { Button } from '@/components/common/Button'

interface FavoriteCardProps {
  favorite: any
  onRemove: (restaurantId: string) => void
  onReserve: (restaurantId: string) => void
}

export function FavoriteCard({ favorite, onRemove, onReserve }: FavoriteCardProps) {
  const restaurant = favorite.restaurant

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="overflow-hidden transition-all card group hover:border-primary/30"
    >
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Restaurant Image */}
        <div className="relative h-48 overflow-hidden rounded-lg md:w-64 md:h-auto">
          <img
            src={restaurant.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
            alt={restaurant.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            <button
              onClick={() => onRemove(restaurant.id)}
              className="p-2 transition-colors rounded-full bg-charcoal/80 backdrop-blur-sm hover:bg-rose-900/80"
            >
              <HiHeart className="text-xl text-primary" />
            </button>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="flex flex-col flex-1">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="mb-2 transition-colors text-h3 text-champagne group-hover:text-primary">
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-2 mb-2 text-sm text-champagne/70">
                  <HiLocationMarker />
                  <span>{restaurant.city}, {restaurant.country}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10">
                <HiStar className="text-primary" />
                <span className="font-semibold text-champagne">
                  {restaurant.average_rating?.toFixed(1) || 'N/A'}
                </span>
              </div>
            </div>

            <p className="mb-4 text-champagne/80 line-clamp-2">
              {restaurant.description}
            </p>

            {/* Cuisine Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {restaurant.cuisine_type?.slice(0, 3).map((cuisine: string) => (
                <span
                  key={cuisine}
                  className="px-3 py-1 text-sm rounded-full bg-taupe/20 text-champagne/70"
                >
                  {cuisine}
                </span>
              ))}
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-primary/10 text-primary">
                {restaurant.price_range}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => onReserve(restaurant.id)}
              className="flex-1"
            >
              <HiCalendar className="mr-2" />
              Reserve Table
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = `/restaurants/${restaurant.id}`}
              className="flex-1"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
