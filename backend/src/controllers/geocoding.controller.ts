import express from 'express';

type Response = express.Response;

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Forward geocoding: convert address text to coordinates
export const forwardGeocode = async (req: express.Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
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

      return res.status(200).json({
        latitude: lat,
        longitude: lon,
        display_name: data[0].display_name
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
      `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${latitude}&lon=${longitude}`,
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
    const address = data.display_name ||
      `${data.address?.city || data.address?.town || data.address?.village || ''}, ${data.address?.country || ''}`.trim();

    if (!address) {
      return res.status(404).json({ error: 'Could not determine address from location' });
    }

    return res.status(200).json({
      address,
      latitude,
      longitude
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get address from location'
    });
  }
};

