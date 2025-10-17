'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { MODULES, SUBSCRIPTION_TIERS, CREDIT_PACKAGES } from '@/lib/pricing/unified-pricing'
import { logger } from '@/lib/client-logger'

export type CartItemType = 'module' | 'subscription' | 'credits'

export interface CartItem {
  id: string
  type: CartItemType
  name: string
  price: number
  quantity: number
  interval?: 'month' | 'year'
  description?: string
  credits?: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getDiscounts: () => number
  getTotal: () => number
  itemCount: number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('vibelux_cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        logger.error('system', 'Error loading cart:', error )
      }
    }
    setIsLoading(false)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('vibelux_cart', JSON.stringify(items))
    }
  }, [items, isLoading])

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      // Check if item already exists
      const existingIndex = prev.findIndex(item => item.id === newItem.id)
      
      if (existingIndex > -1) {
        // Update quantity if item exists
        const updated = [...prev]
        updated[existingIndex].quantity += 1
        return updated
      }
      
      // Add new item
      return [...prev, { ...newItem, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ))
  }

  const clearCart = () => {
    setItems([])
  }

  const getSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getDiscounts = () => {
    // Calculate bundle discounts
    let discount = 0
    
    // Check for module bundles
    const moduleItems = items.filter(item => item.type === 'module')
    if (moduleItems.length >= 3) {
      discount += getSubtotal() * 0.1 // 10% discount for 3+ modules
    }
    
    // Check for annual subscription discount
    const subscriptionItems = items.filter(item => 
      item.type === 'subscription' && item.interval === 'year'
    )
    subscriptionItems.forEach(item => {
      const monthlyPrice = SUBSCRIPTION_TIERS[item.id]?.price || 0
      const yearlyDiscount = (monthlyPrice * 12) - item.price
      discount += yearlyDiscount * item.quantity
    })
    
    return discount
  }

  const getTotal = () => {
    return getSubtotal() - getDiscounts()
  }

  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getSubtotal,
      getDiscounts,
      getTotal,
      itemCount,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}