import express from 'express'
import { geocodingService } from '../services/geocoding.service.js'
import { HttpError } from '../errors/HttpError.js'

type Response = express.Response

export const forwardGeocode = async (req: express.Request, res: Response) => {
  try {
    const { q } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' })
    }

    const result = await geocodingService.forwardGeocodeService(q)

    return res.status(200).json(result)
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message })
    }
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to geocode location'
    })
  }
}

export const reverseGeocode = async (req: express.Request, res: Response) => {
  try {
    const { lat, lon } = req.query

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Query parameters "lat" and "lon" are required' })
    }

    const latitude = parseFloat(lat as string)
    const longitude = parseFloat(lon as string)

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude values' })
    }

    const result = await geocodingService.reverseGeocodeService(latitude, longitude)

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get address from location'
    })
  }
}
