import { RestaurantTable } from './RestaurantTable'
import { RestaurantTable as RestaurantTableType } from '@/types/database.types'

interface FloorPlanViewProps {
  tables: Array<RestaurantTableType & { isOccupied?: boolean; nextAvailableTime?: string | null }>
  selectedTableId: string | null
  onSelectTable: (tableId: string) => void
  numberOfPeople: number
  restaurantName: string
}

export function FloorPlanView({
  tables,
  selectedTableId,
  onSelectTable,
  numberOfPeople,
  restaurantName,
}: FloorPlanViewProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-h3 text-champagne">Restaurant Floor Plan</h3>
          <p className="mt-1 text-sm text-champagne/70">
            Select your preferred table ({numberOfPeople} guests)
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 mb-6 text-sm rounded-lg bg-charcoal-light">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border rounded bg-charcoal-light border-champagne/30"></div>
          <span className="text-champagne/70">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border rounded bg-primary border-primary"></div>
          <span className="text-champagne/70">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border rounded bg-rose-900/40 border-rose-700/50"></div>
          <span className="text-champagne/70">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border rounded bg-charcoal-light/30 border-taupe/30"></div>
          <span className="text-champagne/70">Too Small</span>
        </div>
      </div>

      {/* Blueprint Floor Plan */}
      <div className="relative overflow-hidden border-2 bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal rounded-luxury border-taupe/30">
        {/* Blueprint grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(209, 170, 108, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(209, 170, 108, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Restaurant name watermark */}
        <div className="absolute font-serif text-4xl font-bold pointer-events-none top-4 left-4 text-champagne/10">
          {restaurantName}
        </div>

        {/* Floor plan container */}
        <div className="relative" style={{ width: '100%', height: '700px', padding: '40px' }}>
          {/* Entrance marker */}
          <div className="absolute -translate-x-1/2 bottom-10 left-1/2">
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-2 rounded-full bg-primary/30"></div>
              <span className="text-xs font-semibold tracking-wider text-champagne/50">ENTRANCE</span>
            </div>
          </div>

          {/* Tables positioned absolutely */}
          {tables.map((table) => {
            if (!table.position_x || !table.position_y) return null

            const isSelected = selectedTableId === table.id
            const isTooSmall = table.capacity < numberOfPeople

            return (
              <div
                key={table.id}
                className="absolute"
                style={{
                  left: `${(table.position_x / 1000) * 100}%`,
                  top: `${(table.position_y / 800) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <RestaurantTable
                  tableNumber={table.table_number}
                  capacity={table.capacity}
                  shape={table.shape}
                  isOccupied={!!table.isOccupied}
                  isSelected={isSelected}
                  isTooSmall={isTooSmall}
                  nextAvailableTime={table.nextAvailableTime}
                  onClick={() => onSelectTable(table.id)}
                />
              </div>
            )
          })}

          {/* No positioned tables message */}
          {tables.filter((t) => t.position_x && t.position_y).length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="mb-2 text-champagne/50">No floor plan available</p>
                <p className="text-sm text-champagne/30">Tables are not positioned yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Scale indicator */}
        <div className="absolute flex items-center gap-2 text-xs bottom-4 right-4 text-champagne/30">
          <div className="w-12 h-0.5 bg-champagne/30"></div>
          <span>5m</span>
        </div>
      </div>

      {/* Selected Table Info */}
      {selectedTableId && (
        <div className="p-4 mt-6 border bg-gradient-to-r from-primary/10 to-transparent border-primary/30 rounded-luxury">
          {(() => {
            const selected = tables.find((t) => t.id === selectedTableId)
            return selected ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-champagne">
                    Table {selected.table_number} Selected
                  </p>
                  <p className="text-sm text-champagne/70">
                    {selected.capacity} seats • {selected.shape} table
                  </p>
                </div>
                <div className="text-3xl text-primary">✓</div>
              </div>
            ) : null
          })()}
        </div>
      )}
    </div>
  )
}
