import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { restaurantService } from '@/services/restaurantService'
import { favoriteService } from '@/services/favoriteService'
import { reviewService } from '@/services/reviewService'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/common/Button'
import { ReviewModal } from '@/components/reviews/ReviewModal'
import { ImageLightbox } from '@/components/common/ImageLightbox'
import {
  HiLocationMarker,
  HiPhone,
  HiMail,
  HiGlobeAlt,
  HiStar,
  HiClock,
  HiCurrencyDollar,
  HiHeart,
  HiCalendar,
  HiChevronLeft,
  HiChevronRight,
  HiEye,
  HiReply,
} from 'react-icons/hi'

export function RestaurantDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'reviews'>('overview')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  // Review state
  const [reviews, setReviews] = useState<any[]>([])
  const [canReview, setCanReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  // Lightbox state
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  useEffect(() => {
    if (id) {
      loadRestaurant()
      loadReviews()
      if (user) {
        checkFavoriteStatus()
        checkReviewEligibility()
      }
    }
  }, [id, user])

  const loadRestaurant = async () => {
    try {
      setLoading(true)
      const data = await restaurantService.getRestaurantById(id!)
      console.log('Loaded restaurant:', data)
      setRestaurant(data)
      setSelectedImageIndex(0)
    } catch (error) {
      console.error('Error loading restaurant:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      const data = await reviewService.getRestaurantReviews(id!)
      setReviews(data)
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  const checkFavoriteStatus = async () => {
    try {
      const status = await favoriteService.isFavorite(id!)
      setIsFavorite(status)
    } catch (error) {
      console.error('Error checking favorite:', error)
    }
  }

  const checkReviewEligibility = async () => {
    try {
      const hasReviewedStatus = await reviewService.hasUserReviewed(user!.id, id!)
      setCanReview(!hasReviewedStatus)
      setHasReviewed(hasReviewedStatus)
    } catch (error) {
      console.error('Error checking review eligibility:', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      setFavoriteLoading(true)
      const newStatus = await favoriteService.toggleFavorite(id!)
      setIsFavorite(newStatus)
    } catch (error: any) {
      alert(error.message || 'Failed to update favorite')
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleReviewSuccess = () => {
    loadReviews()
    checkReviewEligibility()
    setShowReviewModal(false)
  }

  const getDayName = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[new Date().getDay()]
  }

  const isOpenNow = () => {
    if (!restaurant?.opening_hours) return null

    const today = getDayName()
    const hours = restaurant.opening_hours[today]

    if (!hours || hours.closed) return false

    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`

    return currentTime >= hours.open && currentTime <= hours.close
  }

  const getRestaurantImages = () => {
    if (!restaurant) return []
    
    if (restaurant.restaurant_images && restaurant.restaurant_images.length > 0) {
      return restaurant.restaurant_images.map((img: any) => img.image_url)
    }
    
    return ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200']
  }

  const images = getRestaurantImages()

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const openImageLightbox = (imageList: string[], index: number) => {
    setLightboxImages(imageList)
    setLightboxIndex(index)
    setShowLightbox(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-dark">
        <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-dark">
        <div className="text-center">
          <h1 className="mb-4 text-h1 text-champagne">Restaurant Not Found</h1>
          <Button onClick={() => navigate('/restaurants')}>Back to Restaurants</Button>
        </div>
      </div>
    )
  }

  const openStatus = isOpenNow()

  return (
    <div className="min-h-screen mt-20 bg-gradient-dark">
      {/* Hero Section with Image Gallery */}
      <div className="relative h-[600px] overflow-hidden">
        {/* Main Image */}
        <motion.img
          key={`${id}-${selectedImageIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          src={images[selectedImageIndex] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
          alt={restaurant.name}
          className="object-cover w-full h-full cursor-pointer"
          onClick={() => openImageLightbox(images, selectedImageIndex)}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent" />

        {/* Image Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute z-10 p-3 transition-all -translate-y-1/2 rounded-full left-4 top-1/2 bg-charcoal/80 backdrop-blur-sm text-champagne hover:text-primary hover:bg-charcoal hover:scale-110"
            >
              <HiChevronLeft className="text-2xl" />
            </button>
            <button
              onClick={nextImage}
              className="absolute z-10 p-3 transition-all -translate-y-1/2 rounded-full right-4 top-1/2 bg-charcoal/80 backdrop-blur-sm text-champagne hover:text-primary hover:bg-charcoal hover:scale-110"
            >
              <HiChevronRight className="text-2xl" />
            </button>
          </>
        )}

        {/* Image Dots Navigation */}
        {images.length > 1 && (
          <div className="absolute z-10 flex gap-2 -translate-x-1/2 bottom-24 left-1/2">
            {images.map((_: string, index: number) => (
              <button
                key={`dot-${index}`}
                onClick={() => setSelectedImageIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === selectedImageIndex
                    ? 'bg-primary w-8'
                    : 'bg-champagne/30 hover:bg-champagne/50 w-2'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute z-10 px-3 py-2 text-sm font-semibold rounded-full top-4 right-4 bg-charcoal/80 backdrop-blur-sm text-champagne">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="pb-12 container-luxury">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                {restaurant.cuisine_type?.slice(0, 3).map((cuisine: string) => (
                  <span
                    key={cuisine}
                    className="px-4 py-1 text-sm border rounded-full bg-charcoal/80 backdrop-blur-sm text-champagne border-taupe/30"
                  >
                    {cuisine}
                  </span>
                ))}
                {openStatus !== null && (
                  <span
                    className={`px-4 py-1 backdrop-blur-sm rounded-full text-sm font-semibold ${
                      openStatus
                        ? 'bg-forest/80 text-forest-light border border-forest'
                        : 'bg-rose-900/80 text-rose-300 border border-rose-700'
                    }`}
                  >
                    {openStatus ? '● Open Now' : '● Closed'}
                  </span>
                )}
              </div>

              <h1 className="mb-4 text-display text-champagne">{restaurant.name}</h1>

              <div className="flex flex-wrap items-center gap-6 mb-6 text-champagne/80">
                <div className="flex items-center gap-2">
                  <HiLocationMarker className="text-primary" />
                  <span>
                    {restaurant.address}, {restaurant.city}, {restaurant.country}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <HiStar className="text-primary" />
                  <span className="font-semibold">
                    {restaurant.average_rating?.toFixed(1) || 'N/A'}
                  </span>
                  <span className="text-champagne/60">({reviews.length} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiCurrencyDollar className="text-primary" />
                  <span className="font-semibold">{restaurant.price_range}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate(`/restaurants/${id}/reserve`)}
                  className="flex items-center justify-center h-full gap-2"
                >
                  <HiCalendar className="mr-2" />
                  Reserve a Table
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleToggleFavorite}
                  loading={favoriteLoading}
                  className={
                    isFavorite
                      ? 'border-primary text-primary flex items-center justify-center h-full gap-2'
                      : 'flex items-center justify-center h-full gap-2'
                  }
                >
                  <HiHeart className={`mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-40 border-b border-taupe/20 bg-charcoal/95 backdrop-blur-md">
        <div className="container-luxury">
          <div className="flex gap-8">
            {(['overview', 'menu', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 font-semibold transition-colors relative ${
                  activeTab === tab ? 'text-primary' : 'text-champagne/70 hover:text-champagne'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-12 container-luxury">
        <div className="max-w-6xl mx-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* About */}
              <div className="card">
                <h2 className="mb-4 text-h2 text-champagne">About</h2>
                <p className="text-lg leading-relaxed text-champagne/80">
                  {restaurant.description}
                </p>
              </div>

              {/* Contact & Hours */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Contact Information */}
                <div className="card">
                  <h3 className="mb-6 text-h3 text-champagne">Contact Information</h3>
                  <div className="space-y-4">
                    {restaurant.phone && (
                      <div className="flex items-center gap-3 text-champagne/80">
                        <HiPhone className="text-xl text-primary" />
                        <a
                          href={`tel:${restaurant.phone}`}
                          className="transition-colors hover:text-primary"
                        >
                          {restaurant.phone}
                        </a>
                      </div>
                    )}
                    {restaurant.email && (
                      <div className="flex items-center gap-3 text-champagne/80">
                        <HiMail className="text-xl text-primary" />
                        <a
                          href={`mailto:${restaurant.email}`}
                          className="transition-colors hover:text-primary"
                        >
                          {restaurant.email}
                        </a>
                      </div>
                    )}
                    {restaurant.website && (
                      <div className="flex items-center gap-3 text-champagne/80">
                        <HiGlobeAlt className="text-xl text-primary" />
                        <a
                          href={restaurant.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:text-primary"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    <div className="flex items-start gap-3 text-champagne/80">
                      <HiLocationMarker className="mt-1 text-xl text-primary" />
                      <div>
                        <p>{restaurant.address}</p>
                        <p>
                          {restaurant.city}, {restaurant.country}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="card">
                  <h3 className="flex items-center gap-2 mb-6 text-h3 text-champagne">
                    <HiClock className="text-primary" />
                    Opening Hours
                  </h3>
                  <div className="space-y-3">
                    {restaurant.opening_hours &&
                      Object.entries(restaurant.opening_hours).map(
                        ([day, hours]: [string, any]) => {
                          const isToday = day === getDayName()
                          return (
                            <div
                              key={day}
                              className={`flex justify-between py-2 px-3 rounded-lg ${
                                isToday ? 'bg-primary/10 border border-primary/30' : ''
                              }`}
                            >
                              <span
                                className={`font-semibold ${
                                  isToday ? 'text-primary' : 'text-champagne'
                                }`}
                              >
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                              </span>
                              <span className="text-champagne/70">
                                {hours.closed ? (
                                  <span className="text-rose-300">Closed</span>
                                ) : (
                                  `${hours.open} - ${hours.close}`
                                )}
                              </span>
                            </div>
                          )
                        }
                      )}
                  </div>
                </div>
              </div>

              {/* Restaurant Images Gallery */}
              {images.length > 1 && (
                <div className="card">
                  <h2 className="mb-6 text-h2 text-champagne">Photo Gallery</h2>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => openImageLightbox(images, index)}
                        className="relative overflow-hidden rounded-lg cursor-pointer aspect-square group"
                      >
                        <img
                          src={image}
                          alt={`${restaurant.name} - Photo ${index + 1}`}
                          className="object-cover w-full h-full transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 flex items-center justify-center transition-colors bg-charcoal/0 group-hover:bg-charcoal/20">
                          <HiEye className="text-2xl text-white transition-opacity opacity-0 group-hover:opacity-100" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {restaurant.menus && restaurant.menus.length > 0 ? (
                restaurant.menus.map((menu: any) => (
                  <div key={menu.id} className="card">
                    <div className="mb-6">
                      <h2 className="mb-2 text-h2 text-champagne">{menu.name}</h2>
                      {menu.description && (
                        <p className="text-champagne/70">{menu.description}</p>
                      )}
                    </div>

                    <div className="space-y-6">
                      {menu.menu_items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-4 pb-6 border-b border-taupe/20 last:border-0"
                        >
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-champagne">
                                {item.name}
                              </h3>
                              {item.dietary_tags && item.dietary_tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {item.dietary_tags.map((tag: string) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-0.5 bg-forest/20 text-forest-light text-xs rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="mb-2 text-champagne/70">{item.description}</p>
                            {item.allergens && item.allergens.length > 0 && (
                              <p className="text-sm text-rose-300">
                                Contains: {item.allergens.join(', ')}
                              </p>
                            )}
                          </div>
                          <span className="text-lg font-bold text-primary whitespace-nowrap">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center card">
                  <div className="mb-4 text-6xl">🍽️</div>
                  <h3 className="mb-2 text-h3 text-champagne">Menu Coming Soon</h3>
                  <p className="text-champagne/70">
                    The restaurant menu will be available shortly
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Review Actions */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="mb-2 text-h2 text-champagne">Customer Reviews</h2>
                    <p className="text-champagne/70">
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                  {user && canReview && !hasReviewed && (
                    <Button onClick={() => setShowReviewModal(true)}>
                      <HiStar className="mr-2" />
                      Write a Review
                    </Button>
                  )}
                  {user && hasReviewed && (
                    <span className="font-semibold text-forest-light">
                      ✓ You've reviewed this restaurant
                    </span>
                  )}
                  {!user && (
                    <Button variant="outline" onClick={() => navigate('/login')}>
                      Sign in to Review
                    </Button>
                  )}
                </div>
              </div>

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="card">
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div
                        key={review.id}
                        className="pb-6 border-b border-taupe/20 last:border-0"
                      >
                        <div className="flex items-start gap-4 mb-3">
                          <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-full bg-primary/20">
                            <span className="text-lg font-bold text-primary">
                              {review.users?.full_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold text-champagne">
                                  {review.users?.full_name || 'Anonymous'}
                                </p>
                                <p className="text-sm text-champagne/50">
                                  {new Date(review.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <HiStar
                                    key={star}
                                    className={`${
                                      star <= review.rating ? 'text-primary' : 'text-taupe/30'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Comment */}
                            <p className="mb-4 text-champagne">{review.comment}</p>

                            {/* Review Photos */}
                            {review.photos && review.photos.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mb-4 md:grid-cols-4">
                                {review.photos.map((photoUrl: string, index: number) => (
                                  <button
                                    key={index}
                                    onClick={() =>
                                      openImageLightbox(review.photos, index)
                                    }
                                    className="relative overflow-hidden rounded-lg cursor-pointer aspect-square group"
                                  >
                                    <img
                                      src={photoUrl}
                                      alt={`Review photo ${index + 1}`}
                                      className="object-cover w-full h-full transition-transform group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center transition-colors bg-charcoal/0 group-hover:bg-charcoal/30">
                                      <HiEye className="text-2xl text-white transition-opacity opacity-0 group-hover:opacity-100" />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Owner Response */}
                            {review.owner_response && (
                              <div className="p-4 mt-4 border rounded-lg bg-primary/5 border-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <HiReply className="text-primary" />
                                  <p className="text-sm font-semibold text-primary">
                                    Response from Owner
                                  </p>
                                  {review.owner_response_date && (
                                    <p className="ml-auto text-xs text-champagne/50">
                                      {new Date(
                                        review.owner_response_date
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <p className="text-champagne/90">{review.owner_response}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center card">
                  <div className="mb-4 text-6xl">⭐</div>
                  <h3 className="mb-2 text-h3 text-champagne">No Reviews Yet</h3>
                  <p className="mb-6 text-champagne/70">
                    Be the first to review this restaurant!
                  </p>
                  {user && canReview && (
                    <Button onClick={() => setShowReviewModal(true)}>
                      <HiStar className="mr-2" />
                      Write the First Review
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          restaurantId={id!}
          restaurantName={restaurant.name}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* Image Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <ImageLightbox
            images={lightboxImages}
            initialIndex={lightboxIndex}
            onClose={() => setShowLightbox(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
