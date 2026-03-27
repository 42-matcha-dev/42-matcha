import { z } from 'zod'

export const searchUsersShema = z.object({
  ageMin: z.coerce.number().min(18).max(100).optional(),
  ageMax: z.coerce.number().min(18).max(100).optional(),
  distanceMax: z.coerce.number().min(0).optional(),
  fameMin: z.coerce.number().min(0).optional(),
  fameMax: z.coerce.number().min(0).optional(),

  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(100).default(20),

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
.refine(
  (data) => !data.ageMin || !data.ageMax || data.ageMin <= data.ageMax,
  { message: "Minimum age cannot be greater than maximum age"}
)
.refine(
  (data) => !data.fameMin || !data.fameMax || data.fameMin <= data.fameMax,
  { message: "Minimum fame cannot be greater than maximum fame" }
)
.transform((data) => {
  let sortBy: string | undefined;
  let order: string | undefined;

  switch (data.sortBy) {
    case "distance-asc":
      sortBy = "distance";
      order = "asc";
      break;
    case "fame-desc":
      sortBy = "fame";
      order = "desc";
      break;
    case "age-asc":
      sortBy = "age";
      order = "asc";
      break;
    case "age-desc":
      sortBy = "age";
      order = "desc";
      break;
    case "common-desc":
      sortBy = "tags";
      order = "desc";
      break;
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
  };
})

export type SearchUsersSchema = z.infer<typeof searchUsersShema>;