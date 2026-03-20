'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FieldError } from 'react-hook-form'

interface Props {
  location: string
  latitude: number
  longitude: number
  onChange: (location: string, lat: number, lon: number) => void
  error?: FieldError
  label?: string
}

export default function LocationField({ location, latitude, longitude, onChange, error, label }: Props) {
  const [verifiedLocation, setVerifiedLocation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // If default values already contain coordinates → mark verified
  useEffect(() => {
    if (location && latitude !== 0 && longitude !== 0) {
      setVerifiedLocation(location)
    }
  }, [location, latitude, longitude])

  const verifyLocation = async () => {
    if (!location) return

    setLoading(true)
    setApiError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/api/geocoding/forward?q=${encodeURIComponent(location)}`)
      const data = await res.json()

      if (!data.latitude || !data.longitude) {
        throw new Error('Invalid location')
      }

      const verified = data.display_name || location

      setVerifiedLocation(verified)
      setApiError(null)
      onChange(verified, data.latitude, data.longitude)
    } catch {
      setApiError('Could not verify location')
    } finally {
      setLoading(false)
    }
  }

  const enableGPS = () => {
    setApiError(null)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/api/geocoding/reverse?lat=${latitude}&lon=${longitude}`)
      const data = await res.json()

      const address = data.address ?? location ?? ''
      setVerifiedLocation(address)
      setApiError(null)
      onChange(address, latitude, longitude)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      
      <div className="flex gap-2">
        <input
          value={location ?? ''}
          onChange={(e) => {
            setVerifiedLocation(null)
            setApiError(null)
            onChange(e.target.value, 0, 0)
          }}
          className="border-b border-gray-300 p-2 flex-1 focus:outline-none"
          placeholder="Enter location"
        />

        <button
          type="button"
          onClick={verifyLocation}
          className="px-4 py-2 rounded-lg border border-secondary text-secondary text-sm
              hover:bg-secondary hover:text-white
              active:bg-[#18233F] active:text-white
              disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking...' : 'Verify'}
        </button>
      </div>

      <button type="button" onClick={enableGPS} className="text-sm underline text-start">
        <div>
          <Image
            src="/icons/location.svg"
            alt="Location icon"
            width={16}
            height={16}
            className="inline"
          />
          Current location
        </div>
      </button>

      {verifiedLocation && <p className="text-green-600 text-sm">✓ Verified: {verifiedLocation}</p>}

      {error && <p className="text-red-500 text-sm">{error.message}</p>}

      {apiError && !error && <p className="text-red-500 text-sm">{apiError}</p>}
    </div>
  )
}
