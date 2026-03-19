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

const MIN_AGE = 18
const MAX_AGE = 100

const today = new Date()

const minDate = new Date(
  today.getFullYear() - MAX_AGE,
  today.getMonth(),
  today.getDate()
)

const maxDate = new Date(
  today.getFullYear() - MIN_AGE,
  today.getMonth(),
  today.getDate()
)

export const registerSchema = z.object({
  email: z.email(),
  password: shortText(),
  repeatPassword: shortText(),
  firstName: shortText(),
  lastName: shortText(),
  birthday: z.coerce
    .date()
    .min(minDate, "Age must be less than 100")
    .max(maxDate, "You must be at least 18"),
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
