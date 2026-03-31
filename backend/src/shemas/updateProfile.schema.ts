import { z } from 'zod'
import { shortText, longText } from '../utils/zod.js'

export const updateProfileSchema = z
  .object({
    firstName: shortText().optional(),
    lastName: shortText().optional(),

    birthday: z.coerce
      .date()
      .refine(
        (date) => {
          const today = new Date()
          let age = today.getFullYear() - date.getFullYear()
          const m = today.getMonth() - date.getMonth()
          if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--
          return age >= 18 && age <= 100
        },
        {
          message: 'You must be between 18 and 100 years old'
        }
      )
      .optional(),
    location: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    gender: z.enum(['male', 'female']).optional(),
    lookingFor: z.enum(['male', 'female', 'both']).optional(),
    description: longText().optional(),
    curiousAbout: z.array(z.number()).min(1).max(5),
    iconUrl: z.string().url().nullable().optional(),
    photoUrls: z.array(z.string().url()).max(4).optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'No fields provided for update'
  })

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
