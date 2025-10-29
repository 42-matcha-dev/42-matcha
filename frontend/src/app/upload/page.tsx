'use client'

import { useState, CSSProperties } from 'react'

type SignedUrlData = {
  signedUrl: string
  path: string
}

export default function UploadPage() {
  const [iconUrl, setIconUrl] = useState<string | null>(null)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  // 🔹 Helper: upload selected files (icon or photos)
  const uploadFiles = async (files: FileList, folder: 'icon' | 'photos') => {
    setUploading(true)
    const fileNames = Array.from(files).map(f => f.name)

    // Step 1: request signed URLs from backend
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileNames }),
    })
    const { urls }: { urls: SignedUrlData[] } = await res.json()

    // Step 2: upload directly to Supabase
    await Promise.all(
      Array.from(files).map((file, i) =>
        fetch(urls[i].signedUrl, { method: 'PUT', body: file })
      )
    )

    // Step 3: build public URLs
    const uploaded = urls.map(
      (u) =>
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-photos/${u.path}`
    )

    // Step 4: update state
    if (folder === 'icon') setIconUrl(uploaded[0])
    else setPhotoUrls(prev => [...prev, ...uploaded])

    setUploading(false)
  }

  // Basic inline CSS
  const styles: Record<string, CSSProperties> = {
    container: {
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem',
      fontFamily: 'system-ui, sans-serif',
    },
    title: { fontSize: '1.5rem', fontWeight: 600 },
    input: { border: '1px solid #ccc', padding: '0.5rem', borderRadius: '6px' },
    button: {
      backgroundColor: '#23B684',
      color: 'white',
      padding: '0.6rem 1.4rem',
      borderRadius: '8px',
      fontWeight: 500,
      border: 'none',
      cursor: 'pointer',
    },
    previewRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      justifyContent: 'center',
    },
    icon: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      objectFit: 'cover',
      boxShadow: '0 0 5px rgba(0,0,0,0.3)',
    },
    photo: {
      width: '150px',
      height: '150px',
      objectFit: 'cover',
      borderRadius: '10px',
      boxShadow: '0 0 4px rgba(0,0,0,0.2)',
    },
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Upload Profile</h1>

      {/* 🔹 Icon Upload */}
      <div>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Profile Icon</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && uploadFiles(e.target.files, 'icon')}
          style={styles.input}
          disabled={uploading}
        />
        {iconUrl && <img src={iconUrl} alt="icon" style={styles.icon} />}
      </div>

      {/* 🔹 Photos Upload */}
      <div>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Gallery Photos</h2>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && uploadFiles(e.target.files, 'photos')}
          style={styles.input}
          disabled={uploading}
        />
        <div style={styles.previewRow}>
          {photoUrls.map((url, idx) => (
            <img key={idx} src={url} alt={`photo-${idx}`} style={styles.photo} />
          ))}
        </div>
      </div>

      <button
        style={{
          ...styles.button,
          opacity: uploading ? 0.6 : 1,
          cursor: uploading ? 'not-allowed' : 'pointer',
        }}
        onClick={() => console.log('Form submitted with:', { iconUrl, photoUrls })}
      >
        Submit Profile
      </button>
    </main>
  )
}
