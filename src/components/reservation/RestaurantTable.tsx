import { motion } from 'framer-motion'

interface RestaurantTableProps {
  tableNumber: number
  capacity: number
  shape: string
  isOccupied: boolean
  isSelected: boolean
  isTooSmall: boolean
  nextAvailableTime?: string | null
  onClick: () => void
}

export function RestaurantTable({
  tableNumber,
  capacity,
  shape,
  isOccupied,
  isSelected,
  isTooSmall,
  nextAvailableTime,
  onClick,
}: RestaurantTableProps) {
  const canSelect = !isOccupied && !isTooSmall

  // Table colors
  const getTableColor = () => {
    if (isOccupied) return 'bg-rose-900/40 border-rose-700/50'
    if (isSelected) return 'bg-primary border-primary shadow-gold-glow'
    if (isTooSmall) return 'bg-charcoal-light/30 border-taupe/30'
    return 'bg-charcoal-light border-champagne/30 hover:border-primary/50'
  }

  // Chair color
  const getChairColor = () => {
    if (isOccupied) return 'bg-rose-900/60 border-rose-700/50'
    if (isSelected) return 'bg-primary/80 border-primary'
    if (isTooSmall) return 'bg-charcoal/50 border-taupe/30'
    return 'bg-taupe/40 border-champagne/30'
  }

  // Render 2-person table (circle with 2 chairs)
  const render2PersonTable = () => (
    <div className="relative" style={{ width: '80px', height: '80px' }}>
      {/* Top chair */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-0 w-6 h-5 rounded ${getChairColor()} border transition-all`}
      />
      
      {/* Table */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full ${getTableColor()} border-2 transition-all flex items-center justify-center`}
      >
        <span className={`font-bold text-sm ${isSelected ? 'text-charcoal' : isOccupied ? 'text-rose-300/50' : 'text-champagne'}`}>
          {tableNumber}
        </span>
      </div>
      
      {/* Bottom chair */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 bottom-0 w-6 h-5 rounded ${getChairColor()} border transition-all`}
      />
    </div>
  )

  // Render 4-person table (square with 4 chairs)
  const render4PersonTable = () => (
    <div className="relative" style={{ width: '100px', height: '100px' }}>
      {/* Top chair */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-0 w-6 h-5 rounded ${getChairColor()} border transition-all`}
      />
      
      {/* Right chair */}
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-5 h-6 rounded ${getChairColor()} border transition-all`}
      />
      
      {/* Table */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-lg ${getTableColor()} border-2 transition-all flex items-center justify-center`}
      >
        <span className={`font-bold ${isSelected ? 'text-charcoal' : isOccupied ? 'text-rose-300/50' : 'text-champagne'}`}>
          {tableNumber}
        </span>
      </div>
      
      {/* Bottom chair */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 bottom-0 w-6 h-5 rounded ${getChairColor()} border transition-all`}
      />
      
      {/* Left chair */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-6 rounded ${getChairColor()} border transition-all`}
      />
    </div>
  )

  // Render 6-person table (rectangle with 6 chairs)
  const render6PersonTable = () => (
    <div className="relative" style={{ width: '140px', height: '100px' }}>
      {/* Top chairs */}
      <div className={`absolute left-[25%] -translate-x-1/2 top-0 w-6 h-5 rounded ${getChairColor()} border transition-all`} />
      <div className={`absolute left-[75%] -translate-x-1/2 top-0 w-6 h-5 rounded ${getChairColor()} border transition-all`} />
      
      {/* Right chair */}
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-5 h-6 rounded ${getChairColor()} border transition-all`}
      />
      
      {/* Table */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-16 rounded-xl ${getTableColor()} border-2 transition-all flex items-center justify-center`}
      >
        <span className={`font-bold ${isSelected ? 'text-charcoal' : isOccupied ? 'text-rose-300/50' : 'text-champagne'}`}>
          {tableNumber}
        </span>
      </div>
      
      {/* Bottom chairs */}
      <div className={`absolute left-[25%] -translate-x-1/2 bottom-0 w-6 h-5 rounded ${getChairColor()} border transition-all`} />
      <div className={`absolute left-[75%] -translate-x-1/2 bottom-0 w-6 h-5 rounded ${getChairColor()} border transition-all`} />
      
      {/* Left chair */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-6 rounded ${getChairColor()} border transition-all`}
      />
    </div>
  )

  // Render 8-person table (large rectangle with 8 chairs)
  const render8PersonTable = () => (
    <div className="relative" style={{ width: '180px', height: '120px' }}>
      {/* Top chairs */}
      <div className={`absolute left-[20%] -translate-x-1/2 top-0 w-6 h-5 rounded ${getChairColor()} border transition-all`} />
      <div className={`absolute left-[50%] -translate-x-1/2 top-0 w-6 h-5 rounded ${getChairColor()} border transition-all`} />
      <div className={`absolute left-[80%] -translate-x-1/2 top-0 w-6 h-5 rounded ${getChairColor()} border transition-all`} />
      
      {/* Right chairs */}
      <div className={`absolute right-0 top-[33%] -translate-y-1/2 w-5 h-6 rounded ${getChairColor()} border transition-all`} />
      <div className={`absolute right-0 top-[67%] -translate-y-1/2 w-5 h-6 rounded ${getChairColor()} border transition-all`} />
      
      {/* Table */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-20 rounded-xl ${getTableColor()} border-2 transition-all flex items-center justify-center`}
      >
        <span className={`font-bold text-lg ${isSelected ? 'text-charcoal' : isOccupied ? 'text-rose-300/50' : 'text-champagne'}`}>
          {tableNumber}
        </span>
      </div>
      
      {/* Bottom chairs */}
      <div className={`absolute left-[20%] -translate-x-1/2 bottom-0 w-6 h-5 rounded ${getChairColor()} border transition-all`} />
      <div className={`absolute left-[50%] -translate-x-1/2 bottom-0 w-6 h-5 rounded ${getChairColor()} border transition-all`} />
      <div className={`absolute left-[80%] -translate-x-1/2 bottom-0 w-6 h-5 rounded ${getChairColor()} border transition-all`} />
      
      {/* Left chairs */}
      <div className={`absolute left-0 top-[33%] -translate-y-1/2 w-5 h-6 rounded ${getChairColor()} border transition-all`} />
      <div className={`absolute left-0 top-[67%] -translate-y-1/2 w-5 h-6 rounded ${getChairColor()} border transition-all`} />
    </div>
  )

  const renderTable = () => {
    if (capacity <= 2) return render2PersonTable()
    if (capacity <= 4) return render4PersonTable()
    if (capacity <= 6) return render6PersonTable()
    return render8PersonTable()
  }

  return (
    <div className="relative inline-block group">
      <motion.div
        whileHover={canSelect ? { scale: 1.05 } : {}}
        whileTap={canSelect ? { scale: 0.98 } : {}}
        onClick={canSelect ? onClick : undefined}
        className={`${canSelect ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      >
        {renderTable()}
      </motion.div>

      {/* Tooltip */}
      <div className="absolute z-50 transition-opacity -translate-x-1/2 opacity-0 pointer-events-none -top-16 left-1/2 group-hover:opacity-100">
        <div className="px-3 py-2 border rounded-lg bg-charcoal border-primary/30 whitespace-nowrap shadow-luxury">
          <p className="text-xs font-semibold text-champagne">
            Table {tableNumber} ({capacity} seats)
          </p>
          {isOccupied && nextAvailableTime && (
            <p className="text-xs text-rose-300">Available at {nextAvailableTime}</p>
          )}
          {isTooSmall && <p className="text-xs text-taupe">Too small for your group</p>}
          {!isOccupied && !isTooSmall && (
            <p className="text-xs text-forest-light">Click to select</p>
          )}
        </div>
        <div className="w-2 h-2 mx-auto -mt-1 rotate-45 border-b border-r bg-charcoal border-primary/30"></div>
      </div>
    </div>
  )
}
