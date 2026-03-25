"use client";

import { Suspense } from "react";
import Title from "@/app/components/Title";
import NextButton from "@/app/components/Buttons/NextButton";
import BackButton from "@/app/components/Buttons/BackButton";
import Stepper from "@/app/components/Stepper";
import { z } from "zod";
import { registerSchema } from "@/app/schema";
import PhotoGridUploader from "../PhotoGridUploader";
import AvatarUploader from "../AvatarUploader";
import { normalizePhotoUrls } from "@/utils/photo.utils";

const registerPhotoSchema = registerSchema.pick({
  iconUrl: true,
  photoUrls: true,
})

type RegisterPhotoSchema = z.infer<typeof registerPhotoSchema>;

interface Props {
  onBack: () => void;
  updateData: (data: Partial<RegisterPhotoSchema>) => void;
  defaultValues: Partial<RegisterPhotoSchema>;
  onSubmitFinal: () => void;
  errors?: Record<string, string>;
}

function RegisterImagesFormContent({
  onBack,
  updateData,
  defaultValues,
  onSubmitFinal,
  errors
}: Props) {

  return (
    <div className="w-full bg-white">
      <div className="flex flex-col items-center w-full gap-12">
        <Title title="Complete Your Profile" subTitle="Tell us more about you." />
        <Stepper currentStep="2" />

        {/* Profile Icon */}
        <AvatarUploader
          initialUrl={defaultValues.iconUrl ?? null}
          onChange={(url) => updateData({ iconUrl: url})}
          error={errors?.iconUrl}
        />

        {/* Photos Upload */}
        <PhotoGridUploader
          photoUrls={normalizePhotoUrls(defaultValues.photoUrls)}
          onChange={(urls) => updateData({ photoUrls: urls })}
        />

        {/* Nav buttons */}
        <div className="flex flex-col gap-4 justify-between w-full">
          <BackButton text="Back" onClick={onBack} />
          <NextButton text="Complete" onClick={onSubmitFinal} />
        </div>
      </div>
    </div>
  );
}

export default function RegisterImagesForm(props: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterImagesFormContent {...props}/>
    </Suspense>
  );
}
