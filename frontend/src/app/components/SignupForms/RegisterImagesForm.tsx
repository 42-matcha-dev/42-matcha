"use client";

import { Suspense, useState } from "react";
import Title from "@/app/components/Title";
import NextButton from "@/app/components/Buttons/NextButton";
import BackButton from "@/app/components/Buttons/BackButton";
import Stepper from "@/app/components/Stepper";
import { z } from "zod";
import { registerSchema } from "@/app/schema";

type SignedUrlData = {
  signedUrl: string;
  path: string;
};

// Form data type matching the register form (excluding email/password fields)
// Includes both current (iconImage, photos) and legacy (iconUrl, photoUrls) field names
type FormData = Partial<Omit<z.infer<typeof registerSchema>, "email" | "password" | "repeatPassword">> & {
  iconUrl?: string;
  photoUrls?: string[];
};

interface Props {
  onBack: () => void;
  updateData: (data: Partial<FormData>) => void;
  defaultValues: Partial<FormData>;
  onSubmitFinal: () => void;
}

function RegisterImagesFormContent({
  onBack,
  updateData,
  defaultValues,
  onSubmitFinal,
}: Props) {
  const [iconUrl, setIconUrl] = useState<string | null>(
    (defaultValues.iconImage as string | undefined) ||
    (defaultValues.iconUrl as string | undefined) ||
    null
  );
  const [photoUrls, setPhotoUrls] = useState<string[]>(
    (defaultValues.photos as string[] | undefined) ||
    (defaultValues.photoUrls as string[] | undefined) ||
    []
  );
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (files: FileList, type: "icon" | "photos", index?: number) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const fileNames = Array.from(files).map((f) => f.name);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-urls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileNames }),
    });
    const { urls }: { urls: SignedUrlData[] } = await res.json();

    await Promise.all(
      Array.from(files).map((file, i) =>
        fetch(urls[i].signedUrl, { method: "PUT", body: file })
      )
    );

    const uploaded = urls.map(
      (u) =>
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-photos/${u.path}`
    );

    if (type === "icon") {
      setIconUrl(uploaded[0]);
      updateData({ iconImage: uploaded[0] });
    } else if (index !== undefined) {
      // Compute new arrays first
      const newUrls = [...photoUrls];
      newUrls[index] = uploaded[0];

      // Update state
      setPhotoUrls(newUrls);

      // Pass computed arrays to updateData
      updateData({
        photos: newUrls,
      });
    }

    setUploading(false);
  };

  const removePhoto = (index: number) => {
    // Compute filtered array first
    const newUrls = photoUrls.filter((_, i) => i !== index);

    // Update state
    setPhotoUrls(newUrls);

    // Pass computed array to updateData
    updateData({
      photos: newUrls,
    });
  };

  return (
    <div className="w-full bg-white">
      <div className="flex flex-col items-center w-full p-4">
        <Title title="Complete Your Profile" subTitle="Tell us more about you." />
        <Stepper currentStep="2" />

        {/* Profile Icon */}
        <div className="flex items-center gap-4 mt-6">
          <label className="cursor-pointer">
            {iconUrl ? (
              <img
                src={iconUrl}
                alt="icon"
                className="w-[120px] h-[120px] rounded-full object-cover bg-gray-300"
              />
            ) : (
              <div className="w-[120px] h-[120px] rounded-full bg-gray-300 flex justify-center items-center text-2xl text-gray-600">
                +
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && uploadFiles(e.target.files, "icon")}
              disabled={uploading}
            />
          </label>
          <button
            className="bg-black text-white px-6 py-3 rounded-lg font-medium border-none cursor-pointer"
            onClick={() =>
              document.querySelector<HTMLInputElement>('input[type="file"]')?.click()
            }
          >
            Upload Your Icon
          </button>
        </div>

        {/* Photos Upload */}
        <div className="mt-8 text-left w-full max-w-[420px]">
          <h2 className="text-base font-bold mb-3">Upload Photos (4 maximum)</h2>

          <div className="grid grid-cols-[3fr_1fr] gap-4 items-stretch">
            {/* Left: main large photo */}
            <label
              className="relative bg-gray-300 rounded-[10px] overflow-hidden aspect-square cursor-pointer w-full h-full"
            >
              {photoUrls[0] ? (
                <>
                  <img
                    src={photoUrls[0]}
                    alt="main-photo"
                    className="w-full h-full object-cover block"
                  />
                  <button
                    className="absolute top-1.5 right-1.5 bg-black/60 text-white border-none rounded-full w-6 h-6 text-sm cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      removePhoto(0);
                    }}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex justify-center items-center text-gray-600 text-3xl">
                  +
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && uploadFiles(e.target.files, "photos", 0)}
                disabled={uploading}
              />
            </label>

            {/* Right: 3 stacked small square photos */}
            <div className="flex flex-col justify-between gap-4">
              {[1, 2, 3].map((i) => (
                <label
                  key={i}
                  className="relative bg-gray-300 rounded-[10px] overflow-hidden aspect-square cursor-pointer"
                >
                  {photoUrls[i] ? (
                    <>
                      <img
                        src={photoUrls[i]}
                        alt={`photo-${i}`}
                        className="w-full h-full object-cover block"
                      />
                      <button
                        className="absolute top-1.5 right-1.5 bg-black/60 text-white border-none rounded-full w-[22px] h-[22px] text-[13px] cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          removePhoto(i);
                        }}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex justify-center items-center text-gray-600 text-2xl">
                      +
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && uploadFiles(e.target.files, "photos", i)
                    }
                    disabled={uploading}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Nav buttons */}
        <div className="flex flex-col gap-4 justify-between w-full max-w-[400px] mt-8">
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
