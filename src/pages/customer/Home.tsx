import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { restaurantService } from '@/services/restaurantService'
import { Restaurant } from '@/types/database.types'
import { RestaurantCard } from '@/components/common/RestaurantCard'
import { motion } from 'framer-motion'
import { HiSearch, HiLocationMarker, HiStar } from 'react-icons/hi'

export function Home() {
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadFeaturedRestaurants()
  }, [])

  const loadFeaturedRestaurants = async () => {
    try {
      const data = await restaurantService.getFeaturedRestaurants(6)
      setFeaturedRestaurants(data)
    } catch (error) {
      console.error('Error loading featured restaurants:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/restaurants?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-charcoal-light to-charcoal opacity-90" />
        
        {/* Content */}
        <div className="relative z-10 px-4 text-center container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="mb-6 text-6xl font-bold md:text-7xl lg:text-8xl font-playfair text-gradient-gold">
              Luxury Dining
            </h1>
            <p className="max-w-2xl mx-auto mb-12 text-xl md:text-2xl text-champagne/80">
              Discover and reserve tables at the world's finest restaurants
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="relative">
                <HiSearch className="absolute text-2xl -translate-y-1/2 left-6 top-1/2 text-champagne/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by restaurant, city, or cuisine..."
                  className="w-full py-6 pl-16 pr-6 text-lg input"
                />
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <Link to="/restaurants" className="px-8 text-lg btn-primary">
                  Explore All Restaurants
                </Link>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-charcoal to-transparent" />
      </section>

      {/* Features */}
      <section className="py-20 bg-charcoal-light">
        <div className="container-luxury">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20">
                <HiLocationMarker className="text-3xl text-primary" />
              </div>
              <h3 className="mb-3 text-h3 text-champagne">Global Selection</h3>
              <p className="text-champagne/70">
                Access exclusive restaurants in major cities worldwide
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20">
                <HiStar className="text-3xl text-primary" />
              </div>
              <h3 className="mb-3 text-h3 text-champagne">Premium Quality</h3>
              <p className="text-champagne/70">
                Only the finest Michelin-starred and award-winning establishments
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20">
                <span className="text-3xl text-primary">✓</span>
              </div>
              <h3 className="mb-3 text-h3 text-champagne">Easy Booking</h3>
              <p className="text-champagne/70">
                Reserve your table in seconds with our seamless booking system
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-20">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-display text-gradient-gold">
              Featured Restaurants
            </h2>
            <p className="text-lg text-champagne/70">
              Handpicked selections from our curated collection
            </p>
          </motion.div>

          {featuredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RestaurantCard restaurant={restaurant} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-champagne/50">
              Loading featured restaurants...
            </div>
          )}

          <div className="mt-12 text-center">
            <Link to="/restaurants" className="text-lg btn-secondary">
              View All Restaurants →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
