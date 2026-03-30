import { randomUUID } from 'crypto'
import supabase from '../database/supabase.init.js'
import { HttpError } from '../errors/HttpError.js'
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

export const uploadService = {
  processAndUploadImage: async (buffer: Buffer) => {
    const type = await fileTypeFromBuffer(buffer);
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

    if (!type || !ALLOWED_TYPES.includes(type.mime)) {
        throw new HttpError(400, 'Please upload jpeg, png or webp')
    }

    const processedImage = await sharp(buffer)
      .resize(800, 800, {fit: 'inside'})
      .jpeg({ quality: 80})
      .toBuffer();

    const filename = `${randomUUID()}.jpg`;

    const { error } = await supabase.storage
      .from('images')
      .upload(filename, processedImage, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (error) {
      throw new HttpError(400, 'Image upload failed');
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filename);
    return data.publicUrl;
  },
  processMultipleImages: async (files: Express.Multer.File[]) => {
    const urls = [];

    if (files.length > 5) {
      throw new HttpError(400, 'Maximum 5 images allowed');
    }
    for (const file of files) {
      const url = await uploadService.processAndUploadImage(file.buffer);
      urls.push(url);
    }

    return urls;
  }
}
