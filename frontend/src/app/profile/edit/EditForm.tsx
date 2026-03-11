'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { profileEditSchema, profilePatchSchema } from '@/app/schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import InputForm from '@/app/components/InputForm'
import InputFormSelect from '@/app/components/InputFormSelect'
import LocationField from '@/app/components/LocationField'
import NextButton from '@/app/components/Buttons/NextButton'
import TagSelector from '@/app/components/TagSelector'
import AvatarUploader from '@/app/components/AvatarUploader'
import PhotoGridUploader from '@/app/components/PhotoGridUploader'
import { toast } from 'sonner'
import { apiFetch } from '@/utils/apiClient'

interface Tag {
  id: number
  name: string
  category: string
}

type UserProfile = {
  firstName: string
  lastName: string
  birthday: string
  location: string
  latitude: number
  longitude: number
  gender: 'male' | 'female'
  lookingFor: 'male' | 'female' | 'both'
  description: string
  curiousAbout: number[]
  iconUrl: string | null
  photoUrls: string[]
}

type ProfileEditSchema = z.infer<typeof profileEditSchema>

export default function EditForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ProfileEditSchema>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      // set default values here
      firstName: '',
      lastName: '',
      location: '',
      latitude: 0,
      longitude: 0
    }
  })
  const selectedTags = watch('curiousAbout') || []

  useEffect(() => {
    async function loadProfile() {
      try {
        const user: UserProfile = await apiFetch('/api/users/me')

        reset({
          firstName: user.firstName,
          lastName: user.lastName,
          birthday: user.birthday,
          location: user.location,
          latitude: user.latitude,
          longitude: user.longitude,
          gender: user.gender,
          lookingFor: user.lookingFor,
          description: user.description,
          curiousAbout: user.curiousAbout,
          iconUrl: user.iconUrl,
          photoUrls: user.photoUrls
        })

        console.log('user', user)
      } catch (err) {
        const errMsg = err ?? ''
        toast.error('Error fetching tags ', errMsg)
      }
    }
    loadProfile()
  }, [reset])

  const onSubmit = async (data: ProfileEditSchema) => {
    console.log('submit', data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputForm
        label="firstName"
        type="text"
        error={errors.firstName}
        {...register('firstName')}
      />
      <InputForm label="lastName" type="text" error={errors.lastName} {...register('lastName')} />
      <InputForm label="birthday" type="date" error={errors.birthday} {...register('birthday')} />
      {/* <LocationField
        location={watch('location')}
        latitude={watch('latitude')}
        longitude={watch('longitude')}
        onChange={(loc, lat, lon) => {
          setValue('location', loc)
          setValue('latitude', lat)
          setValue('longitude', lon)
        }}
      /> */}
      <InputFormSelect
        label="Gender"
        error={errors.gender}
        options={[
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' }
        ]}
        {...register('gender')}
      />
      <InputFormSelect
        label="LookingFor"
        error={errors.lookingFor}
        options={[
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Both', value: 'both' }
        ]}
        {...register('lookingFor')}
      />
      <InputForm
        label="Description"
        type="text"
        error={errors.description}
        {...register('description')}
      />
      <TagSelector
        selectedTags={selectedTags}
        error={errors.curiousAbout}
        onChange={(selectedIds) => setValue('curiousAbout', selectedIds)}
      />
      <AvatarUploader initialUrl={watch('iconUrl')} onChange={(url) => setValue('iconUrl', url)} />
      <PhotoGridUploader
        photoUrls={watch('photoUrls') ?? ['', '', '', '']}
        onChange={(urls) => setValue('photoUrls', urls)}
      />
      <NextButton text="Submit" type="submit" />
    </form>
  )
}
