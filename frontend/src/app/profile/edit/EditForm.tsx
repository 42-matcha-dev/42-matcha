'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { profileEditSchema } from '@/app/schema'
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
import { getCookie, deleteCookie } from '@/utils/cookie.util'
import { getArrayFieldError } from '@/utils/getArrayError'
import { normalizePhotoUrls, compactPhotoUrls } from '@/utils/photo.utils'

interface Tag {
  id: number
  name: string
  category: string
}

type UserProfile = {
  username: string
  firstName: string
  lastName: string
  birthday: string
  location: string
  latitude: number
  longitude: number
  gender: 'male' | 'female'
  lookingFor: '' | 'male' | 'female' | 'both'
  description: string
  tags: Tag[]
  iconUrl: string
  photoUrls: string[]
}

type ProfileEditSchema = z.infer<typeof profileEditSchema>

export default function EditForm() {
  const router = useRouter()
  const [currentUsername, setCurrentUsername] = useState<string>('')
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
      firstName: '',
      lastName: '',
      location: '',
      latitude: 0,
      longitude: 0,
      iconUrl: ''
    }
  })
  const selectedTags = watch('curiousAbout') || []

  useEffect(() => {
    async function loadProfile() {
      try {
        const user: UserProfile = await apiFetch('/api/users/me')
        setCurrentUsername(user.username ?? '')

        reset({
          firstName: user.firstName,
          lastName: user.lastName,
          birthday: user.birthday?.split('T')[0],
          location: user.location ?? '',
          latitude: user.latitude ?? 0,
          longitude: user.longitude ?? 0,
          locationVerified: true,
          gender: user.gender,
          lookingFor: user.lookingFor,
          description: user.description,
          curiousAbout: user.tags.map((tag: Tag) => tag.id) ?? [],
          iconUrl: user.iconUrl ?? '',
          photoUrls: normalizePhotoUrls(user.photoUrls)
        })
      } catch (err) {
        const errMsg = err ?? ''
        toast.error('Error fetching tags ', errMsg)
      }
    }
    loadProfile()
  }, [reset])

  const onSubmit = async (data: ProfileEditSchema) => {
    try {
      const token = getCookie('token')
      if (!token) {
        router.push('/login')
        return
      }

      const { locationVerified, username, ...rest } = data

      const cleanedData = {
        ...rest,
        ...(username ? { username } : {}),
        lookingFor: data.lookingFor === '' ? 'both' : data.lookingFor,
        photoUrls: compactPhotoUrls(data.photoUrls)
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/api/users/me`, {
        method: 'PATCH',
        body: JSON.stringify(cleanedData),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          deleteCookie('token')
          router.push('/login')
          return
        }
        const errorData = await response.json()
        if (response.status === 409) {
          toast.error(errorData?.error || 'Username is already taken')
          return
        }
        // Validation errors
        if (errorData?.fields) {
          toast.error(Object.values(errorData.fields)[0] as string)
          return
        }

        // Other backend errors
        toast.error(errorData?.error || 'Failed to update profile')
        return
      }

      toast.success('profile updated')
    } catch {
      toast.error('Error updating profile')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto flex flex-col gap-8 pb-16">
      <h1 className="text-3xl font-bold text-black">Edit Profile</h1>

      {/* Photos */}
      <PhotoGridUploader
        photoUrls={watch('photoUrls') ?? ['', '', '', '']}
        onChange={(urls) => setValue('photoUrls', normalizePhotoUrls(urls))}
        error={getArrayFieldError(errors.photoUrls)}
      />

      {/* Basic info */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <InputForm
            label="Username"
            type="text"
            error={errors.username}
            {...register('username')}
          />
          <p className="text-sm text-gray-400">
            {currentUsername
              ? `Current: @${currentUsername} — leave blank to keep it`
              : 'Leave blank to keep your current username'}
          </p>
        </div>

        <InputForm
          label="First name"
          type="text"
          error={errors.firstName}
          {...register('firstName')}
        />

        <InputForm
          label="Last name"
          type="text"
          error={errors.lastName}
          {...register('lastName')}
        />

        <InputForm label="Birthday" type="date" error={errors.birthday} {...register('birthday')} />
      </div>

      {/* Location */}
      <LocationField
        location={watch('location') ?? ''}
        latitude={watch('latitude') ?? 0}
        longitude={watch('longitude') ?? 0}
        error={errors.locationVerified ?? errors.location}
        onChange={(loc, lat, lon) => {
          setValue('location', loc)
          setValue('latitude', lat)
          setValue('longitude', lon)
          setValue('locationVerified', lat !== 0 && lon !== 0)
        }}
      />

      {/* Preferences */}
      <div className="grid grid-cols-2 gap-4">
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
          label="Looking for"
          error={errors.lookingFor}
          options={[
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Both', value: 'both' }
          ]}
          {...register('lookingFor')}
        />
      </div>

      {/* Bio */}
      <InputForm
        label="Description"
        type="text"
        error={errors.description}
        {...register('description')}
      />

      {/* Tags */}
      <TagSelector
        selectedTags={selectedTags}
        error={errors.curiousAbout}
        onChange={(selectedIds) => setValue('curiousAbout', selectedIds)}
      />

      {/* Avatar */}
      <AvatarUploader
        initialUrl={watch('iconUrl')}
        onChange={(url) => setValue('iconUrl', url)}
        error={errors.iconUrl?.message}
      />

      {/* Submit */}
      <NextButton text="Save Profile" type="submit" />
    </form>
  )
}
