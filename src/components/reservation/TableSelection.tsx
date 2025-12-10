import { motion } from 'framer-motion'
import { RestaurantTable } from '@/types/database.types'

interface TableSelectionProps {
  tables: Array<RestaurantTable & { isOccupied?: boolean; nextAvailableTime?: string | null }>
  selectedTableId: string | null
  onSelectTable: (tableId: string) => void
  numberOfPeople: number
}

export function TableSelection({
  tables,
  selectedTableId,
  onSelectTable,
  numberOfPeople,
}: TableSelectionProps) {
  const getTableColor = (table: RestaurantTable & { isOccupied?: boolean }) => {
    if (table.isOccupied) return 'bg-taupe/50 cursor-not-allowed'
    if (selectedTableId === table.id) return 'bg-primary shadow-gold-glow'
    if (table.capacity < numberOfPeople) return 'bg-charcoal-light/50 cursor-not-allowed'
    return 'bg-charcoal-light hover:bg-primary/20 cursor-pointer'
  }

  const getTableSize = (capacity: number) => {
    if (capacity <= 2) return 'w-20 h-20'
    if (capacity <= 4) return 'w-24 h-24'
    if (capacity <= 6) return 'w-28 h-28'
    return 'w-32 h-32'
  }

  const getTableShape = (shape: string) => {
    switch (shape) {
      case 'circle':
        return 'rounded-full'
      case 'square':
        return 'rounded-lg'
      case 'rectangle':
        return 'rounded-2xl'
      default:
        return 'rounded-full'
    }
  }

  const canSelectTable = (table: RestaurantTable & { isOccupied?: boolean }) => {
    return !table.isOccupied && table.capacity >= numberOfPeople
  }

  return (
    <div className="card">
      <h3 className="mb-6 text-h3 text-champagne">Select Your Table</h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border rounded-full bg-charcoal-light border-primary"></div>
          <span className="text-champagne/70">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary"></div>
          <span className="text-champagne/70">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-taupe/50"></div>
          <span className="text-champagne/70">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-charcoal-light/50"></div>
          <span className="text-champagne/70">Too Small</span>
        </div>
      </div>

      {/* Table Layout */}
      <div className="relative min-h-[400px] bg-gradient-to-b from-charcoal to-charcoal-light rounded-luxury p-8 border border-taupe/30">
        <div className="grid grid-cols-3 gap-8 md:grid-cols-5 place-items-center">
          {tables.map((table) => (
            <div key={table.id} className="relative group">
              <motion.div
                whileHover={canSelectTable(table) ? { scale: 1.1 } : {}}
                whileTap={canSelectTable(table) ? { scale: 0.95 } : {}}
                onClick={() => canSelectTable(table) && onSelectTable(table.id)}
                className={`
                  ${getTableSize(table.capacity)}
                  ${getTableShape(table.shape)}
                  ${getTableColor(table)}
                  flex flex-col items-center justify-center
                  transition-all duration-300
                  border-2
                  ${selectedTableId === table.id ? 'border-primary' : 'border-taupe/30'}
                `}
              >
                <span
                  className={`font-bold text-lg ${
                    table.isOccupied
                      ? 'text-champagne/30'
                      : selectedTableId === table.id
                      ? 'text-charcoal'
                      : 'text-champagne'
                  }`}
                >
                  {table.table_number}
                </span>
                <span
                  className={`text-xs ${
                    table.isOccupied
                      ? 'text-champagne/30'
                      : selectedTableId === table.id
                      ? 'text-charcoal'
                      : 'text-champagne/70'
                  }`}
                >
                  {table.capacity}p
                </span>
              </motion.div>

              {/* Tooltip for occupied tables */}
              {table.isOccupied && table.nextAvailableTime && (
                <div className="absolute z-10 mb-2 transition-opacity -translate-x-1/2 opacity-0 pointer-events-none bottom-full left-1/2 group-hover:opacity-100">
                  <div className="px-3 py-2 border rounded-lg bg-charcoal border-primary/30 whitespace-nowrap shadow-luxury">
                    <p className="text-xs font-semibold text-champagne">Occupied</p>
                    <p className="text-xs text-champagne/70">
                      Available at {table.nextAvailableTime}
                    </p>
                  </div>
                  <div className="w-2 h-2 mx-auto -mt-1 rotate-45 border-b border-r bg-charcoal border-primary/30"></div>
                </div>
              )}

              {/* Tooltip for too small tables */}
              {!table.isOccupied && table.capacity < numberOfPeople && (
                <div className="absolute z-10 mb-2 transition-opacity -translate-x-1/2 opacity-0 pointer-events-none bottom-full left-1/2 group-hover:opacity-100">
                  <div className="px-3 py-2 border rounded-lg bg-charcoal border-taupe/30 whitespace-nowrap shadow-luxury">
                    <p className="text-xs text-champagne/70">
                      Too small (seats {table.capacity})
                    </p>
                  </div>
                  <div className="w-2 h-2 mx-auto -mt-1 rotate-45 border-b border-r bg-charcoal border-taupe/30"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {tables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-champagne/50">No tables available</p>
          </div>
        )}
      </div>

      {/* Selected Table Info */}
      {selectedTableId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mt-6 border bg-primary/10 border-primary/30 rounded-luxury"
        >
          {(() => {
            const selected = tables.find((t) => t.id === selectedTableId)
            return selected ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-champagne">
                    Table {selected.table_number}
                  </p>
                  <p className="text-sm text-champagne/70">
                    Capacity: {selected.capacity} people
                  </p>
                </div>
                <div className="text-2xl text-primary">✓</div>
              </div>
            ) : null
          })()}
        </motion.div>
      )}
    </div>
  )
}
