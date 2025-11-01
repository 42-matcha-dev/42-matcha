"use client";

import { z } from "zod";
import { registerSchema } from "../schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/app/components/Title";
import InputForm from "@/app/components/InputForm";
import NextButton from "@/app/components/Buttons/NextButton";
import { useRouter } from "next/navigation";
import BackButton from "@/app/components/Buttons/BackButton";
import Stepper from "@/app/components/Stepper";

const registerImagesSchema = registerSchema.extend({
  images: z
    .array(
      z.instanceof(File)
        .refine(file => file.size < 5 * 1024 * 1024, "Chaque image doit faire moins de 5Mo")
        .refine(file => ["image/jpeg", "image/png"].includes(file.type), "Format non supporté")
    )
    .min(1, "Ajoute au moins une image")
    .max(5, "Tu peux ajouter jusqu'à 5 images"),
});

type RegisterImagesSchema = z.infer<typeof registerImagesSchema>;

export default function RegisterImagesForm() {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors }} = useForm<RegisterImagesSchema>({
    resolver: zodResolver(registerImagesSchema),
    mode: "onBlur",
    defaultValues: { images: [] },
  });

  const images = watch("images");

  const onSubmit = (data: RegisterImagesSchema) => {
    console.log(data.images);
    router.push("/register/next-step");
  };

  const handleBack = () => {
    router.back();
  }

  return (
    <div className="w-1/2 h-full bg-white text-black p-4 border">
      <form
        onSubmit={handleSubmit(onSubmit)} 
        className="flex flex-col items-left w-1/2 m-55 gap-4"
      >
        <Title
          title="Complete Your Profile"
          subTitle="Add up to 5 profile images"
        />
        <Stepper currentStep="2" />

        {/* Champ d’upload */}
        <InputForm
          label="Images"
          type="file"
          multiple
          accept="image/png, image/jpeg"
          {...register("images")}
        />

        {/* Aperçu */}
        <div className="flex gap-2 flex-wrap mt-4">
          {images && Array.from(images).map((file: File, i: number) => (
            <img
              key={i}
              src={URL.createObjectURL(file)}
              alt={`preview-${i}`}
              className="w-24 h-24 object-cover rounded-md border"
            />
          ))}
        </div>

        <BackButton text="Back" onClick={handleBack}/>
        <NextButton text="Complete" />
      </form>
    </div>
  );
}
