'use client'

import { Suspense, useState } from 'react'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { registerSchema } from '@/app/schema'
import { motion, AnimatePresence } from 'framer-motion'
import RegisterBasicForm from '@/app/components/SignupForms/RegisterBasicForm'
import RegisterSpecificForm from '@/app/components/SignupForms/RegisterSpecificForm'
import RegisterImagesForm from '@/app/components/SignupForms/RegisterImagesForm'
import { toast } from 'sonner'
import { compactPhotoUrls } from '@/utils/photo.utils'

const safeRegisterSchema = registerSchema.omit({
  email: true,
  password: true,
  repeatPassword: true
})

type FormData = z.infer<typeof safeRegisterSchema>

function RegisterFormStepperContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0) // 1 = next, -1 = back
  const [formData, setFormData] = useState<Partial<FormData>>({
    //Put default values here
    iconUrl: '',
    photoUrls: ['', '', '', '']
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const updateData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleSubmitFinal = async () => {
    try {
      if (!token) throw new Error('Missing token.')

      const parsedData = safeRegisterSchema.parse(formData)
      const submitData = {
        ...parsedData,
        photoUrls: compactPhotoUrls(parsedData.photoUrls)
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/api/auth/register?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })
      const data = await response.json()

      if (!response.ok) {
        // Backend validation errors
        if (data.fields) {
          setFormErrors(data.fields)
          toast.error(Object.values(data.fields)[0] as string)
          return
        }

        // Backend business error
        toast.error(data.error || 'Request failed')
        return
      }

      toast.success('Registration successful!')

      sessionStorage.removeItem('registerBasic')
      sessionStorage.removeItem('registerSpecific')

      router.push('/login')
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        err.issues.forEach((issue) => {
          const field = issue.path[0]
          if (field) {
            fieldErrors[field.toString()] = issue.message
          }
        })
        setFormErrors(fieldErrors)
        toast.error('Form is incomplete')
      } else {
        toast.error((err as Error).message || 'Something went wrong... Please try again later')
      }
    }
  }

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      position: 'absolute' as const
    }),
    center: {
      x: 0,
      opacity: 1,
      position: 'relative' as const
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      position: 'absolute' as const
    })
  }

  const handleNext = () => {
    setDirection(1)
    setCurrentStep((prev) => Math.min(prev + 1, 2))
  }

  const handleBack = () => {
    setDirection(-1)
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const steps = [
    <RegisterBasicForm
      key="basic"
      onNext={handleNext}
      updateData={updateData}
      defaultValues={formData}
    />,
    <RegisterSpecificForm
      key="specific"
      onNext={handleNext}
      onBack={handleBack}
      updateData={updateData}
      defaultValues={formData}
    />,
    <RegisterImagesForm
      key="images"
      onBack={handleBack}
      updateData={updateData}
      defaultValues={formData}
      onSubmitFinal={handleSubmitFinal}
      errors={formErrors}
    />
  ]

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[600px]">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          variants={variants}
          custom={direction}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
        >
          {steps[currentStep]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default function RegisterFormStepper() {
  return (
    <Suspense
      fallback={
        <div className="relative w-full max-w-md mx-auto min-h-[600px] flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <RegisterFormStepperContent />
    </Suspense>
  )
}
