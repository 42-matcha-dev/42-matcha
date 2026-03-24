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

const COMMON_PASSWORDS = new Set([
  'password', '12345678', '12345679', 'azertyulop', 'azerty123',
  'final9999', 'motdepasse', '1234567890', 'gazeuses', '12345678910',
  'football', 'iloveyou', 'realmadrid'
])

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters.' })
  .max(72, { message: 'Password must be at most 72 characters.' })
  .refine((v) => v === v.trim(), {
    message: 'Password cannot start or end with spaces.',
  })
  .refine((v) => !COMMON_PASSWORDS.has(v.toLowerCase()), {
    message: 'Password is too common. Choose a stronger password.',
  })
  .refine((v) => !/^[a-zA-Z]+$/.test(v), {
    message: 'Password must include at least one number or symbol.',
  })

export const registerSchema = z.object({
  email: z.email(),
  password: passwordSchema,
  repeatPassword: z.string(),
  firstName: shortText(),
  lastName: shortText(),
  birthday: z
    .string()
    .refine((val) => {
      const date = new Date(val)
      if (isNaN(date.getTime())) return false

      const today = new Date()
      let age = today.getFullYear() - date.getFullYear()
      const m = today.getMonth() - date.getMonth()

      if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
        age--
      }

      return age >= 18 && age <= 100
    }, "You must be between 18 and 100 years old"),
  location: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  gender: z.enum(['male', 'female'], {
    message: 'Please select an option.'
  }),
  lookingFor: z.enum(['male', 'female', 'both'], {
    message: 'Please select an option.'
  }),
  description: longText(),
  curiousAbout: z
    .array(z.number())
    .min(1, { message: 'Please select at least one tag.' })
    .max(5, { message: 'You can select up to 5 tags.' }),
  iconUrl: z.string().url().nullable(),
  photoUrls: z.array(z.string().url()).max(4)
}).refine((data) => data.password === data.repeatPassword, {
  message: 'Passwords do not match.',
  path: ['repeatPassword'],
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
