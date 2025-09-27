'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Search, Loader2, Navigation, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface LocationData {
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  latitude: number
  longitude: number
  attendanceRadius: number
}

export default function SetupLocationPage() {
  const [locationData, setLocationData] = useState<LocationData>({
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Malaysia',
    latitude: 0,
    longitude: 0,
    attendanceRadius: 300
  })
  
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const router = useRouter()

  // Basic address search (without Google Maps)
  const searchLocation = async () => {
    if (!searchQuery.trim()) return
    
    // For now, just set the search query as the address
    // In future, this could integrate with a geocoding service
    setLocationData(prev => ({
      ...prev,
      address: searchQuery
    }))
    
    toast.success('Address set! Please enter coordinates manually or use "Get Current Location".')
  }

  // Get current user location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by this browser')
      return
    }

    setSearchLoading(true)
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        setLocationData(prev => ({
          ...prev,
          latitude,
          longitude
        }))
        
        toast.success(`Current location detected!\nCoordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        setSearchLoading(false)
      },
      (error) => {
        let message = 'Failed to get current location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location permissions.'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location unavailable. Please enter coordinates manually.'
            break
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again.'
            break
        }
        toast.error(message)
        setSearchLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!locationData.latitude || !locationData.longitude) {
      toast.error('Please select a location on the map')
      return
    }

    if (!locationData.address.trim()) {
      toast.error('Please provide an address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/setup-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData)
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Failed to save location')
        return
      }

      toast.success('Institution location saved successfully!')
      router.push('/auth/welcome')
    } catch (error) {
      console.error('Location setup error:', error)
      toast.error('Failed to save location. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      searchLocation()
    }
  }

  return (
    <AuthLayout
      title="Set Your Institution Location"
      subtitle="This location will be used for attendance verification and mobile check-ins"
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="space-y-2">
          <Label htmlFor="search">Search for your institution address</Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="Enter institution name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || searchLoading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={searchLocation}
              disabled={loading || searchLoading || !searchQuery.trim()}
              className="flex items-center gap-2"
            >
              {searchLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={loading || searchLoading}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              Current
            </Button>
          </div>
        </div>

        {/* GPS Coordinates */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">GPS Coordinates</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={loading || searchLoading}
              className="flex items-center gap-2"
            >
              {searchLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Get Current Location
                </>
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={locationData.latitude || ''}
                onChange={(e) => setLocationData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                placeholder="3.1319197 (e.g. Kuala Lumpur)"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={locationData.longitude || ''}
                onChange={(e) => setLocationData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                placeholder="101.6840589"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              <strong>How to get coordinates:</strong>
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>1. Click "Get Current Location" button above (easiest)</li>
              <li>2. Search your institution on Google Maps</li>
              <li>3. Right-click on your location and select coordinates</li>
              <li>4. Copy the latitude and longitude numbers</li>
            </ul>
          </div>
        </div>

        {/* Location Details Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Full Address</Label>
            <Input
              id="address"
              value={locationData.address}
              onChange={(e) => setLocationData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Institution address will appear here..."
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={locationData.city}
                onChange={(e) => setLocationData(prev => ({ ...prev, city: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={locationData.state}
                onChange={(e) => setLocationData(prev => ({ ...prev, state: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={locationData.postalCode}
                onChange={(e) => setLocationData(prev => ({ ...prev, postalCode: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendanceRadius">Radius (m)</Label>
              <Input
                id="attendanceRadius"
                type="number"
                min="50"
                max="5000"
                value={locationData.attendanceRadius}
                onChange={(e) => setLocationData(prev => ({ ...prev, attendanceRadius: parseInt(e.target.value) || 300 }))}
                disabled={loading}
              />
            </div>
          </div>

          {/* Coordinates Display */}
          {locationData.latitude && locationData.longitude && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-900 dark:text-green-100">Location Set</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Coordinates: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Attendance radius: {locationData.attendanceRadius}m
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={loading || !locationData.latitude || !locationData.longitude}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Location...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Save Institution Location
              </>
            )}
          </Button>
        </form>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Why this matters:</strong> This location will be used to automatically approve mobile check-ins 
            within the specified radius and require manual approval for remote check-ins.
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
