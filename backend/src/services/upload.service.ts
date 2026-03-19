import { randomUUID } from 'crypto'
import supabase from '../database/supabase.init.js'

export const uploadService = {
  createSignedUrls: async (fileCount: number) => {
    const urls = []

    for (let i = 0; i < fileCount; i++) {
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
