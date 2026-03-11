'use client'

import { Suspense, useEffect, useState } from 'react'
import { z } from 'zod'
import { registerSchema } from '@/app/schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Title from '@/app/components/Title'
import InputForm from '@/app/components/InputForm'
import InputFormSelect from '@/app/components/InputFormSelect'
import InputFormMultiSelect from '@/app/components/InputFormMultiSelect'
import NextButton from '@/app/components/Buttons/NextButton'
import BackButton from '@/app/components/Buttons/BackButton'
import Stepper from '@/app/components/Stepper'

const registerSpecificSchema = registerSchema.pick({
  gender: true,
  lookingFor: true,
  description: true,
  curiousAbout: true
})

type RegisterSpecificSchema = z.infer<typeof registerSpecificSchema>

interface Props {
  onNext: () => void
  onBack: () => void
  updateData: (data: Partial<RegisterSpecificSchema>) => void
  defaultValues: Partial<RegisterSpecificSchema>
}

interface Tag {
  id: number
  name: string
  category: string
}

function RegisterSpecificFormContent({ onNext, onBack, updateData, defaultValues }: Props) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm<RegisterSpecificSchema>({
    resolver: zodResolver(registerSpecificSchema),
    mode: 'onBlur',
    defaultValues: {
      gender: defaultValues.gender || undefined,
      lookingFor: defaultValues.lookingFor || undefined,
      description: defaultValues.description || '',
      curiousAbout: defaultValues.curiousAbout || []
    }
  })

  const selectedTags = watch('curiousAbout') || []

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const response = await fetch(`${apiUrl}/api/tags`)
        if (!response.ok) {
          throw new Error('Failed to fetch tags')
        }
        const data = await response.json()
        setTags(data)
      } catch (error) {
        console.error('Error fetching tags:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTags()
  }, [])

  const onSubmit = (data: RegisterSpecificSchema) => {
    updateData(data)
    console.log('RegisterSpecificForm: ', data)
    onNext()
  }

  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        setValue(
          key as keyof RegisterSpecificSchema,
          value as RegisterSpecificSchema[keyof RegisterSpecificSchema]
        )
      })
    }
  }, [defaultValues, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-left w-full m-7 gap-12">
      <Title title="Complete Your Profile" subTitle="Tell us more about you." />
      <Stepper currentStep="1" />
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
      {loading ? (
        <div>Loading tags...</div>
      ) : (
        <InputFormMultiSelect
          label="CuriousAbout"
          error={errors.curiousAbout}
          tags={tags}
          selectedTags={selectedTags}
          onChange={(selectedIds) => setValue('curiousAbout', selectedIds)}
        />
      )}
      <div className="flex flex-col gap-4 justify-between w-full">
        <BackButton text="Back" onClick={onBack} />
        <NextButton text="Next" />
      </div>
    </form>
  )
}

export default function RegisterSpecificForm(props: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterSpecificFormContent {...props} />
    </Suspense>
  )
}
