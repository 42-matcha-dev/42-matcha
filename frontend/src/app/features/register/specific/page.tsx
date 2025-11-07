"use client";

import { Suspense, useEffect, useState } from "react";
import { z } from "zod";
import { registerSchema } from "../schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/app/components/Title";
import InputForm from "@/app/components/InputForm";
import InputFormSelect from "@/app/components/InputFormSelect";
import InputFormMultiSelect from "@/app/components/InputFormMultiSelect";
import NextButton from "@/app/components/Buttons/NextButton";
import { useRouter, useSearchParams } from "next/navigation";
import BackButton from "@/app/components/Buttons/BackButton";
import Stepper from "@/app/components/Stepper";

const registerSpecificSchema = registerSchema.pick({
    gender: true,
    lookingFor: true,
    description: true,
    curiousAbout: true
})

type registerSpecificSchema = z.infer<typeof registerSpecificSchema>;

interface Tag {
  id: number;
  name: string;
  category: string;
}

function RegisterSpecificFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<registerSpecificSchema>({
        resolver: zodResolver(registerSpecificSchema),
        mode: "onBlur",
        defaultValues: {
            gender: undefined,
            lookingFor: undefined,
            description: "",
            curiousAbout: []
        }
    });

    const selectedTags = watch("curiousAbout") || [];

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const response = await fetch(`${apiUrl}/api/tags`);
                if (!response.ok) {
                    throw new Error("Failed to fetch tags");
                }
                const data = await response.json();
                setTags(data);
            } catch (error) {
                console.error("Error fetching tags:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTags();
    }, []);

    const onSubmit = (data: registerSpecificSchema) => {
        // Save form data to sessionStorage
        sessionStorage.setItem("registerSpecific", JSON.stringify(data));
        const url = token ? `/register/images?token=${token}` : "/register/images";
        router.push(url);
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
          <InputFormSelect label="Gender" error={errors.gender} values={["Male", "Female", "Other"]} {...register("gender")}/>
          <InputFormSelect label="LookingFor" error={errors.lookingFor} values={["Male", "Female", "Both"]} {...register("lookingFor")}/>
          <InputForm label="Description" type="text" error={errors.description} {...register("description")}/>
          {loading ? (
            <div>Loading tags...</div>
          ) : (
            <InputFormMultiSelect
              label="CuriousAbout"
              error={errors.curiousAbout}
              tags={tags}
              selectedTags={selectedTags}
              onChange={(selectedIds) => setValue("curiousAbout", selectedIds)}
            />
          )}
          <BackButton text="Back" onClick={handleBack}/>
          <NextButton text="Next"/>
      </form>
    </div>
  );
}

export default function RegisterSpecificForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterSpecificFormContent />
    </Suspense>
  );
}
