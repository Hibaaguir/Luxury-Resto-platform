import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { favoriteService } from '@/services/favoriteService'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { FavoriteCard } from '@/components/dashboard/FavoriteCard'
import { Button } from '@/components/common/Button'
import { useNavigate } from 'react-router-dom'
import { HiHeart } from 'react-icons/hi'
import { AnimatePresence } from 'framer-motion'

export function MyFavorites() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadFavorites()
    }
  }, [user])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const data = await favoriteService.getUserFavorites(user!.id)
      setFavorites(data)
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (restaurantId: string) => {
    try {
      await favoriteService.removeFavorite(restaurantId)
      setFavorites(favorites.filter(f => f.restaurant_id !== restaurantId))
    } catch (error: any) {
      alert(error.message || 'Failed to remove favorite')
    }
  }

  const handleReserve = (restaurantId: string) => {
    navigate(`/restaurants/${restaurantId}/reserve`)
  }

  // Group favorites by cuisine
  const cuisineGroups = favorites.reduce((acc, fav) => {
    const cuisine = fav.restaurant.cuisine_type?.[0] || 'Other'
    if (!acc[cuisine]) acc[cuisine] = []
    acc[cuisine].push(fav)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-display text-gradient-gold">My Favorites</h1>
            <p className="text-champagne/70">Your saved restaurants and wishlist</p>
          </div>
          <Button onClick={() => navigate('/restaurants')} className='flex items-center justify-center h-full gap-2'>
            <HiHeart className="mr-2" />
            Discover More
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="card bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
            <p className="mb-1 text-sm text-champagne/70">Total Favorites</p>
            <p className="text-4xl font-bold text-champagne">{favorites.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-rose-900/10 to-transparent border-rose-700/30">
            <p className="mb-1 text-sm text-champagne/70">Cuisines</p>
            <p className="text-4xl font-bold text-champagne">
              {Object.keys(cuisineGroups).length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-forest/10 to-transparent border-forest/30">
            <p className="mb-1 text-sm text-champagne/70">Countries</p>
            <p className="text-4xl font-bold text-champagne">
              {new Set(favorites.map(f => f.restaurant.country)).size}
            </p>
          </div>
        </div>

        {/* Favorites List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="py-20 text-center card">
            <div className="mb-4 text-6xl">💝</div>
            <h3 className="mb-2 text-h3 text-champagne">No Favorites Yet</h3>
            <p className="mb-6 text-champagne/70">
              Start building your wishlist of amazing restaurants
            </p>
            <Button onClick={() => navigate('/restaurants')} className='flex items-center justify-center w-full h-full gap-2 align-middle'>
              <HiHeart className="mr-2" />
              Browse Restaurants
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(cuisineGroups).map(([cuisine, items]) => (
              <div key={cuisine}>
                <h2 className="flex items-center gap-2 mb-4 text-h3 text-champagne">
                  {cuisine}
                  <span className="text-base font-normal text-champagne/50">
                    ({items.length})
                  </span>
                </h2>
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((favorite) => (
                      <FavoriteCard
                        key={favorite.id}
                        favorite={favorite}
                        onRemove={handleRemoveFavorite}
                        onReserve={handleReserve}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
