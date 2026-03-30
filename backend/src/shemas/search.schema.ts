import { z } from 'zod'
import { queryNumber } from '../utils/zod.js'

export const searchUsersShema = z
  .object({
    ageMin: queryNumber(18, 100, 'Minimum age'),
    ageMax: queryNumber(18, 100, 'Maximum age'),
    distanceMax: queryNumber(0, undefined, 'Distance'),
    fameMin: queryNumber(0, 100, 'Minimum fame'),
    fameMax: queryNumber(0, 100, 'Maximum fame'),
    page: queryNumber(0, undefined, 'Page').default(0),
    limit: queryNumber(1, 100, 'Limit').default(20),

    tags: z
      .string()
      .optional()
      .transform((val) =>
        val
          ? val
              .split(',')
              .map((v) => Number(v.trim()))
              .filter((v) => !isNaN(v))
          : undefined
      ),

    sortBy: z.enum(['distance-asc', 'fame-desc', 'age-asc', 'age-desc', 'common-desc']).optional()
  })
  .refine((data) => !data.ageMin || !data.ageMax || data.ageMin <= data.ageMax, {
    message: 'Minimum age cannot be greater than maximum age'
  })
  .refine((data) => !data.fameMin || !data.fameMax || data.fameMin <= data.fameMax, {
    message: 'Minimum fame cannot be greater than maximum fame'
  })
  .transform((data) => {
    let sortBy: string | undefined
    let order: string | undefined

    switch (data.sortBy) {
      case 'distance-asc':
        sortBy = 'distance'
        order = 'asc'
        break
      case 'fame-desc':
        sortBy = 'fame'
        order = 'desc'
        break
      case 'age-asc':
        sortBy = 'age'
        order = 'asc'
        break
      case 'age-desc':
        sortBy = 'age'
        order = 'desc'
        break
      case 'common-desc':
        sortBy = 'tags'
        order = 'desc'
        break
    }

    return {
      ageMin: data.ageMin,
      ageMax: data.ageMax,
      distanceMax: data.distanceMax,
      fameMin: data.fameMin,
      fameMax: data.fameMax,
      tagIds: data.tags,
      page: data.page,
      limit: data.limit,
      sortBy,
      order
    }
  })

export type SearchUsersSchema = z.infer<typeof searchUsersShema>
