import { useState, useEffect } from 'react'
import { restaurantService, RestaurantFilters } from '@/services/restaurantService'
import { Restaurant } from '@/types/database.types'
import { RestaurantCard } from '@/components/common/RestaurantCard'
import { RestaurantFilters as Filters } from '@/components/common/RestaurantFilters'
import { motion } from 'framer-motion'

export function RestaurantList() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<RestaurantFilters>({})
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [count, setCount] = useState(0)

  useEffect(() => {
    loadRestaurants()
  }, [filters, page])

  const loadRestaurants = async () => {
    setLoading(true)
    try {
      const { data, count, totalPages } = await restaurantService.getRestaurants(filters, page, 12)
      setRestaurants(data as Restaurant[])
      setCount(count)
      setTotalPages(totalPages)
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: RestaurantFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  return (
    <div className="min-h-screen mt-24 bg-gradient-dark">
      {/* Header */}
      <div className="border-b bg-charcoal-light border-taupe/30">
        <div className="py-8 container-luxury">
          <h1 className="mb-2 text-display text-gradient-gold">
            Discover Restaurants
          </h1>
          <p className="text-champagne/70">
            Explore {count} luxury dining experiences worldwide
          </p>
        </div>
      </div>

      <div className="py-8 container-luxury">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8">
              <Filters filters={filters} onFiltersChange={handleFiltersChange} />
            </div>
          </aside>

          {/* Restaurant Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card h-96 animate-pulse bg-charcoal-light" />
                ))}
              </div>
            ) : restaurants.length === 0 ? (
              <div className="py-16 text-center">
                <p className="mb-4 text-h2 text-champagne/50">No restaurants found</p>
                <p className="mb-6 text-champagne/70">Try adjusting your filters</p>
                <button
                  onClick={() => handleFiltersChange({})}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
                >
                  {restaurants.map(restaurant => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-12">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn-outline disabled:opacity-30"
                    >
                      ← Previous
                    </button>
                    
                    <span className="text-champagne">
                      Page {page} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="btn-outline disabled:opacity-30"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
