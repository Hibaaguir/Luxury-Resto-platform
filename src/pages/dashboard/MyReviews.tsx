import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { reviewService } from '@/services/reviewService'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ReviewCard } from '@/components/dashboard/ReviewCard'
import { Button } from '@/components/common/Button'
import { useNavigate } from 'react-router-dom'
import { HiStar } from 'react-icons/hi'

export function MyReviews() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadReviews()
    }
  }, [user])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await reviewService.getUserReviews(user!.id)
      setReviews(data)
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-display text-gradient-gold">My Reviews</h1>
            <p className="text-champagne/70">Your restaurant reviews and ratings</p>
          </div>
          <Button onClick={() => navigate('/restaurants')} className='flex items-center justify-center h-full gap-2'>
            <HiStar className="mr-2" />
            Write a Review
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="card bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
            <p className="mb-1 text-sm text-champagne/70">Total Reviews</p>
            <p className="text-4xl font-bold text-champagne">{reviews.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-forest/10 to-transparent border-forest/30">
            <p className="mb-1 text-sm text-champagne/70">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-4xl font-bold text-champagne">{averageRating}</p>
              <HiStar className="text-2xl text-primary" />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-taupe/10 to-transparent border-taupe/30">
            <p className="mb-1 text-sm text-champagne/70">Restaurants Reviewed</p>
            <p className="text-4xl font-bold text-champagne">
              {new Set(reviews.map(r => r.restaurant_id)).size}
            </p>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center card">
            <div className="mb-4 text-6xl">⭐</div>
            <h3 className="mb-2 text-h3 text-champagne">No Reviews Yet</h3>
            <p className="mb-6 text-champagne/70">
              Share your dining experiences by writing your first review
            </p>
            <Button onClick={() => navigate('/restaurants')}>
              <HiStar className="mr-2" />
              Browse Restaurants
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
