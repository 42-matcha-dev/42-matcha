'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

interface Props {
  initialUrl: string | null
  onChange?: (url: string) => void
}

export default function AvatarUploader({ initialUrl, onChange }: Props) {
  const [iconUrl, setIconUrl] = useState<string | null>(initialUrl)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIconUrl(initialUrl ?? null)
  }, [initialUrl])

  const uploadImage = async (file: File) => {
    if (!file) return
    setUploading(true)

    const formData = new FormData();
    formData.append('image', file)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images/avatar`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      const { url } = await res.json();

      setIconUrl(url)
      onChange?.(url)
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className="cursor-pointer"
        onClick={() => {
          if (!uploading) inputRef.current!.click()
        }}
      >
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt="icon"
            width={128}
            height={128}
            className="w-32 h-32 rounded-full object-cover bg-gray-300"
            unoptimized
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-300 flex justify-center items-center text-2xl text-gray-600">
            +
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadImage(file)
          }}
          disabled={uploading}
        />
      </div>
      <button
        type="button"
        className="bg-black text-white px-6 py-3 rounded-lg font-medium border-none cursor-pointer"
        onClick={() => {
          if (!uploading) inputRef.current!.click()
        }}
      >
        Upload Icon
      </button>
    </div>
  )
}
