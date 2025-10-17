'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  Package,
  Sparkles
} from 'lucide-react'

export function ShoppingCartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    getSubtotal,
    getDiscounts,
    getTotal,
    itemCount 
  } = useCart()

  const handleCheckout = () => {
    setIsOpen(false)
    router.push('/checkout')
  }

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      <div className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer */}
        <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">Shopping Cart</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Your cart is empty</p>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    router.push('/pricing')
                  }}
                  className="mt-4 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Browse products
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-white flex items-center gap-2">
                          {item.type === 'module' && <Package className="w-4 h-4 text-blue-400" />}
                          {item.type === 'subscription' && <Sparkles className="w-4 h-4 text-purple-400" />}
                          {item.type === 'credits' && <CreditCard className="w-4 h-4 text-yellow-400" />}
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                        )}
                        {item.interval && (
                          <p className="text-sm text-gray-500 mt-1">Billed {item.interval}ly</p>
                        )}
                        {item.credits && (
                          <p className="text-sm text-green-400 mt-1">{item.credits} credits</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                          disabled={item.type === 'subscription'}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                          disabled={item.type === 'subscription'}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">${item.price} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={clearCart}
                  className="w-full text-center text-sm text-gray-400 hover:text-red-400 transition-colors py-2"
                >
                  Clear cart
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-800 p-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">${getSubtotal().toLocaleString()}</span>
                </div>
                {getDiscounts() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Discounts</span>
                    <span className="text-green-400">-${getDiscounts().toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-700">
                  <span className="text-white">Total</span>
                  <span className="text-white">${getTotal().toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>Proceed to Checkout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}