import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { restaurantService } from '@/services/restaurantService'
import { reservationService } from '@/services/reservationService'
import { useAuth } from '@/contexts/AuthContext'
import { FloorPlanView } from '@/components/reservation/FloorPlanView'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { motion, AnimatePresence } from 'framer-motion'
import { HiArrowLeft, HiArrowRight, HiCheckCircle } from 'react-icons/hi'

type Step = 'datetime' | 'table' | 'details' | 'confirmation'

export function ReservationFlow() {
  const { id: restaurantId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('datetime')
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Form data
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [numberOfPeople, setNumberOfPeople] = useState(2)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [specialRequests, setSpecialRequests] = useState('')

  // Available tables
  const [availableTables, setAvailableTables] = useState<any[]>([])
  const [loadingTables, setLoadingTables] = useState(false)

  // Restaurant hours validation
  const [restaurantHours, setRestaurantHours] = useState<any>(null)
  const [hoursError, setHoursError] = useState<string>('')

  // Confirmation
  const [confirmation, setConfirmation] = useState<any>(null)

  useEffect(() => {
    if (restaurantId) loadRestaurant()
  }, [restaurantId])

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0]
    if (!date) setDate(today)
  }, [])

  useEffect(() => {
    if (date && time && restaurantId) {
      checkRestaurantHours()
    }
  }, [date, time, restaurantId])

  const loadRestaurant = async () => {
    try {
      const data = await restaurantService.getRestaurantById(restaurantId!)
      setRestaurant(data)
    } catch (error) {
      console.error('Error loading restaurant:', error)
    }
  }

  const checkRestaurantHours = async () => {
    try {
      const hoursCheck = await reservationService.checkRestaurantHours(
        restaurantId!,
        date,
        time
      )
      setRestaurantHours(hoursCheck)
      if (!hoursCheck.isOpen) {
        setHoursError(hoursCheck.message || 'Restaurant is closed at this time')
      } else {
        setHoursError('')
      }
    } catch (error) {
      console.error('Error checking hours:', error)
    }
  }

  const checkAvailability = async () => {
    if (!date || !time) return
    setLoadingTables(true)
    try {
      const tables = await reservationService.getAvailableTables(
        restaurantId!,
        date,
        time
      )
      setAvailableTables(tables)
    } catch (error: any) {
      console.error('Error checking availability:', error)
      alert(error.message || 'Error checking availability')
      setAvailableTables([])
    } finally {
      setLoadingTables(false)
    }
  }

  const handleDateTimeNext = () => {
    if (!date || !time || !numberOfPeople) {
      alert('Please fill in all fields')
      return
    }

    if (hoursError) {
      alert(hoursError)
      return
    }

    checkAvailability()
    setStep('table')
  }

  const handleTableNext = () => {
    if (!selectedTableId) {
      alert('Please select a table')
      return
    }
    setStep('details')
  }

  const handleSubmitReservation = async () => {
    if (!selectedTableId) return

    setLoading(true)
    try {
      const reservation = await reservationService.createReservation({
        restaurantId: restaurantId!,
        tableId: selectedTableId,
        date,
        time,
        numberOfPeople,
        specialRequests,
      })

      setConfirmation(reservation)
      setStep('confirmation')
    } catch (error: any) {
      console.error('Error creating reservation:', error)
      alert(error.message || 'Failed to create reservation')
    } finally {
      setLoading(false)
    }
  }

  const selectedTable = availableTables.find((t) => t.id === selectedTableId)

  // Generate time slots (12:00 - 22:00 in 30min intervals)
  const timeSlots = []
  for (let h = 12; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0')
      const minute = m.toString().padStart(2, '0')
      timeSlots.push(`${hour}:${minute}`)
    }
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-dark">
        <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-dark">
      <div className="max-w-6xl container-luxury">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() =>
              step === 'datetime'
                ? navigate(`/restaurants/${restaurantId}`)
                : step === 'confirmation'
                ? navigate(`/restaurants/${restaurantId}`)
                : setStep((prev) => {
                    const steps: Step[] = ['datetime', 'table', 'details', 'confirmation']
                    const currentIndex = steps.indexOf(prev)
                    return currentIndex > 0 ? steps[currentIndex - 1] : 'datetime'
                  })
            }
            className="flex items-center mb-4 transition-colors text-champagne hover:text-primary"
          >
            <HiArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="mb-2 text-display text-gradient-gold">
            Reserve at {restaurant.name}
          </h1>
          <p className="text-champagne/70">
            {restaurant.address}, {restaurant.city}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {(['datetime', 'table', 'details', 'confirmation'] as Step[]).map(
            (s, idx) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step === s
                      ? 'bg-primary text-charcoal'
                      : ['datetime', 'table', 'details', 'confirmation'].indexOf(
                          step
                        ) >
                        ['datetime', 'table', 'details', 'confirmation'].indexOf(s)
                      ? 'bg-primary/50 text-charcoal'
                      : 'bg-taupe/30 text-champagne/50'
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      ['datetime', 'table', 'details', 'confirmation'].indexOf(
                        step
                      ) > idx
                        ? 'bg-primary/50'
                        : 'bg-taupe/30'
                    }`}
                  />
                )}
              </div>
            )
          )}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Date & Time */}
          {step === 'datetime' && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card"
            >
              <h2 className="mb-6 text-h2 text-champagne">Select Date & Time</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />

                  <div>
                    <label className="block mb-2 text-sm font-medium text-champagne">
                      Time
                    </label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full input"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hours validation message */}
                {hoursError && (
                  <div className="px-4 py-3 text-red-500 border border-red-500 bg-red-500/10 rounded-luxury">
                    <p className="font-semibold">{hoursError}</p>
                    {restaurantHours?.openingTime && (
                      <p className="mt-1 text-sm">
                        Open hours: {restaurantHours.openingTime} -{' '}
                        {restaurantHours.closingTime}
                      </p>
                    )}
                  </div>
                )}

                {!hoursError && restaurantHours?.isOpen && time && (
                  <div className="px-4 py-3 border bg-forest/10 border-forest text-forest-light rounded-luxury">
                    ✓ Restaurant is open at this time ({restaurantHours.openingTime} -{' '}
                    {restaurantHours.closingTime})
                  </div>
                )}

                <div>
                  <label className="block mb-2 text-sm font-medium text-champagne">
                    Number of People
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <button
                        key={num}
                        onClick={() => setNumberOfPeople(num)}
                        className={`w-12 h-12 rounded-luxury font-semibold transition-all ${
                          numberOfPeople === num
                            ? 'bg-primary text-charcoal'
                            : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleDateTimeNext}
                  className="flex items-center justify-center w-full gap-2"
                  disabled={!date || !time || !!hoursError}

                >
                  Check Availability<HiArrowRight className="" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Table Selection */}
          {step === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {loadingTables ? (
                <div className="py-20 text-center card">
                  <div className="w-16 h-16 mx-auto border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
                  <p className="mt-4 text-champagne">Loading floor plan...</p>
                </div>
              ) : (
                <>
                  <FloorPlanView
                    tables={availableTables}
                    selectedTableId={selectedTableId}
                    onSelectTable={setSelectedTableId}
                    numberOfPeople={numberOfPeople}
                    restaurantName={restaurant.name}
                  />
                  <div className="flex gap-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setStep('datetime')}
                      className="flex items-center justify-center w-full gap-2"
                    >
                      <HiArrowLeft className="mr-2" /> Back
                    </Button>
                    <Button
                      onClick={handleTableNext}
                      className="flex items-center justify-center w-full gap-2"
                      disabled={!selectedTableId}
                    >
                      Continue <HiArrowRight className="ml-2" />
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Step 3: Details */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card"
            >
              <h2 className="mb-6 text-h2 text-champagne">Reservation Details</h2>

              {/* Summary */}
              <div className="p-6 mb-6 bg-charcoal-light rounded-luxury">
                <h3 className="mb-4 font-semibold text-champagne">Summary</h3>
                <div className="space-y-2 text-champagne/70">
                  <p>
                    <span className="text-champagne">Date:</span>{' '}
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p>
                    <span className="text-champagne">Time:</span> {time}
                  </p>
                  <p>
                    <span className="text-champagne">Guests:</span> {numberOfPeople}
                  </p>
                  <p>
                    <span className="text-champagne">Table:</span>{' '}
                    {selectedTable?.table_number} (Capacity: {selectedTable?.capacity})
                  </p>
                </div>
              </div>

              {/* Special Requests */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-champagne">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Dietary restrictions, allergies, special occasions..."
                  className="w-full h-32 resize-none input"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('table')}
                  className="flex items-center justify-center w-full gap-2"
                >
                  <HiArrowLeft className="mr-2" /> Back
                </Button>
                <Button
                  onClick={handleSubmitReservation}
                  loading={loading}
                  className="flex items-center justify-center w-full gap-2"
                >
                  Confirm Reservation
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirmation' && confirmation && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center card"
            >
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20">
                <HiCheckCircle className="text-5xl text-primary" />
              </div>

              <h2 className="mb-4 text-h2 text-gradient-gold">
                Reservation Confirmed!
              </h2>

              <div className="p-8 mb-6 bg-charcoal-light rounded-luxury">
                <p className="mb-4 text-champagne/70">Your confirmation code:</p>
                <p className="font-mono text-4xl font-bold tracking-wider text-primary">
                  {confirmation.confirmation_code}
                </p>
              </div>

              <div className="p-6 mb-6 text-left bg-charcoal-light rounded-luxury">
                <h3 className="mb-4 font-semibold text-champagne">
                  Reservation Details
                </h3>
                <div className="space-y-2 text-champagne/70">
                  <p>
                    <span className="text-champagne">Restaurant:</span>{' '}
                    {restaurant.name}
                  </p>
                  <p>
                    <span className="text-champagne">Date:</span>{' '}
                    {new Date(date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="text-champagne">Time:</span> {time}
                  </p>
                  <p>
                    <span className="text-champagne">Guests:</span> {numberOfPeople}
                  </p>
                  <p>
                    <span className="text-champagne">Table:</span>{' '}
                    {selectedTable?.table_number}
                  </p>
                </div>
              </div>

              <p className="mb-6 text-champagne/70">
                A confirmation email has been sent to {user?.email}
              </p>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/my-reservations')}
                  className="flex-1"
                >
                  View My Reservations
                </Button>
                <Button onClick={() => navigate('/')} className="flex-1">
                  Back to Home
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
