import express from 'express';

type Response = express.Response;

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Helper function to format address as "City, CountryCode"
const formatSimpleAddress = (addressData: any): string => {
  const city = addressData.city || addressData.town || addressData.village || addressData.municipality || '';
  const countryCode = addressData.country_code?.toUpperCase() || '';

  if (city && countryCode) {
    return `${city}, ${countryCode}`;
  }

  // Fallback if we don't have both
  if (city) return city;
  if (countryCode) return countryCode;

  return '';
};

// Forward geocoding: convert address text to coordinates
export const forwardGeocode = async (req: express.Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(q)}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Matcha-Dating-App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to geocode location');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(500).json({ error: 'Invalid coordinates returned from geocoding service' });
      }

      // Format address as "City, CountryCode"
      const simpleAddress = formatSimpleAddress(data[0].address || {});

      return res.status(200).json({
        latitude: lat,
        longitude: lon,
        display_name: simpleAddress || data[0].display_name
      });
    } else {
      return res.status(404).json({ error: 'Location not found. Please try a more specific address.' });
    }
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to geocode location'
    });
  }
};

// Reverse geocoding: convert coordinates to address
export const reverseGeocode = async (req: express.Request, res: Response) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Query parameters "lat" and "lon" are required' });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude values' });
    }

    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Matcha-Dating-App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address from geocoding service');
    }

    const data = await response.json();

    // Format address as "City, CountryCode"
    const simpleAddress = formatSimpleAddress(data.address || {});

    if (!simpleAddress) {
      return res.status(404).json({ error: 'Could not determine address from location' });
    }

    return res.status(200).json({
      address: simpleAddress,
      latitude,
      longitude
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get address from location'
    });
  }
};

