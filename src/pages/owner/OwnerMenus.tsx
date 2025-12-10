import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ownerService } from '@/services/ownerService'
import { OwnerDashboardLayout } from '@/components/owner/OwnerDashboardLayout'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiMenu as HiMenuIcon,
  HiX,
} from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'

export function OwnerMenus() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)
  const [menus, setMenus] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState<any>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [selectedMenuForItem, setSelectedMenuForItem] = useState<any>(null)

  // Form state
  const [menuName, setMenuName] = useState('')
  const [menuDescription, setMenuDescription] = useState('')
  const [itemName, setItemName] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemDietaryTags, setItemDietaryTags] = useState<string[]>([])
  const [itemAllergens, setItemAllergens] = useState<string[]>([])

  useEffect(() => {
    if (user?.id) {
      loadRestaurants()
    }
  }, [user])

  useEffect(() => {
    if (selectedRestaurant) {
      loadMenus()
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

  const loadMenus = async () => {
    try {
      setLoading(true)
      const data = await ownerService.getRestaurantMenus(selectedRestaurant.id)
      setMenus(data)
    } catch (error) {
      console.error('Error loading menus:', error)
    } finally {
      setLoading(false)
    }
  }

  // Menu CRUD
  const handleCreateMenu = async () => {
    try {
      await ownerService.createMenu(selectedRestaurant.id, {
        name: menuName,
        description: menuDescription,
        is_active: true,
      })
      setShowMenuModal(false)
      resetMenuForm()
      loadMenus()
    } catch (error: any) {
      alert(error.message || 'Failed to create menu')
    }
  }

  const handleUpdateMenu = async () => {
    try {
      await ownerService.updateMenu(editingMenu.id, {
        name: menuName,
        description: menuDescription,
      })
      setShowMenuModal(false)
      setEditingMenu(null)
      resetMenuForm()
      loadMenus()
    } catch (error: any) {
      alert(error.message || 'Failed to update menu')
    }
  }

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm('Are you sure you want to delete this menu? All items will be removed.')) {
      return
    }

    try {
      await ownerService.deleteMenu(menuId)
      loadMenus()
    } catch (error: any) {
      alert(error.message || 'Failed to delete menu')
    }
  }

  // Item CRUD
  const handleCreateItem = async () => {
    try {
      await ownerService.createMenuItem(selectedMenuForItem.id, {
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice),
        dietary_tags: itemDietaryTags.length > 0 ? itemDietaryTags : null,
        allergens: itemAllergens.length > 0 ? itemAllergens : null,
      })
      setShowItemModal(false)
      resetItemForm()
      loadMenus()
    } catch (error: any) {
      alert(error.message || 'Failed to create item')
    }
  }

  const handleUpdateItem = async () => {
    try {
      await ownerService.updateMenuItem(editingItem.id, {
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice),
        dietary_tags: itemDietaryTags.length > 0 ? itemDietaryTags : null,
        allergens: itemAllergens.length > 0 ? itemAllergens : null,
      })
      setShowItemModal(false)
      setEditingItem(null)
      resetItemForm()
      loadMenus()
    } catch (error: any) {
      alert(error.message || 'Failed to update item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      await ownerService.deleteMenuItem(itemId)
      loadMenus()
    } catch (error: any) {
      alert(error.message || 'Failed to delete item')
    }
  }

  const openEditMenu = (menu: any) => {
    setEditingMenu(menu)
    setMenuName(menu.name)
    setMenuDescription(menu.description || '')
    setShowMenuModal(true)
  }

  const openEditItem = (item: any) => {
    setEditingItem(item)
    setItemName(item.name)
    setItemDescription(item.description)
    setItemPrice(item.price.toString())
    setItemDietaryTags(item.dietary_tags || [])
    setItemAllergens(item.allergens || [])
    setShowItemModal(true)
  }

  const openCreateItem = (menu: any) => {
    setSelectedMenuForItem(menu)
    setShowItemModal(true)
  }

  const resetMenuForm = () => {
    setMenuName('')
    setMenuDescription('')
  }

  const resetItemForm = () => {
    setItemName('')
    setItemDescription('')
    setItemPrice('')
    setItemDietaryTags([])
    setItemAllergens([])
    setSelectedMenuForItem(null)
  }

  const toggleDietaryTag = (tag: string) => {
    setItemDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const toggleAllergen = (allergen: string) => {
    setItemAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    )
  }

  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free']
  const allergenOptions = ['gluten', 'dairy', 'eggs', 'nuts', 'shellfish', 'fish', 'soy', 'sesame']

  return (
    <OwnerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-display text-gradient-gold">Menu Management</h1>
            <p className="text-champagne/70">Create and manage your restaurant menus</p>
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
                resetMenuForm()
                setEditingMenu(null)
                setShowMenuModal(true)
              }}
              className='flex items-center justify-center w-full h-full gap-2'
            >
              <HiPlus className="mr-2" />
              New Menu
            </Button>
          </div>
        </div>

        {/* Menus List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : menus.length === 0 ? (
          <div className="py-20 text-center card">
            <div className="mb-4 text-6xl">🍽️</div>
            <h3 className="mb-2 text-h3 text-champagne">No Menus Yet</h3>
            <p className="mb-6 text-champagne/70">Create your first menu to get started</p>
            <Button
              onClick={() => {
                resetMenuForm()
                setShowMenuModal(true)
              }}
            >
              <HiPlus className="mr-2" />
              Create Menu
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {menus.map((menu) => (
              <div key={menu.id} className="card">
                {/* Menu Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <HiMenuIcon className="text-2xl text-primary" />
                      <h2 className="text-h2 text-champagne">{menu.name}</h2>
                    </div>
                    {menu.description && (
                      <p className="text-champagne/70">{menu.description}</p>
                    )}
                    <p className="mt-2 text-sm text-champagne/50">
                      {menu.menu_items?.length || 0} items
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditMenu(menu)}
                      className="p-2 transition-colors text-champagne hover:text-primary"
                    >
                      <HiPencil className="text-xl" />
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(menu.id)}
                      className="p-2 transition-colors text-champagne hover:text-rose-300"
                    >
                      <HiTrash className="text-xl" />
                    </button>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-4">
                  {menu.menu_items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 p-4 transition-all rounded-lg bg-charcoal-light hover:border hover:border-primary/30"
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
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-primary whitespace-nowrap">
                          ${item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => openEditItem(item)}
                          className="p-2 transition-colors text-champagne hover:text-primary"
                        >
                          <HiPencil />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 transition-colors text-champagne hover:text-rose-300"
                        >
                          <HiTrash />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Item Button */}
                  <Button
                    variant="outline"
                    onClick={() => openCreateItem(menu)}
                    className="flex items-center justify-center w-full h-full gap-2"
                  >
                    <HiPlus className="mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Menu Modal */}
        <AnimatePresence>
          {showMenuModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowMenuModal(false)
                  setEditingMenu(null)
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
                      {editingMenu ? 'Edit Menu' : 'Create Menu'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowMenuModal(false)
                        setEditingMenu(null)
                      }}
                      className="transition-colors text-champagne hover:text-primary"
                    >
                      <HiX className="text-2xl" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <Input
                      label="Menu Name *"
                      placeholder="e.g., Lunch Menu, Dinner Specials"
                      value={menuName}
                      onChange={(e) => setMenuName(e.target.value)}
                    />

                    <div>
                      <label className="block mb-2 text-sm font-medium text-champagne">
                        Description
                      </label>
                      <textarea
                        value={menuDescription}
                        onChange={(e) => setMenuDescription(e.target.value)}
                        placeholder="Brief description of this menu"
                        className="w-full h-24 resize-none input"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={editingMenu ? handleUpdateMenu : handleCreateMenu}
                        className="flex-1"
                        disabled={!menuName.trim()}
                      >
                        {editingMenu ? 'Update Menu' : 'Create Menu'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowMenuModal(false)
                          setEditingMenu(null)
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

        {/* Item Modal */}
        <AnimatePresence>
          {showItemModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowItemModal(false)
                  setEditingItem(null)
                  resetItemForm()
                }}
                className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-sm"
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="w-full max-w-2xl my-8 card"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-h2 text-gradient-gold">
                      {editingItem ? 'Edit Item' : 'Add Item'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowItemModal(false)
                        setEditingItem(null)
                        resetItemForm()
                      }}
                      className="transition-colors text-champagne hover:text-primary"
                    >
                      <HiX className="text-2xl" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <Input
                      label="Item Name *"
                      placeholder="e.g., Grilled Salmon"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                    />

                    <div>
                      <label className="block mb-2 text-sm font-medium text-champagne">
                        Description *
                      </label>
                      <textarea
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                        placeholder="Describe the dish"
                        className="w-full h-24 resize-none input"
                      />
                    </div>

                    <Input
                      label="Price *"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                    />

                    {/* Dietary Tags */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-champagne">
                        Dietary Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {dietaryOptions.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleDietaryTag(tag)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              itemDietaryTags.includes(tag)
                                ? 'bg-forest text-forest-light'
                                : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Allergens */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-champagne">
                        Allergens
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {allergenOptions.map((allergen) => (
                          <button
                            key={allergen}
                            type="button"
                            onClick={() => toggleAllergen(allergen)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              itemAllergens.includes(allergen)
                                ? 'bg-rose-900 text-rose-300'
                                : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
                            }`}
                          >
                            {allergen}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={editingItem ? handleUpdateItem : handleCreateItem}
                        className="flex-1"
                        disabled={
                          !itemName.trim() ||
                          !itemDescription.trim() ||
                          !itemPrice ||
                          parseFloat(itemPrice) <= 0
                        }
                      >
                        {editingItem ? 'Update Item' : 'Add Item'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowItemModal(false)
                          setEditingItem(null)
                          resetItemForm()
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
