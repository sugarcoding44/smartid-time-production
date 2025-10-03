'use client'

import { useState, useCallback, useEffect } from 'react'
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { MapPin, Search, Loader2, Navigation, Info } from 'lucide-react'
import { toast } from 'sonner'

const mapContainerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '0'
}

// Default center (Kuala Lumpur, Malaysia)
const defaultCenter = {
  lat: 3.1319197,
  lng: 101.6840589
}

interface LocationData {
  address: string
  latitude: number
  longitude: number
  attendanceRadius: number
}

interface InstitutionLocationStepProps {
  locationData: LocationData
  onLocationChange: (data: LocationData) => void
  disabled?: boolean
}

export function InstitutionLocationStep({
  locationData,
  onLocationChange,
  disabled = false
}: InstitutionLocationStepProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const hasValidApiKey = apiKey && apiKey !== 'your_api_key_here'

  // Debounce search for autocomplete
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.length > 2) {
        searchSuggestions(searchQuery)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    // If we already have coordinates, center the map there
    if (locationData.latitude && locationData.longitude) {
      map.panTo({ lat: locationData.latitude, lng: locationData.longitude })
      map.setZoom(16)
    }
  }, [locationData])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Search for autocomplete suggestions
  const searchSuggestions = async (query: string) => {
    if (!hasValidApiKey || query.length < 3) return

    console.log('Searching for:', query)

    try {
      // First try with educational institution types
      let response = await fetch(`https://places.googleapis.com/v1/places:searchText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey!,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.addressComponents'
        },
        body: JSON.stringify({
          textQuery: query,
          regionCode: 'MY',
          maxResultCount: 5,
          // Prioritize educational institutions
          includedTypes: ['school', 'university', 'primary_school', 'secondary_school']
        })
      })
      
      let data = await response.json()
      console.log('Search response with types:', data)
      
      // If no results with specific types, try without type restrictions
      if (!data.places || data.places.length === 0) {
        response = await fetch(`https://places.googleapis.com/v1/places:searchText`, {
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
            // No type restrictions this time
          })
        })
        
        data = await response.json()
        console.log('Search response without types:', data)
      }
      
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
    
    // Center map on selected place
    if (map) {
      map.panTo({ lat, lng })
      map.setZoom(17)
    }
    
    // Update location data
    onLocationChange({
      ...locationData,
      latitude: lat,
      longitude: lng,
      address: place.formattedAddress || place.displayName?.text || ''
    })
    
    // Clear search and hide suggestions
    setSearchQuery('')
    setShowSuggestions(false)
    setSuggestions([])
    
    toast.success('Location selected!')
  }

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        if (map) {
          map.panTo({ lat: latitude, lng: longitude })
          map.setZoom(17)
        }

        // Update location data
        onLocationChange({
          ...locationData,
          latitude,
          longitude,
        })

        setGettingLocation(false)
        toast.success('Current location detected!')
      },
      (error) => {
        console.error('Geolocation error:', error)
        setGettingLocation(false)
        switch(error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied. Please enable location access.')
            break
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.')
            break
          case error.TIMEOUT:
            toast.error('Location request timed out.')
            break
          default:
            toast.error('Failed to get current location.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Handle map click to set location
  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && !disabled) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      
      onLocationChange({
        ...locationData,
        latitude: lat,
        longitude: lng,
      })
    }
  }, [locationData, onLocationChange, disabled])

  const markerPosition = locationData.latitude && locationData.longitude
    ? { lat: locationData.latitude, lng: locationData.longitude }
    : null

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <Label htmlFor="location-search" className="text-base font-medium mb-2 block">
          Search for your institution *
        </Label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              id="location-search"
              type="text"
              placeholder="e.g., SMK Taman Melawati, University of Malaya"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
              disabled={disabled}
            />
          </div>
          
          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((place, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectSuggestion(place)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  disabled={disabled}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {place.displayName?.text || 'Unknown Place'}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {place.formattedAddress || ''}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      {hasValidApiKey ? (
        <Card className="overflow-hidden p-0">
          <div className="relative">
            <LoadScript googleMapsApiKey={apiKey!}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={markerPosition || defaultCenter}
                zoom={markerPosition ? 16 : 11}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={onMapClick}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                }}
              >
                {markerPosition && (
                  <>
                    <Marker 
                      position={markerPosition}
                      title="Institution Location"
                    />
                    <Circle
                      center={markerPosition}
                      radius={locationData.attendanceRadius}
                      options={{
                        fillColor: '#4F46E5',
                        fillOpacity: 0.2,
                        strokeColor: '#4F46E5',
                        strokeOpacity: 0.5,
                        strokeWeight: 2,
                      }}
                    />
                  </>
                )}
              </GoogleMap>
            </LoadScript>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-800 flex justify-between items-center border-t">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click on the map to set location
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={gettingLocation || disabled}
              className="flex items-center gap-2"
            >
              {gettingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              Use Current Location
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Google Maps API key is not configured</p>
        </Card>
      )}

      {/* Address Display */}
      {locationData.address && (
        <div>
          <Label className="text-base font-medium mb-2 block">
            Selected Address
          </Label>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm">{locationData.address}</p>
            {locationData.latitude && locationData.longitude && (
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Attendance Radius Setting */}
      <div>
        <Label htmlFor="attendance-radius" className="text-base font-medium mb-2 block">
          Attendance Check Radius
        </Label>
        <div className="space-y-3">
          <Slider
            id="attendance-radius"
            min={100}
            max={1000}
            step={50}
            value={[locationData.attendanceRadius]}
            onValueChange={(value) => 
              onLocationChange({
                ...locationData,
                attendanceRadius: value[0]
              })
            }
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">100m</span>
            <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              {locationData.attendanceRadius}m
            </span>
            <span className="text-sm text-gray-500">1000m</span>
          </div>
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Employees must be within this radius of the institution to check in/out. 
              Recommended: 300-500m for most institutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}