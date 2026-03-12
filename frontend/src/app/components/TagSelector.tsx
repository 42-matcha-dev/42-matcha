"use client"

import { useEffect, useState } from 'react'
import InputFormMultiSelect from './InputFormMultiSelect'
import { FieldError } from 'react-hook-form'
import { toast } from 'sonner'

interface Tag {
  id: number
  name: string
  category: string
}

interface TagSelectorProps {
  selectedTags: number[]
  error?: FieldError | { message?: string }
  onChange: (selectedIds: number[]) => void
}

export default function TagSelector({ selectedTags, error, onChange }: TagSelectorProps) {
  const [loading, setLoading] = useState(true)
  const [tags, setTags] = useState<Tag[]>([])

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
        const errMsg = error ?? "";
        toast.error('Error fetching tags ', errMsg);
      } finally {
        setLoading(false)
      }
    }
    fetchTags()
  }, [])

  return (
    <>
      {loading ? (
        <div>Loading tags...</div>
      ) : (
        <InputFormMultiSelect
          label="Your interests"
          error={error}
          tags={tags}
          selectedTags={selectedTags}
          onChange={onChange}
        />
      )}
    </>
  )
}
