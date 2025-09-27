'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

// Card product options
const cardProducts = [
  {
    id: 'smartid_nfc',
    name: 'SmartID NFC Card',
    description: 'Encrypted NFC technology with built-in eWallet for cafeteria payments',
    image: '💳',
    price: 10.00,
    features: [
      'Encrypted Technology - Cannot be duplicated', 
      'Built-in eWallet for SmartPOS', 
      'Top-up via SmartPay app or cash', 
      'Cafeteria payments & access control',
      'Durable PVC construction',
      '13.56MHz NFC technology'
    ],
    minOrder: 100,
    category: 'smartid',
    highlight: true
  }
]

// Order history
const orderHistory = [
  {
    id: 'ORD-2024-001',
    date: '2024-01-15',
    items: 'SmartID NFC Cards × 500',
    total: 5000.00,
    status: 'delivered',
    tracking: 'TRK123456789'
  },
  {
    id: 'ORD-2024-002',
    date: '2024-02-20',
    items: 'SmartID NFC Cards × 300',
    total: 3000.00,
    status: 'in_transit',
    tracking: 'TRK987654321'
  },
  {
    id: 'ORD-2024-003',
    date: '2024-03-01',
    items: 'SmartID NFC Cards × 100',
    total: 1000.00,
    status: 'processing',
    tracking: null
  }
]

const statusStyles = {
  delivered: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
  in_transit: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400'
}

export default function OrderCardsPage() {
  const [cartItems, setCartItems] = useState<{[key: string]: number}>({})
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState({
    contactName: '',
    phone: '',
    email: '',
    address: '',
    specialInstructions: '',
    urgency: 'standard'
  })

  const addToCart = (productId: string, quantity: number) => {
    if (quantity < 1) return
    const product = cardProducts.find(p => p.id === productId)
    if (product && quantity < product.minOrder) {
      toast.error(`Minimum order quantity is ${product.minOrder} cards`)
      return
    }
    
    setCartItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity
    }))
    
    toast.success('Added to cart')
  }

  const removeFromCart = (productId: string) => {
    setCartItems(prev => {
      const newCart = { ...prev }
      delete newCart[productId]
      return newCart
    })
    toast.success('Removed from cart')
  }

  const getCartTotal = () => {
    return Object.entries(cartItems).reduce((total, [productId, quantity]) => {
      const product = cardProducts.find(p => p.id === productId)
      return total + (product ? product.price * quantity : 0)
    }, 0)
  }

  const getCartItemCount = () => {
    return Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0)
  }

  const handleCheckout = () => {
    if (getCartItemCount() === 0) {
      toast.error('Your cart is empty')
      return
    }
    
    if (!deliveryInfo.contactName || !deliveryInfo.phone || !deliveryInfo.address) {
      toast.error('Please fill in all delivery information')
      return
    }

    // Simulate order placement
    setTimeout(() => {
      toast.success('Order placed successfully! You will receive a confirmation email shortly.')
      setCartItems({})
      setIsCheckoutOpen(false)
      setDeliveryInfo({
        contactName: '',
        phone: '',
        email: '',
        address: '',
        specialInstructions: '',
        urgency: 'standard'
      })
    }, 1000)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Gradient Header */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-violet-900 dark:to-purple-900 rounded-2xl p-8 border-0 shadow-lg dark:border dark:border-purple-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order SmartID NFC Cards 🛒</h1>
              <p className="text-gray-600 dark:text-purple-200/90">SMK Bukit Jelutong • Order encrypted NFC cards with eWallet functionality</p>
            </div>
            <div className="flex gap-6 mt-4 lg:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">RM 10</div>
                <div className="text-sm text-gray-500 dark:text-purple-200/70">Per Card</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">100</div>
                <div className="text-sm text-gray-500 dark:text-purple-200/70">Min Order</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="flex justify-end">
          {getCartItemCount() > 0 && (
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg relative">
                    <span className="mr-2">🛒</span>
                    Cart ({getCartItemCount()})
                    <Badge className="ml-2 bg-white/20 text-white border-0">
                      RM {getCartTotal().toFixed(2)}
                    </Badge>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Checkout - Order Summary</DialogTitle>
                    <DialogDescription>
                      Review your order and provide delivery details
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Order Items */}
                    <div>
                      <h3 className="font-semibold mb-3">Order Items</h3>
                      <div className="space-y-2">
                        {Object.entries(cartItems).map(([productId, quantity]) => {
                          const product = cardProducts.find(p => p.id === productId)
                          if (!product) return null
                          return (
                            <div key={productId} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {quantity} × RM {product.price.toFixed(2)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">RM {(product.price * quantity).toFixed(2)}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCart(productId)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center font-semibold text-lg">
                          <span>Total:</span>
                          <span>RM {getCartTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div>
                      <h3 className="font-semibold mb-3">Delivery Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactName">Contact Name *</Label>
                          <Input
                            id="contactName"
                            value={deliveryInfo.contactName}
                            onChange={(e) => setDeliveryInfo(prev => ({...prev, contactName: e.target.value}))}
                            placeholder="Full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={deliveryInfo.phone}
                            onChange={(e) => setDeliveryInfo(prev => ({...prev, phone: e.target.value}))}
                            placeholder="012-345-6789"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={deliveryInfo.email}
                            onChange={(e) => setDeliveryInfo(prev => ({...prev, email: e.target.value}))}
                            placeholder="contact@school.edu.my"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="address">Delivery Address *</Label>
                          <Textarea
                            id="address"
                            value={deliveryInfo.address}
                            onChange={(e) => setDeliveryInfo(prev => ({...prev, address: e.target.value}))}
                            placeholder="Complete school address for delivery"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="urgency">Delivery Speed</Label>
                          <Select value={deliveryInfo.urgency} onValueChange={(value) => setDeliveryInfo(prev => ({...prev, urgency: value}))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard (5-7 days) - Free</SelectItem>
                              <SelectItem value="express">Express (2-3 days) - RM 25</SelectItem>
                              <SelectItem value="urgent">Urgent (1-2 days) - RM 50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="instructions">Special Instructions</Label>
                          <Textarea
                            id="instructions"
                            value={deliveryInfo.specialInstructions}
                            onChange={(e) => setDeliveryInfo(prev => ({...prev, specialInstructions: e.target.value}))}
                            placeholder="Any special delivery instructions..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleCheckout} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600">
                        Place Order
                      </Button>
                      <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} className="flex-1">
                        Continue Shopping
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
        </div>

        {/* Product Info */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">💳</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 mb-2">SmartID NFC Card</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-4">The only card you need for your school - secure, encrypted, and feature-rich</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                  <div className="text-2xl mb-2">🔒</div>
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">Encrypted Security</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Cannot be duplicated or cloned</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                  <div className="text-2xl mb-2">💰</div>
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">Built-in eWallet</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Pay at cafeteria with SmartPOS</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                  <div className="text-2xl mb-2">📱</div>
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">Easy Top-up</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Cash or SmartPay app</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Card */}
        <div className="max-w-2xl mx-auto">
          {cardProducts.map((product) => (
            <Card key={product.id} className="bg-white border-0 shadow-xl dark:bg-slate-800 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{product.image}</div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">{product.name}</h3>
                  <p className="text-lg text-gray-600 dark:text-slate-400 mb-4">{product.description}</p>
                  
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                      RM {product.price.toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 dark:text-slate-400">per card</span>
                  </div>
                  
                  <Badge variant="outline" className="mb-4 text-sm px-3 py-1">
                    Minimum order: {product.minOrder} cards
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      <span className="text-gray-700 dark:text-slate-300 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 max-w-md mx-auto">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`quantity-${product.id}`} className="text-sm font-medium">Quantity:</Label>
                    <Input
                      type="number"
                      min={product.minOrder}
                      step={product.minOrder}
                      defaultValue={product.minOrder}
                      id={`quantity-${product.id}`}
                      className="w-24"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const input = document.getElementById(`quantity-${product.id}`) as HTMLInputElement
                      const quantity = parseInt(input.value) || product.minOrder
                      addToCart(product.id, quantity)
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex-1 sm:flex-none px-8"
                    size="lg"
                  >
                    <span className="mr-2">🛒</span>
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order History */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-slate-50 flex items-center gap-2">
              <span>📦</span>
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderHistory.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900 dark:text-slate-100">{order.id}</span>
                      <Badge className={statusStyles[order.status as keyof typeof statusStyles]}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{order.items}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-500">Ordered on {new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-slate-100">RM {order.total.toFixed(2)}</p>
                    {order.tracking && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">Track: {order.tracking}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
