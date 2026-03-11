import { z } from "zod";

const shortText = (min = 3, max = 20) =>
  z
    .string()
    .min(min, { message: `Text must contain at least ${min} characters.` })
    .max(max, { message: `Text must contain at most ${max} characters.` });

const longText = (min = 3, max = 150) =>
  z
    .string()
    .min(min, { message: `Text must contain at least ${min} characters.` })
    .max(max, { message: `Text must contain at most ${max} characters.` });

export const registerSchema = z.object({
  email: z.email(),
  password: shortText(),
  repeatPassword: shortText(),
  firstName: shortText(),
  lastName: shortText(),
  birthday: z.string(),
  location: shortText(),
  latitude: z.number(),
  longitude: z.number(),
  gender: z.enum(["male", "female"]),
  lookingFor: z.enum(["male", "female", "both"]),
  description: longText(),
  curiousAbout: z.array(z.number())
    .min(1, { message: "Veuillez sélectionner au moins un tag." })
    .max(5, { message: "Vous pouvez sélectionner au maximum 5 tags." }),
  iconUrl: z.string().url().nullable(),
  photoUrls: z.array(z.string().url()).max(4),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export const profileEditSchema =
  registerSchema.omit({
    password: true,
    repeatPassword: true,
  });

export const profilePatchSchema =
  profileEditSchema.partial();