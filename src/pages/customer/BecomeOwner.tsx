import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { HiOfficeBuilding, HiCheckCircle, HiPhotograph, HiX } from 'react-icons/hi'
import { motion } from 'framer-motion'

export function BecomeOwner() {
  const { user, profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    // Restaurant Basic Info
    restaurantName: '',
    description: '',
    cuisineType: [] as string[],
    priceRange: '€€',
    
    // Location
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    
    // Contact
    restaurantPhone: '',
    restaurantEmail: '',
    website: '',
    
    // Operating Hours
    openingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false },
    },
  })

  // Images state
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [coverImageIndex, setCoverImageIndex] = useState(0)

  const cuisineOptions = [
    'French', 'Italian', 'Japanese', 'Chinese', 'Indian', 'Thai',
    'Mexican', 'Spanish', 'Greek', 'American', 'Lebanese', 'Korean',
    'Vietnamese', 'Turkish', 'Brazilian', 'Mediterranean'
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (images.length + files.length > 10) {
      alert('Maximum 10 images allowed')
      return
    }

    const validFiles: File[] = []
    const previews: string[] = []

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image`)
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max 5MB`)
        return
      }
      validFiles.push(file)
      previews.push(URL.createObjectURL(file))
    })

    setImages([...images, ...validFiles])
    setImagePreviews([...imagePreviews, ...previews])
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
    if (coverImageIndex === index) setCoverImageIndex(0)
    if (coverImageIndex > index) setCoverImageIndex(coverImageIndex - 1)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      // Step 1: Update user role to restaurant_owner
      await updateProfile({ role: 'restaurant_owner' })

      // Step 2: Create restaurant with status 'pending'
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([
          {
            owner_id: user!.id,
            name: formData.restaurantName,
            description: formData.description,
            cuisine_type: formData.cuisineType,
            price_range: formData.priceRange,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            country: formData.country,
            phone: formData.restaurantPhone,
            email: formData.restaurantEmail,
            website: formData.website,
            opening_hours: formData.openingHours,
            status: 'pending', // Set as pending for admin approval
          },
        ])
        .select()
        .single()

      if (restaurantError) throw restaurantError

      // Step 3: Upload images if any
      if (images.length > 0) {
        const uploadPromises = images.map(async (file, index) => {
          const fileExt = file.name.split('.').pop()
          const fileName = `${restaurant.id}/${Date.now()}-${index}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('restaurant-images')
            .upload(fileName, file)

          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage
            .from('restaurant-images')
            .getPublicUrl(fileName)

          // Insert into restaurant_images table
          const { error: imageError } = await supabase
            .from('restaurant_images')
            .insert({
              restaurant_id: restaurant.id,
              image_url: urlData.publicUrl,
              is_cover_image: index === coverImageIndex,
            })

          if (imageError) throw imageError
        })

        await Promise.all(uploadPromises)
      }

      // Step 4: Create default tables
      const defaultTables = [
        { table_number: 1, capacity: 2, is_available: true },
        { table_number: 2, capacity: 2, is_available: true },
        { table_number: 3, capacity: 4, is_available: true },
        { table_number: 4, capacity: 4, is_available: true },
        { table_number: 5, capacity: 6, is_available: true },
      ]

      const { error: tablesError } = await supabase
        .from('restaurant_tables')
        .insert(
          defaultTables.map((table) => ({
            ...table,
            restaurant_id: restaurant.id,
          }))
        )

      if (tablesError) throw tablesError

      // Success!
      setStep(5)
      setTimeout(() => {
        navigate('/owner')
      }, 2000)
    } catch (error: any) {
      console.error('Error creating restaurant:', error)
      alert(error.message || 'Failed to create restaurant')
    } finally {
      setLoading(false)
    }
  }

  const toggleCuisine = (cuisine: string) => {
    setFormData({
      ...formData,
      cuisineType: formData.cuisineType.includes(cuisine)
        ? formData.cuisineType.filter((c) => c !== cuisine)
        : [...formData.cuisineType, cuisine],
    })
  }

  return (
    <div className="min-h-screen py-20 bg-gradient-dark">
      <div className="max-w-4xl container-luxury">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20"
          >
            <HiOfficeBuilding className="text-4xl text-primary" />
          </motion.div>
          <h1 className="mb-4 text-display text-gradient-gold">
            Become a Restaurant Owner
          </h1>
          <p className="text-lg text-champagne/70">
            Join our platform and start accepting reservations today
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s
                    ? 'bg-primary text-charcoal'
                    : 'bg-taupe/20 text-champagne/50'
                }`}
              >
                {step > s ? <HiCheckCircle className="text-xl" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-20 h-1 mx-2 rounded transition-all ${
                    step > s ? 'bg-primary' : 'bg-taupe/20'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="mb-6 text-h2 text-champagne">Restaurant Information</h2>

            <div className="space-y-4">
              <Input
                label="Restaurant Name *"
                placeholder="Le Gourmet"
                value={formData.restaurantName}
                onChange={(e) =>
                  setFormData({ ...formData, restaurantName: e.target.value })
                }
                required
              />

              <div>
                <label className="block mb-2 text-sm font-medium text-champagne">
                  Description *
                </label>
                <textarea
                  placeholder="Describe your restaurant..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full resize-none input"
                  required
                />
              </div>

              <div>
                <label className="block mb-3 text-sm font-medium text-champagne">
                  Cuisine Type * (Select multiple)
                </label>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.map((cuisine) => (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => toggleCuisine(cuisine)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        formData.cuisineType.includes(cuisine)
                          ? 'bg-primary text-charcoal'
                          : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-3 text-sm font-medium text-champagne">
                  Price Range *
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {['€', '€€', '€€€', '€€€€'].map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => setFormData({ ...formData, priceRange: price })}
                      className={`p-4 rounded-lg font-bold transition-all ${
                        formData.priceRange === price
                          ? 'bg-primary text-charcoal'
                          : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setStep(2)}
                disabled={
                  !formData.restaurantName ||
                  !formData.description ||
                  formData.cuisineType.length === 0
                }
              >
                Next Step
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Location & Contact */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="mb-6 text-h2 text-champagne">Location & Contact</h2>

            <div className="space-y-4">
              <Input
                label="Address *"
                placeholder="123 Main Street"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City *"
                  placeholder="Paris"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
                <Input
                  label="Postal Code *"
                  placeholder="75001"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  required
                />
              </div>

              <Input
                label="Country *"
                placeholder="France"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
              />

              <div className="pt-6 mt-6 border-t border-taupe/20">
                <h3 className="mb-4 text-h3 text-champagne">Contact Information</h3>

                <div className="space-y-4">
                  <Input
                    label="Phone *"
                    type="tel"
                    placeholder="+33 1 23 45 67 89"
                    value={formData.restaurantPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, restaurantPhone: e.target.value })
                    }
                    required
                  />

                  <Input
                    label="Email *"
                    type="email"
                    placeholder="contact@restaurant.com"
                    value={formData.restaurantEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, restaurantEmail: e.target.value })
                    }
                    required
                  />

                  <Input
                    label="Website (Optional)"
                    type="url"
                    placeholder="https://restaurant.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={
                  !formData.address ||
                  !formData.city ||
                  !formData.postalCode ||
                  !formData.country ||
                  !formData.restaurantPhone ||
                  !formData.restaurantEmail
                }
              >
                Next Step
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Operating Hours */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="mb-6 text-h2 text-champagne">Operating Hours</h2>

            <div className="space-y-4">
              {Object.entries(formData.openingHours).map(([day, hours]) => (
                <div
                  key={day}
                  className="flex items-center gap-4 p-4 rounded-lg bg-charcoal-light"
                >
                  <div className="w-32">
                    <p className="font-semibold capitalize text-champagne">{day}</p>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          openingHours: {
                            ...formData.openingHours,
                            [day]: { ...hours, closed: e.target.checked },
                          },
                        })
                      }
                      className="w-5 h-5"
                    />
                    <span className="text-sm text-champagne/70">Closed</span>
                  </label>

                  {!hours.closed && (
                    <>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            openingHours: {
                              ...formData.openingHours,
                              [day]: { ...hours, open: e.target.value },
                            },
                          })
                        }
                        className="input"
                      />
                      <span className="text-champagne/50">to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            openingHours: {
                              ...formData.openingHours,
                              [day]: { ...hours, close: e.target.value },
                            },
                          })
                        }
                        className="input"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)}>Next Step</Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Upload Images */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="mb-6 text-h2 text-champagne">Restaurant Photos</h2>

            <div className="mb-6">
              <label className="block mb-3 text-sm font-medium text-champagne">
                Upload Photos (Max 10) - At least 1 recommended
              </label>
              
              <div className="grid grid-cols-2 gap-4 mb-4 md:grid-cols-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative overflow-hidden rounded-lg group aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute flex items-center justify-center w-8 h-8 transition-opacity rounded-full opacity-0 top-2 right-2 bg-rose-900/90 group-hover:opacity-100"
                    >
                      <HiX className="text-white" />
                    </button>
                    <button
                      onClick={() => setCoverImageIndex(index)}
                      className={`absolute bottom-2 left-2 px-3 py-1 text-xs font-semibold rounded-full ${
                        coverImageIndex === index
                          ? 'bg-primary text-charcoal'
                          : 'bg-charcoal/80 text-champagne'
                      }`}
                    >
                      {coverImageIndex === index ? '⭐ Cover' : 'Set Cover'}
                    </button>
                  </div>
                ))}

                {images.length < 10 && (
                  <label className="flex flex-col items-center justify-center gap-2 transition-all border-2 border-dashed rounded-lg cursor-pointer aspect-square border-taupe/30 hover:border-primary/50 bg-charcoal-light hover:bg-primary/5 group">
                    <HiPhotograph className="text-4xl transition-colors text-champagne/50 group-hover:text-primary" />
                    <span className="text-sm transition-colors text-champagne/50 group-hover:text-primary">
                      Add Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <p className="text-sm text-champagne/50">
                💡 Tip: Upload high-quality photos of your restaurant, food, and ambiance.
                The first selected image will be the cover photo.
              </p>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={handleSubmit} loading={loading}>
                Submit for Approval
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 text-center card"
          >
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-forest/20">
              <HiCheckCircle className="text-5xl text-forest-light" />
            </div>
            <h2 className="mb-4 text-h2 text-gradient-gold">
              Submitted Successfully! 🎉
            </h2>
            <p className="mb-2 text-lg text-champagne/70">
              Your restaurant is pending admin approval
            </p>
            <p className="mb-8 text-champagne/50">
              You'll be notified once approved. Redirecting to dashboard...
            </p>
            <div className="w-8 h-8 mx-auto border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
