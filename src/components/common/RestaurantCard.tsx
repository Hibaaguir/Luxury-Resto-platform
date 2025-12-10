import { Link } from 'react-router-dom'
import { Restaurant } from '@/types/database.types'
import { motion } from 'framer-motion'
import { HiStar, HiLocationMarker } from 'react-icons/hi'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="flex flex-col h-full overflow-hidden card"
    >
      <Link to={`/restaurants/${restaurant.id}`}>
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-taupe">
          {restaurant.restaurant_images?.[0] ? (
            <img
              src={restaurant.restaurant_images[0].image_url}
              alt={restaurant.name}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-charcoal to-taupe">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
          
          {/* Price badge */}
          <div className="absolute px-3 py-1 rounded-full top-4 right-4 bg-primary">
            <span className="text-sm font-semibold text-charcoal">
              {restaurant.price_range}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6">
          <h3 className="mb-2 text-h3 text-champagne line-clamp-1">
            {restaurant.name}
          </h3>

          {/* Location */}
          <div className="flex items-center mb-3 text-sm text-champagne/70">
            <HiLocationMarker className="mr-1" />
            <span>{restaurant.city}, {restaurant.country}</span>
          </div>

          {/* Cuisine types */}
          <div className="flex flex-wrap gap-2 mb-4">
            {restaurant.cuisine_type?.slice(0, 3).map((cuisine) => (
              <span
                key={cuisine}
                className="px-2 py-1 text-xs rounded-full bg-taupe/30 text-champagne"
              >
                {cuisine}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="flex-1 mb-4 text-sm text-champagne/70 line-clamp-2">
            {restaurant.description}
          </p>

          {/* Rating */}
          <div className="flex items-center justify-between pt-4 border-t border-taupe/30">
            <div className="flex items-center">
              <HiStar className="mr-1 text-primary" />
              <span className="font-semibold text-champagne">
                {restaurant.average_rating.toFixed(1)}
              </span>
              <span className="ml-1 text-sm text-champagne/50">
                ({restaurant.reviews?.length || 0} reviews)
              </span>
            </div>
          </div>
          <button className="text-sm font-semibold text-primary hover:text-primary-light">
              View Details →
            </button>
        </div>
      </Link>
    </motion.div>
  )
}
