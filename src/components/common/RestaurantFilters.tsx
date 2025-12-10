import { useState, useEffect } from 'react'
import { RestaurantFilters as Filters } from '@/services/restaurantService'
import { restaurantService } from '@/services/restaurantService'
import { HiSearch, HiX } from 'react-icons/hi'
import { Input } from './Input'

interface RestaurantFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export function RestaurantFilters({ filters, onFiltersChange }: RestaurantFiltersProps) {
  const [countries, setCountries] = useState<string[]>([])
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadFilterOptions()
  }, [])

  const loadFilterOptions = async () => {
    try {
      const [countriesData, cuisinesData] = await Promise.all([
        restaurantService.getCountries(),
        restaurantService.getCuisineTypes(),
      ])
      setCountries(countriesData)
      setCuisineTypes(cuisinesData)
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  const handleCuisineToggle = (cuisine: string) => {
    const current = filters.cuisineType || []
    const updated = current.includes(cuisine)
      ? current.filter(c => c !== cuisine)
      : [...current, cuisine]
    onFiltersChange({ ...filters, cuisineType: updated })
  }

  const handlePriceToggle = (price: string) => {
    const current = filters.priceRange || []
    const updated = current.includes(price)
      ? current.filter(p => p !== price)
      : [...current, price]
    onFiltersChange({ ...filters, priceRange: updated })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const activeFiltersCount = 
    (filters.cuisineType?.length || 0) +
    (filters.priceRange?.length || 0) +
    (filters.country ? 1 : 0) +
    (filters.minRating ? 1 : 0)

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <HiSearch className="absolute -translate-y-1/2 left-4 top-1/2 text-champagne/50" />
        <Input
          type="text"
          placeholder="Search restaurants, cities, cuisine..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-12"
        />
      </div>

      {/* Mobile filter toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full btn-secondary"
        >
          <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          {isOpen ? <HiX /> : <span>▼</span>}
        </button>
      </div>

      {/* Filters */}
      <div className={`space-y-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        {/* Country */}
        <div>
          <label className="block mb-3 font-semibold text-champagne">Country</label>
          <select
            value={filters.country || ''}
            onChange={(e) => onFiltersChange({ ...filters, country: e.target.value || undefined })}
            className="w-full input"
          >
            <option value="">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block mb-3 font-semibold text-champagne">City</label>
          <Input
            type="text"
            placeholder="Enter city..."
            value={filters.city || ''}
            onChange={(e) => onFiltersChange({ ...filters, city: e.target.value || undefined })}
          />
        </div>

        {/* Cuisine Type */}
        <div>
          <label className="block mb-3 font-semibold text-champagne">Cuisine Type</label>
          <div className="space-y-2 overflow-y-auto max-h-64">
            {cuisineTypes.map(cuisine => (
              <label key={cuisine} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.cuisineType?.includes(cuisine) || false}
                  onChange={() => handleCuisineToggle(cuisine)}
                  className="mr-3 accent-primary"
                />
                <span className="transition-colors text-champagne group-hover:text-primary">
                  {cuisine}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block mb-3 font-semibold text-champagne">Price Range</label>
          <div className="space-y-2">
            {['€', '€€', '€€€', '€€€€'].map(price => (
              <label key={price} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.priceRange?.includes(price) || false}
                  onChange={() => handlePriceToggle(price)}
                  className="mr-3 accent-primary"
                />
                <span className="transition-colors text-champagne group-hover:text-primary">
                  {price}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block mb-3 font-semibold text-champagne">Minimum Rating</label>
          <select
            value={filters.minRating || ''}
            onChange={(e) => onFiltersChange({ ...filters, minRating: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full input"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block mb-3 font-semibold text-champagne">Sort By</label>
          <select
            value={filters.sortBy || ''}
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as any || undefined })}
            className="w-full input"
          >
            <option value="">Most Recent</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name (A-Z)</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
          </select>
        </div>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="w-full btn-outline"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  )
}
