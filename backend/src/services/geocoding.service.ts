import { HttpError } from "../errors/HttpError.js"

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'

const formatSimpleAddress = (addressData: any): string => {
  const city =
    addressData.city || 
    addressData.town || 
    addressData.village || 
    addressData.municipality || 
    addressData.suburb ||
    addressData.province || 
    addressData.state

  if (!city) {
    throw new HttpError(422, 'No city found')
  }

  const countryCode = addressData.country_code?.toUpperCase()

  if (!countryCode) {
    return city
  }

  return `${city}, ${countryCode}`
}

export const geocodingService = {
  forwardGeocodeService: async (query: string) => {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&featuretype=city&accept-language=en`,
      {
        headers: {
          'User-Agent': 'Matcha-Dating-App/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new HttpError(502, 'Geocoding service unavailable')
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      throw new HttpError(404, 'Location not found')
    }

    const lat = parseFloat(data[0].lat)
    const lon = parseFloat(data[0].lon)

    if (isNaN(lat) || isNaN(lon)) {
      throw new HttpError(502, 'Invalid coordinates returned')
    }

    const simpleAddress = formatSimpleAddress(data[0].address || {})
    return {
      latitude: lat,
      longitude: lon,
      display_name: simpleAddress || data[0].display_name
    }
  },

  reverseGeocodeService: async (latitude: number, longitude: number) => {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: { 'User-Agent': 'Matcha-Dating-App/1.0' }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch address')
    }

    const data = await response.json()

    const simpleAddress = formatSimpleAddress(data.address || {})

    if (!simpleAddress) {
      throw new Error('Could not determine address')
    }

    return {
      address: simpleAddress,
      latitude,
      longitude
    }
  }
}
