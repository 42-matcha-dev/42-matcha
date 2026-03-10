'use client'

import { useState } from 'react'
import Image from 'next/image'

type SignedUrlData = {
  signedUrl: string
  path: string
}

interface Props {
  photoUrls: string[]
  onChange: (urls: string[]) => void
}
export default function PhotoGridUploader({ photoUrls, onChange }: Props) {
  const [uploading, setUploading] = useState(false)

  const uploadFiles = async (files: FileList, index: number) => {
    const file = files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileNames: [file.name] })
      })

      const { urls }: { urls: SignedUrlData[] } = await res.json()

      const { signedUrl, path } = urls[0]

      await fetch(signedUrl, {
        method: 'PUT',
        body: file
      })

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-photos/${path}`

      const newUrls = [...photoUrls]
      newUrls[index] = publicUrl
      onChange(newUrls)
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (index: number) => {
    const newUrls = photoUrls.filter((_, i) => i !== index);
    onChange(newUrls);
  }

  return (
    <div className="text-left w-full max-w-[420px]">
      <h2 className="text-base font-bold mb-3">Upload Photos (4 maximum)</h2>

      <div className="grid grid-cols-[3fr_1fr] gap-4 items-stretch">
        {/* Left: main large photo */}
        <label className="relative bg-gray-300 rounded-[10px] overflow-hidden aspect-square cursor-pointer w-full h-full">
          {photoUrls[0] ? (
            <>
              <Image
                src={photoUrls[0]}
                alt="main-photo"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                className="absolute top-1.5 right-1.5 bg-black/60 text-white border-none rounded-full w-6 h-6 text-sm cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  removePhoto(0)
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
            onChange={(e) => e.target.files && uploadFiles(e.target.files, 0)}
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
                  <Image
                    src={photoUrls[i]}
                    alt={`photo-${i}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    className="absolute top-1.5 right-1.5 bg-black/60 text-white border-none rounded-full w-[22px] h-[22px] text-[13px] cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault()
                      removePhoto(i)
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
                onChange={(e) => e.target.files && uploadFiles(e.target.files, i)}
                disabled={uploading}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
