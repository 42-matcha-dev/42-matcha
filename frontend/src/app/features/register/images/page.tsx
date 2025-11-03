"use client";

import { useState } from "react";
import Title from "@/app/components/Title";
import NextButton from "@/app/components/Buttons/NextButton";
import { useRouter, useSearchParams } from "next/navigation";
import BackButton from "@/app/components/Buttons/BackButton";
import Stepper from "@/app/components/Stepper";

type SignedUrlData = {
  signedUrl: string;
  path: string;
};

export default function RegisterImagesForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Helper: upload selected files
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

    if (type === "icon") setIconUrl(uploaded[0]);
    else if (index !== undefined) {
      setPhotoUrls((prev) => {
        const newPhotos = [...prev];
        newPhotos[index] = uploaded[0];
        return newPhotos;
      });
    }

    setUploading(false);
  };

  const removePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBack = () => {
    router.back();
  };

  const handleComplete = async () => {
    if (!token) {
      alert("Missing token. Please start registration from the email link.");
      return;
    }

    if (!iconUrl) {
      alert("Please upload a profile icon.");
      return;
    }

    if (photoUrls.length === 0) {
      alert("Please upload at least one photo.");
      return;
    }

    // Get form data from previous steps stored in sessionStorage
    const basicData = JSON.parse(sessionStorage.getItem("registerBasic") || "{}");
    const specificData = JSON.parse(sessionStorage.getItem("registerSpecific") || "{}");

    // Validate that we have all required data
    if (!basicData.firstName || !basicData.lastName || !basicData.location) {
      alert("Missing basic information. Please complete previous steps.");
      return;
    }

    if (!specificData.gender || !specificData.lookingFor || !specificData.description) {
      alert("Missing profile information. Please complete previous steps.");
      return;
    }

    setSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/auth/register?token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: basicData.firstName,
          lastName: basicData.lastName,
          gender: specificData.gender.toLowerCase(),
          lookingFor: specificData.lookingFor.toLowerCase(),
          description: specificData.description,
          location: basicData.location,
          iconImage: iconUrl,
          photos: photoUrls.filter((url) => url !== undefined && url !== null),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Registration error:", errorData);
        alert(`Registration failed: ${errorData.error || "Unknown error"}`);
        setSubmitting(false);
        return;
      }

      const result = await response.json();
      console.log("Registration successful:", result);

      // Clear session storage
      sessionStorage.removeItem("registerBasic");
      sessionStorage.removeItem("registerSpecific");

      // Redirect to success page or login
      router.push("/email-sent");
    } catch (error) {
      console.error("Registration request failed:", error);
      alert("Registration failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="w-1/2 min-h-screen bg-white text-black p-4 border">
      <div className="flex flex-col items-center w-full p-8">
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
          <BackButton text="Back" onClick={handleBack} />
          <NextButton text="Complete" onClick={handleComplete} disabled={submitting || uploading} />
        </div>
      </div>
    </div>
  );
}
