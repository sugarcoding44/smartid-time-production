'use client'

import React, { useState, useEffect } from 'react'
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
import { HeaderSkeleton, ProductCardSkeleton, OrderHistorySkeleton } from '@/components/ui/loading-skeletons'
import { Loader2, ShoppingCart, Package, Check, Clock, Truck, CreditCard, Shield, Smartphone, CheckCircle, XCircle } from 'lucide-react'

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

// Types
type OrderItem = {
  name: string
  quantity: number
  price: number
}

type Order = {
  id: string
  order_number: string
  contact_name: string
  items: OrderItem[]
  total_amount: number
  status: string
  tracking_number?: string | null
  ordered_at: string
  created_at: string
}

const statusStyles = {
  delivered: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
  in_transit: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400'
}

export default function OrderCardsPage() {
  const [cartItems, setCartItems] = useState<{[key: string]: number}>({})
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [orderHistory, setOrderHistory] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState({
    contactName: '',
    phone: '',
    email: '',
    address: '',
    specialInstructions: '',
    urgency: 'standard'
  })

  // Fetch order history
  useEffect(() => {
    fetchOrderHistory()
  }, [])

  const fetchOrderHistory = async () => {
    try {
      setIsLoadingOrders(true)
      const response = await fetch('/api/card-orders')
      const data = await response.json()
      
      if (data.success) {
        setOrderHistory(data.data)
      } else {
        toast.error('Failed to load order history')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load order history')
    } finally {
      setIsLoadingOrders(false)
    }
  }

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

  const handleCheckout = async () => {
    if (getCartItemCount() === 0) {
      toast.error('Your cart is empty')
      return
    }
    
    if (!deliveryInfo.contactName || !deliveryInfo.phone || !deliveryInfo.address) {
      toast.error('Please fill in all delivery information')
      return
    }

    try {
      setIsPlacingOrder(true)
      
      // Convert cart items to order items
      const items = Object.entries(cartItems).map(([productId, quantity]) => {
        const product = cardProducts.find(p => p.id === productId)
        return {
          name: product?.name || 'SmartID NFC Card',
          quantity,
          price: product?.price || 10.00
        }
      })
      
      // Calculate delivery fee based on urgency
      const deliveryFee = deliveryInfo.urgency === 'urgent' ? 50 : 
                          deliveryInfo.urgency === 'express' ? 25 : 0
      
      const orderData = {
        contact_name: deliveryInfo.contactName,
        phone: deliveryInfo.phone,
        email: deliveryInfo.email,
        address: deliveryInfo.address,
        items,
        total_amount: getCartTotal() + deliveryFee,
        delivery_fee: deliveryFee,
        urgency: deliveryInfo.urgency,
        special_instructions: deliveryInfo.specialInstructions
      }
      
      const response = await fetch('/api/card-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })
      
      const result = await response.json()
      
      if (result.success) {
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
        // Refresh order history
        fetchOrderHistory()
      } else {
        toast.error(result.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Order placement error:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Gradient Header */}
        <div className="rounded-2xl p-8 border-0 shadow-lg header-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Order SmartID Cards 🛒</h1>
              <p className="opacity-90">SMK Bukit Jelutong • Professional NFC cards with secure eWallet functionality</p>
            </div>
            <div className="flex gap-6 mt-4 lg:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold">RM 10.00</div>
                <div className="text-sm opacity-70">per card</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">100+</div>
                <div className="text-sm opacity-70">min order</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Section */}
        {getCartItemCount() > 0 && (
          <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {getCartItemCount()} item{getCartItemCount() > 1 ? 's' : ''} in cart
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Total: RM {getCartTotal().toFixed(2)}
                  </div>
                </div>
              </div>
              
              <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Checkout
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
                      <Button 
                        onClick={handleCheckout} 
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
                        disabled={isPlacingOrder}
                      >
                        {isPlacingOrder ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Placing Order...
                          </>
                        ) : (
                          'Place Order'
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} className="flex-1">
                        Continue Shopping
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* Product Features */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Secure & Encrypted</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Cannot be duplicated</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Built-in eWallet</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Cafeteria payments</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Easy Top-up</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Cash or mobile app</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          {cardProducts.map((product) => (
            <div key={product.id} className="mb-6 last:mb-0">
              {/* Product Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    RM {product.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">per card</div>
                </div>
              </div>
              
              {/* Compact Features */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Check className="w-3 h-3 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* Order Form */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label htmlFor={`quantity-${product.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Quantity (min {product.minOrder})
                  </Label>
                  <Input
                    type="number"
                    min={product.minOrder}
                    step={product.minOrder}
                    defaultValue={product.minOrder}
                    id={`quantity-${product.id}`}
                    className="h-10"
                  />
                </div>
                <Button
                  onClick={() => {
                    const input = document.getElementById(`quantity-${product.id}`) as HTMLInputElement
                    const quantity = parseInt(input.value) || product.minOrder
                    addToCart(product.id, quantity)
                  }}
                  className="h-10 bg-indigo-600 hover:bg-indigo-700"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Order History */}
        {isLoadingOrders ? (
          <OrderHistorySkeleton rows={5} />
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order History</h2>
            <div className="space-y-3">
              {orderHistory.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    order.status === 'In Transit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    #{order.id}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.quantity} cards • {order.date}
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded inline-block ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      order.status === 'In Transit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                  RM {order.amount}
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
