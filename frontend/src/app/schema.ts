import { z } from 'zod'

const shortText = (min = 3, max = 20) =>
  z
    .string()
    .min(min, { message: `Text must contain at least ${min} characters.` })
    .max(max, { message: `Text must contain at most ${max} characters.` })

const longText = (min = 3, max = 150) =>
  z
    .string()
    .min(min, { message: `Text must contain at least ${min} characters.` })
    .max(max, { message: `Text must contain at most ${max} characters.` })

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters.' })
  .max(72, { message: 'Password must be at most 72 characters.' })
  .refine((v) => v === v.trim(), {
    message: 'Password cannot start or end with spaces.'
  })

export const registerSchema = z
  .object({
    email: z.email(),
    password: passwordSchema,
    repeatPassword: z.string(),
    firstName: shortText(),
    lastName: shortText(),
    birthday: z.string().refine((val) => {
      const date = new Date(val)
      if (isNaN(date.getTime())) return false

      const today = new Date()
      let age = today.getFullYear() - date.getFullYear()
      const m = today.getMonth() - date.getMonth()

      if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
        age--
      }

      return age >= 18 && age <= 100
    }, 'You must be between 18 and 100 years old'),
    location: z.string(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    gender: z.enum(['male', 'female'], {
      message: 'Please select an option.'
    }),
    lookingFor: z.enum(['', 'male', 'female', 'both']),
    description: longText(),
    curiousAbout: z
      .array(z.number())
      .min(1, { message: 'Please select at least one tag.' })
      .max(5, { message: 'You can select up to 5 tags.' }),
    iconUrl: z.string().min(1, 'Please select an image').url('Please select an image'),
    photoUrls: z.array(z.string().url().or(z.literal(''))).max(4)
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Passwords do not match.',
    path: ['repeatPassword']
  })

export type RegisterSchema = z.infer<typeof registerSchema>
export const profileEditSchema = registerSchema
  .omit({
    password: true,
    repeatPassword: true,
    email: true
  })
  .extend({
    locationVerified: z.boolean().refine((v) => v === true, {
      message: 'Please verify your location.'
    })
  })

export const profilePatchSchema = profileEditSchema.partial()
