"use client";

import { z } from "zod";
import { registerSchema } from "../schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/app/components/Title";
import InputForm from "@/app/components/InputForm";
import NextButton from "@/app/components/Buttons/NextButton";
import { useRouter } from "next/navigation";

const registerSpecificSchema = registerSchema.pick({
    gender: true,
    lookingFor: true,
    description: true,
    curiousAbout: true
})

type registerSpecificSchema = z.infer<typeof registerSpecificSchema>;

export default function RegisterSpecificForm() {

    const router = useRouter();
    const { register, handleSubmit } = useForm<registerSpecificSchema>({
        resolver: zodResolver(registerSpecificSchema),
        defaultValues: {
            gender: "",
            lookingFor: "",
            description: "",
            curiousAbout: ""
        }
    });

    const onSubmit = (data: registerSpecificSchema) => {
        console.log(data);
        router.push("/register/images")
    };

  return (
    <div className="w-1/2 h-full bg-white text-black p-4 border">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center w-1/2 m-55 gap-15">
          <Title title="Complete Your Profile" sub_title="Tell us more about you."/>
          <InputForm label="gender" type="text" {...register("gender")}/>
          <InputForm label="lookingFor" type="text" {...register("lookingFor")}/>
          <InputForm label="description" type="text" {...register("description")}/>
          <InputForm label="curiousAbout" type="text" {...register("curiousAbout")}/>
          <NextButton text="Next"/>
      </form>
    </div>
  );
}