'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { MapPin, Search, Loader2, Navigation, CheckCircle, Map as MapIcon } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
}

// Default center (Kuala Lumpur, Malaysia)
const defaultCenter = {
  lat: 3.1319197,
  lng: 101.6840589
}

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
  
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.LatLng | null>(null)
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  // Removed currentUser state - not needed since middleware handles auth
  const router = useRouter()
  const supabase = createClient()
  
  // Store URL tokens before cleaning URL
  const [authTokens] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      
      console.log('🔍 Current URL for token extraction:')
      console.log('  - Search:', window.location.search)
      console.log('  - Hash:', window.location.hash)
      
      const tokens = {
        accessToken: urlParams.get('access_token') || hashParams.get('access_token'),
        refreshToken: urlParams.get('refresh_token') || hashParams.get('refresh_token')
      }
      
      console.log('🔍 Extracted tokens:', {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        accessTokenPreview: tokens.accessToken ? tokens.accessToken.substring(0, 20) + '...' : 'none'
      })
      
      return tokens
    }
    return { accessToken: null, refreshToken: null }
  })

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const hasValidApiKey = apiKey && apiKey !== 'your_api_key_here'

  // Clean up URL tokens on load to remove them from address bar
  useEffect(() => {
    if (typeof window !== 'undefined' && (authTokens.accessToken || authTokens.refreshToken)) {
      console.log('🧺 Cleaning URL tokens from address bar (tokens stored)')
      // Clean URL now that we have stored the tokens
      window.history.replaceState({}, '', '/setup-location')
    }
  }, [])

  // Debounce search for autocomplete
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (locationData.address.trim() && locationData.address.length > 2) {
        searchSuggestions(locationData.address)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [locationData.address])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Search for autocomplete suggestions
  const searchSuggestions = async (query: string) => {
    if (!hasValidApiKey || query.length < 3) return

    try {
      const response = await fetch(`https://places.googleapis.com/v1/places:searchText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey!,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.addressComponents'
        },
        body: JSON.stringify({
          textQuery: query,
          regionCode: 'MY',
          maxResultCount: 5
        })
      })
      
      const data = await response.json()
      
      if (data.places && data.places.length > 0) {
        setSuggestions(data.places)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
      
    } catch (error) {
      console.error('Autocomplete search error:', error)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Select a suggestion from autocomplete
  const selectSuggestion = (place: any) => {
    const lat = place.location.latitude
    const lng = place.location.longitude
    
    // Create location and marker
    const location = new google.maps.LatLng(lat, lng)
    setMarker(location)
    
    // Center map on selected place
    map?.panTo(location)
    map?.setZoom(17)
    
    // Parse address components
    const addressComponents = place.addressComponents || []
    const getComponent = (types: string[]) => {
      const component = addressComponents.find((c: any) => 
        types.some(type => c.types.includes(type))
      )
      return component?.longText || ''
    }
    
    // Update location data
    setLocationData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: place.formattedAddress || place.displayName?.text || prev.address,
      city: getComponent(['locality', 'sublocality']),
      state: getComponent(['administrative_area_level_1']),
      postalCode: getComponent(['postal_code']),
      country: getComponent(['country']) || 'Malaysia'
    }))
    
    // Hide suggestions
    setShowSuggestions(false)
    setSuggestions([])
    
    toast.success('Location selected!')
  }

  // Simple search using Places API
  const searchLocation = async () => {
    if (!locationData.address.trim()) {
      toast.error('Please enter an address to search')
      return
    }
    
    setGettingLocation(true)
    
    try {
      const response = await fetch(`https://places.googleapis.com/v1/places:searchText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey!,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.addressComponents'
        },
        body: JSON.stringify({
          textQuery: locationData.address,
          regionCode: 'MY',
          maxResultCount: 1
        })
      })
      
      const data = await response.json()
      
      if (data.places && data.places.length > 0) {
        const place = data.places[0]
        const lat = place.location.latitude
        const lng = place.location.longitude
        
        // Create location and marker
        const location = new google.maps.LatLng(lat, lng)
        setMarker(location)
        
        // Center map on found location
        map?.panTo(location)
        map?.setZoom(17)
        
        // Parse address components
        const addressComponents = place.addressComponents || []
        const getComponent = (types: string[]) => {
          const component = addressComponents.find((c: any) => 
            types.some(type => c.types.includes(type))
          )
          return component?.longText || ''
        }
        
        // Update location data
        setLocationData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: place.formattedAddress || place.displayName?.text || prev.address,
          city: getComponent(['locality', 'sublocality']),
          state: getComponent(['administrative_area_level_1']),
          postalCode: getComponent(['postal_code']),
          country: getComponent(['country']) || 'Malaysia'
        }))
        
        toast.success('Location found!')
      } else {
        toast.error('Location not found. Try a different address or click on the map.')
      }
      
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed. Please try again or click on the map.')
    } finally {
      setGettingLocation(false)
    }
  }


  // Handle map click to place marker
  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      
      setMarker(event.latLng)
      setLocationData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }))

      // Reverse geocode to get address
      reverseGeocode(lat, lng)
    }
  }, [])

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!window.google) return

    const geocoder = new window.google.maps.Geocoder()
    
    try {
      const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results) {
            resolve(results)
          } else {
            reject(new Error('Geocoding failed'))
          }
        })
      })

      if (results.length > 0) {
        const result = results[0]
        const components = result.address_components
        
        const getComponent = (types: string[]) => {
          const component = components.find(c => 
            types.some(type => c.types.includes(type))
          )
          return component?.long_name || ''
        }

        setLocationData(prev => ({
          ...prev,
          address: result.formatted_address,
          city: getComponent(['locality', 'sublocality']),
          state: getComponent(['administrative_area_level_1']),
          postalCode: getComponent(['postal_code']),
          country: getComponent(['country']) || 'Malaysia'
        }))
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error)
    }
  }

  // Get current user location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by this browser')
      return
    }

    setGettingLocation(true)
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const location = new google.maps.LatLng(latitude, longitude)
        
        setMarker(location)
        setLocationData(prev => ({
          ...prev,
          latitude,
          longitude
        }))

        // Center map on current location
        map?.panTo(location)
        map?.setZoom(17)
        
        // Get address
        if (hasValidApiKey) {
          reverseGeocode(latitude, longitude)
        }
        
        toast.success('Current location detected!')
        setGettingLocation(false)
      },
      (error) => {
        let message = 'Failed to get current location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location permissions.'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location unavailable.'
            break
          case error.TIMEOUT:
            message = 'Location request timed out.'
            break
        }
        toast.error(message)
        setGettingLocation(false)
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

    console.log('💾 Form submission started')
    console.log('📍 Location data:', {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address: locationData.address
    })

    if (!locationData.latitude || !locationData.longitude) {
      toast.error('Please select a location')
      return
    }

    if (!locationData.address.trim()) {
      toast.error('Please provide an address')
      return
    }

    // Skip currentUser check - middleware ensures only authenticated users reach this page
    console.log('🔄 Proceeding with location save (middleware handles auth)')

    setLoading(true)

    try {
      // Simplified approach: Let middleware handle auth, API will use server-side session
      console.log('🎆 Making API call to setup-location (middleware ensures auth)...')
      
      // Use cookie-based auth; avoid awaiting getSession to prevent hangs
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      let response: Response
      try {
        response = await fetch('/api/setup-location', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(locationData),
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timeout)
      }

      console.log('📊 API response status:', response.status)
      const result = await response.json()
      console.log('📊 API response data:', result)

      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔒 Authentication required - user needs to sign in')
          if (result.needsSignIn) {
            toast.success('Registration complete! Please sign in to save your location.')
            router.push('/auth/signin')
          } else {
            toast.error('Session expired. Please log in again.')
            router.push('/auth/signin')
          }
          return
        }
        console.error('❌ API error:', result)
        toast.error(result.error || 'Failed to save location')
        return
      }

      console.log('✅ Location saved successfully!')
      toast.success('Institution location saved successfully!')
      router.push('/auth/welcome')
    } catch (error) {
      console.error('Location setup error:', error)
      toast.error('Failed to save location. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!hasValidApiKey) {
    return (
      <AuthLayout
        title="Google Maps Setup Required"
        subtitle="Please configure your Google Maps API key to use the interactive map"
      >
        <div className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                  Interactive map unavailable
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                  The Google Maps API key is not configured. You can still set up your location manually.
                </p>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Use the "Get Current Location" button for GPS coordinates</li>
                  <li>• Or enter coordinates manually from Google Maps</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Manual Location Setup */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Institution Address *</Label>
              <Input
                id="address"
                value={locationData.address}
                onChange={(e) => setLocationData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your institution's full address"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <div className="flex gap-2">
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={locationData.latitude || ''}
                    onChange={(e) => setLocationData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                    placeholder="3.1319197"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={loading || gettingLocation}
                    className="flex items-center gap-2"
                  >
                    {gettingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                    GPS
                  </Button>
                </div>
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
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Set Your Institution Location"
      subtitle="Use the interactive map to precisely set your institution's location"
    >
      <div className="space-y-6">
        <LoadScript
          googleMapsApiKey={apiKey!}
          loadingElement={
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2">Loading map...</span>
            </div>
          }
        >
          {/* Search Bar */}
          <div className="space-y-2">
            <Label>Search for your institution</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Enter institution name or address..."
                  value={locationData.address}
                  onChange={(e) => {
                    setLocationData(prev => ({ ...prev, address: e.target.value }))
                    if (!e.target.value.trim()) {
                      setShowSuggestions(false)
                      setSuggestions([])
                    }
                  }}
                  disabled={loading}
                  className="pr-10"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      searchLocation()
                      setShowSuggestions(false)
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true)
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow click events
                    setTimeout(() => setShowSuggestions(false), 200)
                  }}
                />
                <button
                  type="button"
                  onClick={searchLocation}
                  disabled={loading || gettingLocation}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  {gettingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </button>
                
                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((place, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectSuggestion(place)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none"
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {place.displayName?.text || 'Unknown Place'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {place.formattedAddress || 'No address available'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={loading || gettingLocation}
                className="flex items-center gap-2"
              >
                {gettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                GPS
              </Button>
            </div>
          </div>

          {/* Map */}
          <div className="space-y-2">
            <Label>Click on the map to set precise location</Label>
            <div className="border rounded-lg overflow-hidden">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={marker ? 17 : 13}
                center={marker ? { lat: marker.lat(), lng: marker.lng() } : defaultCenter}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={onMapClick}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false
                }}
              >
                {marker && (
                  <Marker
                    position={marker}
                    animation={google.maps.Animation.DROP}
                  />
                )}
              </GoogleMap>
            </div>
            <p className="text-xs text-gray-500">
              Search for your institution above or click on the map to place a marker
            </p>
          </div>
        </LoadScript>

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
