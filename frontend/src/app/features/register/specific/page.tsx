"use client";

import { z } from "zod";
import { registerSchema } from "../schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/app/components/Title";
import InputForm from "@/app/components/InputForm";
import InputFormSelect from "@/app/components/InputFormSelect";
import NextButton from "@/app/components/Buttons/NextButton";
import { useRouter } from "next/navigation";
import BackButton from "@/app/components/Buttons/BackButton";
import Stepper from "@/app/components/Stepper";

const registerSpecificSchema = registerSchema.pick({
    gender: true,
    lookingFor: true,
    description: true,
    curiousAbout: true
})

type registerSpecificSchema = z.infer<typeof registerSpecificSchema>;

export default function RegisterSpecificForm() {

    const router = useRouter();
    const { register, handleSubmit,  formState: { errors } } = useForm<registerSpecificSchema>({
        resolver: zodResolver(registerSpecificSchema),
        mode: "onBlur",
        defaultValues: {
            gender: "Male",
            lookingFor: "Male",
            description: "",
            curiousAbout: ""
        }
    });

    const onSubmit = (data: registerSpecificSchema) => {
        console.log(data);
        router.push("/register/images")
    };

    const handleBack = () => {
      router.back();
    };

  return (
    <div className="w-1/2 h-full bg-white text-black p-4 border">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-left w-1/2 m-55 gap-15">
          <Title title="Complete Your Profile" subTitle="Tell us more about you."/>
          <Stepper currentStep="1" />
          <InputFormSelect label="Gender" error={errors.gender} values={["Male", "Female"]} {...register("gender")}/>
          <InputFormSelect label="LookingFor" error={errors.lookingFor} values={["Male", "Female"]} {...register("lookingFor")}/>
          <InputForm label="Description" type="text" error={errors.description} {...register("description")}/>
          <InputForm label="CuriousAbout" type="text" error={errors.curiousAbout} {...register("curiousAbout")}/>
          <BackButton text="Back" onClick={handleBack}/>
          <NextButton text="Next"/>
      </form>
    </div>
  );
}