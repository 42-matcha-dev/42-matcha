import { z } from "zod";

const shortText = (min = 3, max = 20) => z.string().min(min).max(max);
const longText = (min = 3, max = 150) => z.string().min(min).max(max);
const imageFile = z
  .instanceof(File)
  .refine(file => file.size < 5 * 1024 * 1024, "L'image doit faire moins de 5Mo")
  .refine(file => ["image/jpeg", "image/png"].includes(file.type), "Format non supporté")
  .optional();

export const registerSchema = z.object({
  email: shortText(),
  password: shortText(),
  repeatPassword: shortText(),
  firstName: shortText(),
  lastName: shortText(),
  birthday: z.string(),
  location: shortText(),
  gender: shortText(),
  lookingFor: shortText(),
  descripton: longText(),
  curiousAbout: longText(),
  terms: z.boolean().refine(data => data, "Vous devez accepter les conditions"),
  image: imageFile
});

export type RegisterSchema = z.infer<typeof registerSchema>;
