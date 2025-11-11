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

export const registerSchema = z.object({
  email: z.email(),
  password: shortText(),
  repeatPassword: shortText(),
  firstName: shortText(),
  lastName: shortText(),
  birthday: z.string(),
  location: shortText(),
  gender: z.enum(["Male", "Female", "Other"]),
  lookingFor: z.enum(["Male", "Female", "Both"]),
  description: longText(),
  curiousAbout: z.array(z.number())
    .min(1, { message: "Veuillez sélectionner au moins un tag." })
    .max(5, { message: "Vous pouvez sélectionner au maximum 5 tags." }),
  // terms: z.boolean().refine(data => data, "Vous devez accepter les conditions"),
  iconImage: z.string().url({ message: "L'URL de l'icône doit être valide." }),
  photos: z
    .array(z.string().url({ message: "Les URLs des photos doivent être valides." }))
    .min(1, "Veuillez uploader au moins une photo.")
    .max(4, "Vous pouvez uploader jusqu'à 4 photos."),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
