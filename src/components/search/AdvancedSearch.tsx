import { useState } from 'react'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { HiSearch, HiX, HiAdjustments } from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  initialFilters?: SearchFilters
}

export interface SearchFilters {
  query?: string
  cuisine?: string[]
  priceRange?: string[]
  minRating?: number
  city?: string
  hasAvailability?: boolean
  date?: string
  time?: string
  guests?: number
}

export function AdvancedSearch({ onSearch, initialFilters }: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {})

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
  ]

  const priceRanges = ['€', '€€', '€€€', '€€€€']

  const handleSearch = () => {
    onSearch(filters)
    setShowFilters(false)
  }

  const handleClearFilters = () => {
    setFilters({})
    onSearch({})
  }

  const toggleCuisine = (cuisine: string) => {
    const current = filters.cuisine || []
    setFilters({
      ...filters,
      cuisine: current.includes(cuisine)
        ? current.filter((c) => c !== cuisine)
        : [...current, cuisine],
    })
  }

  const togglePriceRange = (price: string) => {
    const current = filters.priceRange || []
    setFilters({
      ...filters,
      priceRange: current.includes(price)
        ? current.filter((p) => p !== price)
        : [...current, price],
    })
  }

  const activeFiltersCount =
    (filters.cuisine?.length || 0) +
    (filters.priceRange?.length || 0) +
    (filters.minRating ? 1 : 0) +
    (filters.city ? 1 : 0) +
    (filters.hasAvailability ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <HiSearch className="absolute text-xl -translate-y-1/2 left-4 top-1/2 text-champagne/50" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={filters.query || ''}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="w-full pl-12 input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
          <HiAdjustments className="mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary text-charcoal rounded-full text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        <Button onClick={handleSearch}>
          <HiSearch className="mr-2" />
          Search
        </Button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-h3 text-champagne">Advanced Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="transition-colors text-champagne hover:text-primary"
              >
                <HiX className="text-xl" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Cuisine Type */}
              <div>
                <label className="block mb-3 text-sm font-medium text-champagne">
                  Cuisine Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.map((cuisine) => (
                    <button
                      key={cuisine}
                      onClick={() => toggleCuisine(cuisine)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        filters.cuisine?.includes(cuisine)
                          ? 'bg-primary text-charcoal'
                          : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block mb-3 text-sm font-medium text-champagne">
                  Price Range
                </label>
                <div className="flex gap-2">
                  {priceRanges.map((price) => (
                    <button
                      key={price}
                      onClick={() => togglePriceRange(price)}
                      className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${
                        filters.priceRange?.includes(price)
                          ? 'bg-primary text-charcoal'
                          : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating & Location */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-champagne">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.minRating || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minRating: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full input"
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="3.0">3.0+ Stars</option>
                  </select>
                </div>

                <Input
                  label="City"
                  placeholder="e.g., Paris"
                  value={filters.city || ''}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block mb-3 text-sm font-medium text-champagne">
                  Check Availability
                </label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Input
                    label="Date"
                    type="date"
                    value={filters.date || ''}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  />
                  <Input
                    label="Time"
                    type="time"
                    value={filters.time || ''}
                    onChange={(e) => setFilters({ ...filters, time: e.target.value })}
                  />
                  <Input
                    label="Guests"
                    type="number"
                    min="1"
                    value={filters.guests || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        guests: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <label className="flex items-center gap-2 mt-3">
                  <input
                    type="checkbox"
                    checked={filters.hasAvailability || false}
                    onChange={(e) =>
                      setFilters({ ...filters, hasAvailability: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-taupe/30 bg-charcoal-light text-primary focus:ring-primary"
                  />
                  <span className="text-champagne">Only show available restaurants</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-taupe/20">
                <Button onClick={handleSearch} className="flex-1">
                  Apply Filters
                </Button>
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="flex-1"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
