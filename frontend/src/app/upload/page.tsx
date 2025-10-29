'use client'

import { useState, CSSProperties } from 'react'

type SignedUrlData = {
  signedUrl: string
  path: string
}

export default function ProfileUpload() {
  const [iconUrl, setIconUrl] = useState<string | null>(null)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  // Helper: upload selected files
  const uploadFiles = async (files: FileList, type: 'icon' | 'photos', index?: number) => {
    if (!files || files.length === 0) return
    setUploading(true)

    const fileNames = Array.from(files).map((f) => f.name)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileNames }),
    })
    const { urls }: { urls: SignedUrlData[] } = await res.json()

    await Promise.all(
      Array.from(files).map((file, i) =>
        fetch(urls[i].signedUrl, { method: 'PUT', body: file })
      )
    )

    const uploaded = urls.map(
      (u) =>
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-photos/${u.path}`
    )

    if (type === 'icon') setIconUrl(uploaded[0])
    else if (index !== undefined) {
      setPhotoUrls((prev) => {
        const newPhotos = [...prev]
        newPhotos[index] = uploaded[0]
        return newPhotos
      })
    }

    setUploading(false)
  }

  const removePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // Basic inline CSS
  const styles: Record<string, CSSProperties> = {
    container: {
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    title: { fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.3rem' },
    subtitle: { color: '#666', marginBottom: '1.5rem' },
    iconWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginTop: '1.5rem',
    },
    icon: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      objectFit: 'cover',
      background: '#ddd',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '0.8rem',
      color: '#777',
    },
    uploadBtn: {
      background: 'black',
      color: 'white',
      padding: '0.7rem 1.4rem',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 500,
      border: 'none',
    },
    photoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.8rem',
      marginTop: '1.2rem',
    },
    mainPhotoBox: {
      gridColumn: 'span 2',
      aspectRatio: '1 / 1',
      background: '#ddd',
      borderRadius: '10px',
      position: 'relative',
      overflow: 'hidden',
    },
    smallPhotoBox: {
      width: '140px',
      height: '140px',
      background: '#ddd',
      borderRadius: '10px',
      position: 'relative',
      overflow: 'hidden',
    },
    deleteBtn: {
      position: 'absolute',
      top: '6px',
      right: '6px',
      background: 'rgba(0,0,0,0.6)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      fontSize: '14px',
      cursor: 'pointer',
    },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    navRow: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: '400px',
      marginTop: '2rem',
    },
    navBtn: {
      flex: 1,
      padding: '0.8rem 0',
      fontSize: '1rem',
      borderRadius: '8px',
      border: '1px solid #000',
      background: 'white',
      cursor: 'pointer',
    },
    completeBtn: {
      flex: 1,
      marginLeft: '0.8rem',
      padding: '0.8rem 0',
      fontSize: '1rem',
      borderRadius: '8px',
      background: 'black',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
    },
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Complete your profile</h1>
      <p style={styles.subtitle}>Tell us more about you.</p>

      {/* Profile Icon */}
      <div style={styles.iconWrapper}>
        <label style={{ cursor: 'pointer' }}>
          {iconUrl ? (
            <img src={iconUrl} alt="icon" style={styles.icon} />
          ) : (
            <div style={styles.icon}>+</div>
          )}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && uploadFiles(e.target.files, 'icon')}
            disabled={uploading}
          />
        </label>
        <button
          style={styles.uploadBtn}
          onClick={() =>
            document.querySelector<HTMLInputElement>('input[type="file"]')?.click()
          }
        >
          Upload Your Icon
        </button>
      </div>

{/* 🔹 Photos Upload */}
<div style={{ marginTop: '2rem', textAlign: 'left', width: '100%', maxWidth: '420px' }}>
  <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.8rem' }}>
    Upload Photos (4 maximum)
  </h2>

  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '3fr 1fr', // 3:1 layout
      gap: '1rem',
      alignItems: 'stretch',
    }}
  >
    {/* Left: main large photo */}
    <label
      key={0}
      style={{
        position: 'relative',
        background: '#ddd',
        borderRadius: '10px',
        overflow: 'hidden',
        aspectRatio: '1 / 1',
        cursor: 'pointer',
        width: '100%',
        height: '100%',
      }}
    >
      {photoUrls[0] ? (
        <>
          <img
            src={photoUrls[0]}
            alt="main-photo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <button
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.preventDefault()
              removePhoto(0)
            }}
          >
            ✕
          </button>
        </>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#777',
            fontSize: '2rem',
          }}
        >
          +
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && uploadFiles(e.target.files, 'photos', 0)}
        disabled={uploading}
      />
    </label>

    {/* Right: 3 stacked small square photos */}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      {[1, 2, 3].map((i) => (
        <label
          key={i}
          style={{
            position: 'relative',
            background: '#ddd',
            borderRadius: '10px',
            overflow: 'hidden',
            aspectRatio: '1 / 1',
            cursor: 'pointer',
          }}
        >
          {photoUrls[i] ? (
            <>
              <img
                src={photoUrls[i]}
                alt={`photo-${i}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <button
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  background: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.preventDefault()
                  removePhoto(i)
                }}
              >
                ✕
              </button>
            </>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#777',
                fontSize: '1.5rem',
              }}
            >
              +
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && uploadFiles(e.target.files, 'photos', i)}
            disabled={uploading}
          />
        </label>
      ))}
    </div>
  </div>
</div>

      {/* Nav buttons */}
      <div style={styles.navRow}>
        <button style={styles.navBtn}>Back</button>
        <button style={styles.completeBtn}>Complete</button>
      </div>
    </main>
  )
}
