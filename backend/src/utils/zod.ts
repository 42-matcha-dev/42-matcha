import { z } from 'zod'

export const shortText = (min = 3, max = 20) =>
  z
    .string()
    .min(min, { message: `Text must contain at least ${min} characters.` })
    .max(max, { message: `Text must contain at most ${max} characters.` })

export const longText = (min = 3, max = 150) =>
  z
    .string()
    .min(min, { message: `Text must contain at least ${min} characters.` })
    .max(max, { message: `Text must contain at most ${max} characters.` })

export const queryNumber = (min?: number, max?: number, name = 'Value') =>
  z.preprocess(
    (val) => {
      if (val === undefined || val === '') return undefined

      const num = Number(val)
      return isNaN(num) ? val : num
    },
    z
      .number({ message: `${name} must be a number` })
      .refine((v) => min === undefined || v >= min, {
        message: `${name} must be at least ${min}`
      })
      .refine((v) => max === undefined || v <= max, {
        message: `${name} cannot exceed ${max}`
      })
      .optional()
  )
