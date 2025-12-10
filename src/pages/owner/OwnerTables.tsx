import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ownerService } from '@/services/ownerService'
import { OwnerDashboardLayout } from '@/components/owner/OwnerDashboardLayout'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { HiPlus, HiPencil, HiTrash, HiX, HiTable } from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'

export function OwnerTables() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [showTableModal, setShowTableModal] = useState(false)
  const [editingTable, setEditingTable] = useState<any>(null)

  // Form state
  const [tableNumber, setTableNumber] = useState('')
  const [capacity, setCapacity] = useState('')
  const [shape, setShape] = useState('circle')
  const [positionX, setPositionX] = useState('')
  const [positionY, setPositionY] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadRestaurants()
    }
  }, [user])

  useEffect(() => {
    if (selectedRestaurant) {
      loadTables()
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

  const loadTables = async () => {
    try {
      setLoading(true)
      const data = await ownerService.getRestaurantTables(selectedRestaurant.id)
      setTables(data)
    } catch (error) {
      console.error('Error loading tables:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTable = async () => {
    try {
      await ownerService.createTable(selectedRestaurant.id, {
        table_number: parseInt(tableNumber),
        capacity: parseInt(capacity),
        shape,
        position_x: positionX ? parseInt(positionX) : null,
        position_y: positionY ? parseInt(positionY) : null,
        is_available: isAvailable,
      })
      setShowTableModal(false)
      resetForm()
      loadTables()
    } catch (error: any) {
      alert(error.message || 'Failed to create table')
    }
  }

  const handleUpdateTable = async () => {
    try {
      await ownerService.updateTable(editingTable.id, {
        table_number: parseInt(tableNumber),
        capacity: parseInt(capacity),
        shape,
        position_x: positionX ? parseInt(positionX) : null,
        position_y: positionY ? parseInt(positionY) : null,
        is_available: isAvailable,
      })
      setShowTableModal(false)
      setEditingTable(null)
      resetForm()
      loadTables()
    } catch (error: any) {
      alert(error.message || 'Failed to update table')
    }
  }

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) {
      return
    }

    try {
      await ownerService.deleteTable(tableId)
      loadTables()
    } catch (error: any) {
      alert(error.message || 'Failed to delete table')
    }
  }

  const openEditTable = (table: any) => {
    setEditingTable(table)
    setTableNumber(table.table_number.toString())
    setCapacity(table.capacity.toString())
    setShape(table.shape)
    setPositionX(table.position_x?.toString() || '')
    setPositionY(table.position_y?.toString() || '')
    setIsAvailable(table.is_available)
    setShowTableModal(true)
  }

  const resetForm = () => {
    setTableNumber('')
    setCapacity('')
    setShape('circle')
    setPositionX('')
    setPositionY('')
    setIsAvailable(true)
  }

  const getTablesByCapacity = () => {
    const grouped: any = {
      2: [],
      4: [],
      6: [],
      8: [],
    }

    tables.forEach((table) => {
      if (table.capacity <= 2) grouped[2].push(table)
      else if (table.capacity <= 4) grouped[4].push(table)
      else if (table.capacity <= 6) grouped[6].push(table)
      else grouped[8].push(table)
    })

    return grouped
  }

  const groupedTables = getTablesByCapacity()

  return (
    <OwnerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-display text-gradient-gold">Table Management</h1>
            <p className="text-champagne/70">Manage your restaurant seating</p>
          </div>

          <div className="flex gap-3">
            {/* Restaurant Selector */}
            {restaurants.length > 1 && (
              <select
                value={selectedRestaurant?.id || ''}
                onChange={(e) => {
                  const restaurant = restaurants.find((r) => r.id === e.target.value)
                  setSelectedRestaurant(restaurant)
                }}
                className="input"
              >
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            )}

            <Button
              onClick={() => {
                resetForm()
                setEditingTable(null)
                setShowTableModal(true)
              }}
              className='flex items-center justify-center w-full h-full gap-2'
            >
              <HiPlus className="mr-2" />
              Add Table
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="card bg-primary/10 border-primary/30">
            <p className="mb-1 text-sm text-champagne/70">Total Tables</p>
            <p className="text-3xl font-bold text-champagne">{tables.length}</p>
          </div>
          <div className="card">
            <p className="mb-1 text-sm text-champagne/70">2-Seater</p>
            <p className="text-3xl font-bold text-champagne">{groupedTables[2].length}</p>
          </div>
          <div className="card">
            <p className="mb-1 text-sm text-champagne/70">4-Seater</p>
            <p className="text-3xl font-bold text-champagne">{groupedTables[4].length}</p>
          </div>
          <div className="card">
            <p className="mb-1 text-sm text-champagne/70">6-Seater</p>
            <p className="text-3xl font-bold text-champagne">{groupedTables[6].length}</p>
          </div>
          <div className="card">
            <p className="mb-1 text-sm text-champagne/70">8+ Seater</p>
            <p className="text-3xl font-bold text-champagne">{groupedTables[8].length}</p>
          </div>
        </div>

        {/* Tables List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : tables.length === 0 ? (
          <div className="py-20 text-center card">
            <div className="mb-4 text-6xl">🪑</div>
            <h3 className="mb-2 text-h3 text-champagne">No Tables Yet</h3>
            <p className="mb-6 text-champagne/70">Add tables to start accepting reservations</p>
            <Button
              onClick={() => {
                resetForm()
                setShowTableModal(true)
              }}
            >
              <HiPlus className="mr-2" />
              Add First Table
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tables.map((table) => (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="transition-all card hover:border-primary/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/20">
                      <HiTable className="text-2xl text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-champagne">
                        Table {table.table_number}
                      </h3>
                      <p className="text-sm text-champagne/70">
                        {table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditTable(table)}
                      className="p-2 transition-colors text-champagne hover:text-primary"
                    >
                      <HiPencil />
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="p-2 transition-colors text-champagne hover:text-rose-300"
                    >
                      <HiTrash />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-champagne/70">Shape</span>
                    <span className="font-semibold capitalize text-champagne">
                      {table.shape}
                    </span>
                  </div>
                  {table.position_x && table.position_y && (
                    <div className="flex justify-between">
                      <span className="text-champagne/70">Position</span>
                      <span className="font-semibold text-champagne">
                        X:{table.position_x}, Y:{table.position_y}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-champagne/70">Status</span>
                    <span
                      className={`font-semibold ${
                        table.is_available ? 'text-forest-light' : 'text-rose-300'
                      }`}
                    >
                      {table.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Table Modal */}
        <AnimatePresence>
          {showTableModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowTableModal(false)
                  setEditingTable(null)
                }}
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
                      {editingTable ? 'Edit Table' : 'Add Table'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowTableModal(false)
                        setEditingTable(null)
                      }}
                      className="transition-colors text-champagne hover:text-primary"
                    >
                      <HiX className="text-2xl" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Table Number *"
                        type="number"
                        placeholder="1"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                      />
                      <Input
                        label="Capacity *"
                        type="number"
                        placeholder="4"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-champagne">
                        Table Shape *
                      </label>
                      <div className="flex gap-2">
                        {['circle', 'square', 'rectangle'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setShape(s)}
                            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                              shape === s
                                ? 'bg-primary text-charcoal'
                                : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
                            }`}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-champagne">
                        Floor Plan Position (Optional)
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="X Position"
                          type="number"
                          placeholder="0-1000"
                          value={positionX}
                          onChange={(e) => setPositionX(e.target.value)}
                          helperText="0-1000 range"
                        />
                        <Input
                          label="Y Position"
                          type="number"
                          placeholder="0-800"
                          value={positionY}
                          onChange={(e) => setPositionY(e.target.value)}
                          helperText="0-800 range"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isAvailable"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                        className="w-5 h-5 rounded border-taupe/30 bg-charcoal-light text-primary focus:ring-primary"
                      />
                      <label htmlFor="isAvailable" className="text-champagne">
                        Table is available for reservations
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={editingTable ? handleUpdateTable : handleCreateTable}
                        className="flex-1"
                        disabled={
                          !tableNumber || !capacity || parseInt(capacity) < 1
                        }
                      >
                        {editingTable ? 'Update Table' : 'Add Table'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowTableModal(false)
                          setEditingTable(null)
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
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
