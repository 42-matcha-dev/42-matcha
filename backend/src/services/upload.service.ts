import { randomUUID } from 'crypto'
import supabase from '../database/supabase.init.js'
import { HttpError } from '../errors/HttpError.js'

export const uploadService = {
  createSignedUrls: async (files: { type: string; size: number }[]) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const MAX_SIZE = 5 * 1024 * 1024
    const urls = []

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        throw new HttpError(400, 'Please upload jpeg, png or webp')
      }

      if (file.size > MAX_SIZE) {
        throw new HttpError(400, 'File too large (<5MB)')
      }
      const path = `users/${randomUUID()}`
      const { data, error } = await supabase.storage.from('user-photos').createSignedUploadUrl(path)
      if (error) {
        throw new Error('Supabase upload URL error')
      }
      urls.push(data)
    }
    return urls
  }
}
