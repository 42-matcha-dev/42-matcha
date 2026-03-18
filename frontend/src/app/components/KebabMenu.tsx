'use client'

import { useState, useRef, useEffect } from 'react'

export type KebabMenuItem = {
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
}

type KebabMenuProps = {
  items: KebabMenuItem[]
}

export default function KebabMenu({ items }: KebabMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (items.length === 0) return null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        aria-label="More options"
      >
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="4" r="2" />
          <circle cx="10" cy="10" r="2" />
          <circle cx="10" cy="16" r="2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 min-w-[180px] py-1">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => { item.onClick(); setOpen(false) }}
              disabled={item.disabled}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 text-base font-medium ${item.className ?? 'text-gray-700'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
