import { z } from "zod";

const shortText = (min = 3, max = 20) =>
  z
    .string()
    .min(min, { message: `Le texte doit contenir au moins ${min} caractères.` })
    .max(max, { message: `Le texte doit contenir au maximum ${max} caractères.` });

const longText = (min = 3, max = 150) =>
  z
    .string()
    .min(min, { message: `Le texte doit contenir au moins ${min} caractères.` })
    .max(max, { message: `Le texte doit contenir au maximum ${max} caractères.` });

const imageFile = z
  .instanceof(File)
  .refine(file => file.size < 5 * 1024 * 1024, "L'image doit faire moins de 5Mo")
  .refine(file => ["image/jpeg", "image/png"].includes(file.type), "Format non supporté");

export const registerSchema = z.object({
  email: shortText(),
  password: shortText(),
  repeatPassword: shortText(),
  firstName: shortText(),
  lastName: shortText(),
  birthday: z.string(),
  location: shortText(),
  gender: z.enum(["Male", "Female"]),
  lookingFor: z.enum(["Male", "Female"]),
  description: longText(),
  curiousAbout: longText(),
  terms: z.boolean().refine(data => data, "Vous devez accepter les conditions"),
  image: imageFile
});

export type RegisterSchema = z.infer<typeof registerSchema>;
