'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

type SignedUrlData = {
  signedUrl: string
  path: string
}

interface Props {
  initialUrl: string | null
  onChange?: (url: string) => void
}

export default function AvatarUploader({ initialUrl, onChange }: Props) {
  const [iconUrl, setIconUrl] = useState<string | null>(initialUrl)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setIconUrl(initialUrl ?? null)
  }, [initialUrl])

  const uploadFile = async (file: File) => {
    if (!file) return
    setUploading(true)

    const fileName = file.name
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileNames: [fileName] })
    })
    const { urls }: { urls: SignedUrlData[] } = await res.json()

    await fetch(urls[0].signedUrl, { method: 'PUT', body: file })

    const uploadedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-photos/${urls[0].path}`

    setIconUrl(uploadedUrl)
    onChange?.(uploadedUrl)

    setUploading(false)
  }

  return (
    <div className="flex items-center gap-4">
      <label className="cursor-pointer">
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt="icon"
            width={120}
            height={120}
            className="rounded-full object-cover bg-gray-300"
            unoptimized
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
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadFile(file)
          }}
          disabled={uploading}
        />
      </label>
      <button
        className="bg-black text-white px-6 py-3 rounded-lg font-medium border-none cursor-pointer"
        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
      >
        Upload Icon
      </button>
    </div>
  )
}
