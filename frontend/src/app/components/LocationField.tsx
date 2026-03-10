"use client";

import { useEffect, useState } from "react";

interface Props {
  location: string;
  latitude: number;
  longitude: number;
  onChange: (location: string, lat: number, lon: number) => void;
}

export default function LocationField({
  location,
  latitude,
  longitude,
  onChange
}: Props) {
  const [verifiedLocation, setVerifiedLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If default values already contain coordinates → mark verified
  useEffect(() => {
    if (location && latitude !== 0 && longitude !== 0) {
      setVerifiedLocation(location);
    }
  }, [location, latitude, longitude]);

  const verifyLocation = async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/geocoding/forward?q=${encodeURIComponent(location)}`
      );

      const data = await res.json();

      if (!data.latitude || !data.longitude) {
        throw new Error("Invalid location");
      }

      const verified = data.display_name || location;

      setVerifiedLocation(verified);
      onChange(verified, data.latitude, data.longitude);
    } catch {
      setError("Could not verify location");
    } finally {
      setLoading(false);
    }
  };

  const enableGPS = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(
        `${apiUrl}/api/geocoding/reverse?lat=${latitude}&lon=${longitude}`
      );

      const data = await res.json();

      setVerifiedLocation(data.address);
      onChange(data.address, latitude, longitude);
    });
  };

  return (
    <div className="flex flex-col gap-2">

      <div className="flex gap-2">
        <input
          value={location}
          onChange={(e) => {
            setVerifiedLocation(null);
            onChange(e.target.value, 0, 0);
          }}
          className="border p-2 rounded flex-1"
          placeholder="Enter location"
        />

        <button type="button" onClick={verifyLocation}>
          {loading ? "Checking..." : "Verify"}
        </button>
      </div>

      <button
        type="button"
        onClick={enableGPS}
        className="text-sm underline"
      >
        Use GPS
      </button>

      {verifiedLocation && (
        <p className="text-green-600 text-sm">
          ✓ Verified: {verifiedLocation}
        </p>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}