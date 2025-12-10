import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ownerService } from '@/services/ownerService'
import { OwnerDashboardLayout } from '@/components/owner/OwnerDashboardLayout'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { HiSave } from 'react-icons/hi'

export function OwnerSettings() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [priceRange, setPriceRange] = useState('€€')
  const [cuisineType, setCuisineType] = useState<string[]>([])

  // Opening hours
  const [openingHours, setOpeningHours] = useState<any>({
    monday: { open: '11:00', close: '22:00', closed: false },
    tuesday: { open: '11:00', close: '22:00', closed: false },
    wednesday: { open: '11:00', close: '22:00', closed: false },
    thursday: { open: '11:00', close: '22:00', closed: false },
    friday: { open: '11:00', close: '23:00', closed: false },
    saturday: { open: '11:00', close: '23:00', closed: false },
    sunday: { open: '12:00', close: '21:00', closed: false },
  })

  useEffect(() => {
    if (user?.id) {
      loadRestaurants()
    }
  }, [user])

  useEffect(() => {
    if (selectedRestaurant) {
      populateForm()
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

  const populateForm = () => {
    setName(selectedRestaurant.name || '')
    setDescription(selectedRestaurant.description || '')
    setAddress(selectedRestaurant.address || '')
    setCity(selectedRestaurant.city || '')
    setCountry(selectedRestaurant.country || '')
    setPhone(selectedRestaurant.phone || '')
    setEmail(selectedRestaurant.email || '')
    setWebsite(selectedRestaurant.website || '')
    setPriceRange(selectedRestaurant.price_range || '€€')
    setCuisineType(selectedRestaurant.cuisine_type || [])
    setOpeningHours(
      selectedRestaurant.opening_hours || {
        monday: { open: '11:00', close: '22:00', closed: false },
        tuesday: { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday: { open: '11:00', close: '22:00', closed: false },
        friday: { open: '11:00', close: '23:00', closed: false },
        saturday: { open: '11:00', close: '23:00', closed: false },
        sunday: { open: '12:00', close: '21:00', closed: false },
      }
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await ownerService.updateRestaurant(selectedRestaurant.id, {
        name,
        description,
        address,
        city,
        country,
        phone,
        email,
        website,
        price_range: priceRange,
        cuisine_type: cuisineType,
        opening_hours: openingHours,
      })
      alert('Restaurant updated successfully!')
      loadRestaurants()
    } catch (error: any) {
      alert(error.message || 'Failed to update restaurant')
    } finally {
      setSaving(false)
    }
  }

  const toggleCuisine = (cuisine: string) => {
    setCuisineType((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
    )
  }

  const cuisineOptions = [
    'French',
    'Italian',
    'Japanese',
    'Chinese',
    'Indian',
    'Thai',
    'Mexican',
    'Spanish',
    'Greek',
    'American',
    'Lebanese',
    'Korean',
    'Vietnamese',
    'Turkish',
    'Brazilian',
  ]

  const updateDayHours = (day: string, field: string, value: any) => {
    setOpeningHours((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  if (loading) {
    return (
      <OwnerDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
        </div>
      </OwnerDashboardLayout>
    )
  }

  if (restaurants.length === 0) {
    return (
      <OwnerDashboardLayout>
        <div className="py-20 text-center card">
          <div className="mb-4 text-6xl">🍽️</div>
          <h3 className="mb-2 text-h3 text-champagne">No Restaurant Yet</h3>
          <p className="mb-6 text-champagne/70">
            Contact support to create your restaurant
          </p>
        </div>
      </OwnerDashboardLayout>
    )
  }

  return (
    <OwnerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-display text-gradient-gold">Restaurant Settings</h1>
            <p className="text-champagne/70">Manage your restaurant information</p>
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

        {/* Basic Information */}
        <div className="card">
          <h2 className="mb-6 text-h2 text-champagne">Basic Information</h2>
          <div className="space-y-6">
            <Input
              label="Restaurant Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Restaurant Name"
            />

            <div>
              <label className="block mb-2 text-sm font-medium text-champagne">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your restaurant..."
                className="w-full h-32 resize-none input"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                label="Address *"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address"
              />
              <Input
                label="City *"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
              />
            </div>

            <Input
              label="Country *"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <h2 className="mb-6 text-h2 text-champagne">Contact Information</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 1 23 45 67 89"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@restaurant.com"
            />
            <Input
              label="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://restaurant.com"
              className="md:col-span-2"
            />
          </div>
        </div>

        {/* Cuisine & Pricing */}
        <div className="card">
          <h2 className="mb-6 text-h2 text-champagne">Cuisine & Pricing</h2>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-champagne">
              Cuisine Type
            </label>
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map((cuisine) => (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() => toggleCuisine(cuisine)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    cuisineType.includes(cuisine)
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
            <label className="block mb-2 text-sm font-medium text-champagne">
              Price Range
            </label>
            <div className="flex gap-2">
              {['€', '€€', '€€€', '€€€€'].map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setPriceRange(range)}
                  className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${
                    priceRange === range
                      ? 'bg-primary text-charcoal'
                      : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="card">
          <h2 className="mb-6 text-h2 text-champagne">Opening Hours</h2>
          <div className="space-y-4">
            {Object.entries(openingHours).map(([day, hours]: [string, any]) => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-32">
                  <span className="font-semibold capitalize text-champagne">{day}</span>
                </div>
                <div className="flex items-center flex-1 gap-4">
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => updateDayHours(day, 'open', e.target.value)}
                    disabled={hours.closed}
                    className="input"
                  />
                  <span className="text-champagne/70">to</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => updateDayHours(day, 'close', e.target.value)}
                    disabled={hours.closed}
                    className="input"
                  />
                  <label className="flex items-center gap-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) => updateDayHours(day, 'closed', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-champagne">Closed</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg" className='flex items-center justify-center w-full h-full gap-2'>
            <HiSave className="mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </OwnerDashboardLayout>
  )
}
