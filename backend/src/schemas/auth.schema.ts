import { z } from 'zod'
import { shortText, longText } from '../utils/zod.js';

export const USERNAME_REGEX = /^(?!_)(?!.*_$)[a-z0-9_]{3,20}$/

export const registerSchema = z.object({
  username: z
    .string()
    .regex(USERNAME_REGEX, {
      message:
        'Username must be 3–20 characters: lowercase letters, numbers, underscores. Cannot start or end with underscore.'
    }),
  firstName: shortText(),
  lastName: shortText(),

  birthday: z.coerce.date().refine(
    (date) => {
      const today = new Date()
      let age = today.getFullYear() - date.getFullYear()
      const m = today.getMonth() - date.getMonth()

      if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
        age--
      }

      return age >= 18 && age <= 100
    },
    {
      message: 'You must be between 18 and 100 years old'
    }
  ),
  location: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  gender: z.enum(["male", "female"]),
  lookingFor: z.enum(["male", "female", "both"]).default('both'),
  description: longText(),
  curiousAbout: z.array(z.number()).min(1).max(5),
  iconUrl: z.string().url().nullable(),
  photoUrls: z.array(z.string().url()).max(4)
}).strict();

export type RegisterSchema = z.infer<typeof registerSchema>;