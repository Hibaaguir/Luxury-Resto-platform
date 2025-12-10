import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ownerService } from '@/services/ownerService'
import { OwnerDashboardLayout } from '@/components/owner/OwnerDashboardLayout'
import { Button } from '@/components/common/Button'
import { HiStar, HiReply, HiX } from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'

export function OwnerReviews() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [responseText, setResponseText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadRestaurants()
    }
  }, [user])

  useEffect(() => {
    if (selectedRestaurant) {
      loadReviews()
    }
  }, [selectedRestaurant])

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      const data = await ownerService.getOwnerRestaurants(user!.id)
      setRestaurants(data)
      if (data.length > 0) {
        setSelectedRestaurant(data[0])
      }
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await ownerService.getRestaurantReviews(selectedRestaurant.id)
      setReviews(data)
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenResponse = (review: any) => {
    setSelectedReview(review)
    setResponseText(review.owner_response || '')
    setShowResponseModal(true)
  }

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return

    try {
      setSubmitting(true)
      await ownerService.respondToReview(selectedReview.id, responseText)
      setShowResponseModal(false)
      setSelectedReview(null)
      setResponseText('')
      loadReviews()
    } catch (error: any) {
      alert(error.message || 'Failed to submit response')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <HiStar
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-primary' : 'text-taupe/30'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  }

  return (
    <OwnerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-display text-gradient-gold">Reviews</h1>
            <p className="text-champagne/70">Manage customer feedback</p>
          </div>

          {/* Restaurant Selector */}
          {restaurants.length > 1 && (
            <select
              value={selectedRestaurant?.id || ''}
              onChange={(e) => {
                const restaurant = restaurants.find((r) => r.id === e.target.value)
                setSelectedRestaurant(restaurant)
              }}
              className="max-w-xs input"
            >
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="card bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
                <p className="mb-1 text-sm text-champagne/70">Average Rating</p>
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-bold text-champagne">
                    {averageRating.toFixed(1)}
                  </p>
                  {renderStars(Math.round(averageRating))}
                </div>
              </div>

              <div className="card">
                <p className="mb-1 text-sm text-champagne/70">Total Reviews</p>
                <p className="text-4xl font-bold text-champagne">{reviews.length}</p>
              </div>

              <div className="card">
                <p className="mb-1 text-sm text-champagne/70">Responses</p>
                <p className="text-4xl font-bold text-champagne">
                  {reviews.filter((r) => r.owner_response).length}
                </p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="card">
              <h2 className="mb-6 text-h2 text-champagne">Rating Distribution</h2>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center w-20 gap-2">
                      <span className="font-semibold text-champagne">{rating}</span>
                      <HiStar className="text-primary" />
                    </div>
                    <div className="flex-1 h-3 overflow-hidden rounded-full bg-taupe/20">
                      <div
                        className="h-full transition-all rounded-full bg-primary"
                        style={{
                          width: `${
                            reviews.length > 0
                              ? (ratingDistribution[rating as keyof typeof ratingDistribution] /
                                  reviews.length) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right text-champagne/70">
                      {ratingDistribution[rating as keyof typeof ratingDistribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="py-20 text-center card">
                <div className="mb-4 text-6xl">⭐</div>
                <h3 className="mb-2 text-h3 text-champagne">No Reviews Yet</h3>
                <p className="text-champagne/70">
                  Your restaurant hasn't received any reviews yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="transition-all card hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                            <span className="font-bold text-primary">
                              {review.users?.full_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-champagne">
                              {review.users?.full_name || 'Anonymous'}
                            </p>
                            <p className="text-sm text-champagne/50">
                              {formatDate(review.created_at)}
                            </p>
                          </div>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      <Button
                        onClick={() => handleOpenResponse(review)}
                        variant="outline"
                        size="sm"
                        className='flex items-center justify-center gap-2'
                      >
                        <HiReply className="mr-2" />
                        {review.owner_response ? 'Edit Response' : 'Respond'}
                      </Button>
                    </div>

                    <p className="mb-4 text-champagne">{review.comment}</p>

                    {/* Owner Response */}
                    {review.owner_response && (
                      <div className="p-4 mt-4 border rounded-lg bg-primary/10 border-primary/30">
                        <div className="flex items-center gap-2 mb-2">
                          <HiReply className="text-primary" />
                          <p className="text-sm font-semibold text-primary">
                            Owner Response
                          </p>
                          {review.owner_response_date && (
                            <p className="ml-auto text-xs text-champagne/50">
                              {formatDate(review.owner_response_date)}
                            </p>
                          )}
                        </div>
                        <p className="text-champagne">{review.owner_response}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Response Modal */}
        <AnimatePresence>
          {showResponseModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowResponseModal(false)}
                className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-sm"
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="w-full max-w-2xl card"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-h2 text-gradient-gold">
                      {selectedReview?.owner_response
                        ? 'Edit Response'
                        : 'Respond to Review'}
                    </h2>
                    <button
                      onClick={() => setShowResponseModal(false)}
                      className="transition-colors text-champagne hover:text-primary"
                    >
                      <HiX className="text-2xl" />
                    </button>
                  </div>

                  {/* Original Review */}
                  <div className="p-4 mb-6 rounded-lg bg-charcoal-light">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(selectedReview?.rating || 0)}
                      <span className="text-sm text-champagne/70">
                        by {selectedReview?.users?.full_name || 'Anonymous'}
                      </span>
                    </div>
                    <p className="text-champagne">{selectedReview?.comment}</p>
                  </div>

                  {/* Response Textarea */}
                  <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-champagne">
                      Your Response
                    </label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Thank you for your feedback..."
                      className="w-full h-32 resize-none input"
                    />
                    <p className="mt-2 text-sm text-champagne/50">
                      Your response will be visible to all customers
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleSubmitResponse}
                      loading={submitting}
                      disabled={!responseText.trim()}
                      className="flex-1"
                    >
                      Submit Response
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowResponseModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </OwnerDashboardLayout>
  )
}
