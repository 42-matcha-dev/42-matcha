"use client";

import { z } from "zod";
import { registerSchema } from "../schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/app/components/Title";
import InputForm from "@/app/components/InputForm";
import NextButton from "@/app/components/Buttons/NextButton";
import { useRouter } from "next/navigation";

const registerBasicSchema = registerSchema.pick({
    firstName: true,
    lastName: true,
    birthday: true,
    location: true
});

type registerBasicSchema = z.infer<typeof registerBasicSchema>;

export default function RegisterBasicForm() {

    const router = useRouter();
    const { register, handleSubmit } = useForm<registerBasicSchema>({
        resolver: zodResolver(registerBasicSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            birthday: "",
            location: ""
        }
    });

    const onSubmit = (data: registerBasicSchema) => {
        console.log(data);
        router.push("/register/specific")
    };

  return (
    <div className="w-1/2 h-full bg-white text-black p-4 border">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center w-1/2 m-55 gap-15">
          <Title title="Complete Your Profile" sub_title="Tell us more about you."/>
          <InputForm label="firstName" type="text" {...register("firstName")}/>
          <InputForm label="lastName" type="text" {...register("lastName")}/>
        <InputForm
          label="birthday"
          type="date"
          {...register("birthday")}
        />
          <InputForm label="location" type="text" {...register("location")}/>
          <NextButton text="Next"/>
      </form>
    </div>
  );
}