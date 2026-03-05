"use client";

import { Suspense, useEffect, useState } from "react";
import { z } from "zod";
import { registerSchema } from "@/app/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/app/components/Title";
import InputForm from "@/app/components/InputForm";
import NextButton from "@/app/components/Buttons/NextButton";
import Stepper from "@/app/components/Stepper";
import Image from "next/image";

const registerBasicSchema = registerSchema.pick({
    firstName: true,
    lastName: true,
    birthday: true,
    location: true,
    latitude: true,
    longitude: true
});

type RegisterBasicSchema = z.infer<typeof registerBasicSchema>;

interface Props {
  onNext: () => void;
  updateData: (data: Partial<RegisterBasicSchema>) => void;
  defaultValues: Partial<RegisterBasicSchema>;
}

function RegisterBasicFormContent({ onNext, updateData, defaultValues }: Props) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [lastVerifiedLocation, setLastVerifiedLocation] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch} = useForm<RegisterBasicSchema>({
      resolver: zodResolver(registerBasicSchema),
      mode: "onBlur",
      defaultValues: {
          firstName: defaultValues.firstName || "",
          lastName: defaultValues.lastName || "",
          birthday: defaultValues.birthday || "",
          location: defaultValues.location || "",
          latitude: defaultValues.latitude || 0,
          longitude: defaultValues.longitude || 0
      }
  });

  const currentLocation = watch("location");
  const currentLatitude = watch("latitude");
  const currentLongitude = watch("longitude");
  const currentFirstName = watch("firstName");
  const currentLastName = watch("lastName");
  const currentBirthday = watch("birthday");

  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        setValue(key as keyof RegisterBasicSchema, value as RegisterBasicSchema[keyof RegisterBasicSchema]);
      });
    }
  }, [defaultValues, setValue]);

  // Sync lastVerifiedLocation when we have valid coordinates and location text
  useEffect(() => {
    if (currentLocation && currentLatitude !== 0 && currentLongitude !== 0 && !lastVerifiedLocation) {
      // If we have valid coordinates but no verified location yet, mark it as verified
      // This handles the case when form is pre-filled with valid data
      setLastVerifiedLocation(currentLocation);
    }
  }, [currentLocation, currentLatitude, currentLongitude, lastVerifiedLocation]);

  useEffect(() => {
    if (lastVerifiedLocation && currentLocation !== lastVerifiedLocation) {
      setLastVerifiedLocation(null);
      setValue("latitude", 0, { shouldValidate: false});
      setValue("longitude", 0, { shouldValidate: false});
    }
  }, [currentLocation])

  // Forward geocode location text to get lat/lon when user manually enters location
  const geocodeLocation = async (locationText: string) => {
    if (!locationText || locationText.trim().length < 3) {
      return; // Don't geocode if location is too short
    }

    setGeocodingLoading(true);
    setGpsError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${apiUrl}/api/geocoding/forward?q=${encodeURIComponent(locationText)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to geocode location.");
      }

      const data = await response.json();

      if (data.latitude && data.longitude) {
        // Use shouldValidate: false to prevent triggering validation for other fields
        setValue("latitude", data.latitude, { shouldValidate: false });
        setValue("longitude", data.longitude, { shouldValidate: false });
        // Update location with the normalized address from geocoding
        const verifiedAddress = data.display_name || locationText;
        setValue("location", verifiedAddress, { shouldValidate: false });
        // Store the verified location
        setLastVerifiedLocation(verifiedAddress);
      } else {
        throw new Error("Invalid coordinates returned from geocoding service.");
      }
    } catch (error) {
      setGpsError(error instanceof Error ? error.message : "Failed to geocode location.");
    } finally {
      setGeocodingLoading(false);
    }
  };

  const handleEnableGPS = async () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocode using backend API
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const response = await fetch(
            `${apiUrl}/api/geocoding/reverse?lat=${latitude}&lon=${longitude}`
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch address from geocoding service.");
          }

          const data = await response.json();
          if (!data.address) {
            throw new Error("Could not determine address from location.");
          }

          // Update form values with shouldValidate: false to prevent triggering validation for other fields
          setValue("location", data.address, { shouldValidate: false });
          setValue("latitude", data.latitude, { shouldValidate: false });
          setValue("longitude", data.longitude, { shouldValidate: false });
          // Store the verified location
          setLastVerifiedLocation(data.address);
          setGpsLoading(false);
        } catch (error) {
          setGpsError(error instanceof Error ? error.message : "Failed to get address from location.");
          setGpsLoading(false);
        }
      },
      (error) => {
        let errorMessage = "Failed to get your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setGpsError(errorMessage);
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const onSubmit = async (data: RegisterBasicSchema) => {
    // Validate coordinates are not 0,0
    if (data.latitude === 0 && data.longitude === 0) {
      setGpsError("Please verify your location before continuing.");
      return;
    }

    updateData(data);
    console.log("RegisterBasicForm: ", data);
    onNext();
  };

  return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-left w-full m-7 gap-11">
          <Title title="Complete Your Profile" subTitle="Tell us more about you."/>
          <Stepper currentStep="0" />
          <InputForm label="firstName" type="text" error={errors.firstName} {...register("firstName")}/>
          <InputForm label="lastName" type="text" error={errors.lastName}{...register("lastName")}/>
          <InputForm label="birthday" type="date" error={errors.birthday}{...register("birthday")} />
          <div className="flex flex-col gap-2 w-full max-w-md">
            <div className="flex flex-row gap-2 w-full">
              <InputForm
                label="location"
                type="text"
                error={errors.location}
                {...register("location")}
              />
              <button
                type="button"
                onClick={() => geocodeLocation(currentLocation)}
                disabled={!currentLocation || geocodingLoading}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 underline self-start disabled:opacity-50"
              >
                {geocodingLoading ? "Verifying location..." : "Verify location"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleEnableGPS}
              disabled={gpsLoading || geocodingLoading}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 underline self-start disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src="/icons/location.svg"
                alt="Location icon"
                width={16}
                height={16}
                className="inline"
              />
              {gpsLoading ? "Getting location..." : geocodingLoading ? "Geocoding location..." : "Enable GPS"}
            </button>
            {lastVerifiedLocation && (
              <div className="text-green-600 text-sm">
                ✓ Verified: {lastVerifiedLocation}
              </div>
            )}
            {gpsError && (
              <div className="text-red-500 text-sm">{gpsError}</div>
            )}
          </div>

          <NextButton
            text="Next"
            disabled={
              gpsLoading ||
              geocodingLoading ||
              !lastVerifiedLocation ||
              currentLocation !== lastVerifiedLocation ||
              currentLatitude === 0 ||
              currentLongitude === 0 ||
              !currentFirstName ||
              !currentLastName ||
              !currentBirthday ||
              !!errors.firstName ||
              !!errors.lastName ||
              !!errors.birthday ||
              !!errors.location
            }
          />
      </form>
  );
}

export default function RegisterBasicForm(props: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterBasicFormContent {...props}/>
    </Suspense>
  );
}
