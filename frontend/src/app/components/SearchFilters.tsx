import React, { useState, useEffect } from 'react'
import InputFormMultiSelect from './InputFormMultiSelect'
import { mdiChevronDown, mdiChevronUp } from '@mdi/js'
import Icon from '@mdi/react'

interface Tag {
  id: number
  name: string
  category: string
}

export interface FilterState {
  ageMin?: number
  ageMax?: number
  distanceMax?: number
  fameMin?: number
  fameMax?: number
  tagIds: number[]
  sortBy: string
}

interface SearchFiltersProps {
  availableTags: Tag[]
  filters: FilterState
  onChange: (newFilters: FilterState) => void
}

const SearchFilters = ({ availableTags, filters, onChange }: SearchFiltersProps) => {
  const [showTags, setShowTags] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  // Sync local state if filters change externally (e.g. reset button)
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Update only local state (no reload yet)
  const handleLocalChange = (
    key: keyof FilterState,
    value: number | number[] | string | undefined
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Commit changes to parent (triggers reload)
  const handleCommit = () => {
    onChange(localFilters)
  }

  // Handle Enter key to commit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommit()
      ;(e.target as HTMLInputElement).blur() // Remove focus to reflect "done" state
    }
  }

  // Update immediately for Select and Tags (triggers reload)
  const handleImmediateChange = (
    key: keyof FilterState,
    value: number | number[] | string | undefined
  ) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onChange(newFilters)
  }

  const handleTagChange = (selectedIds: number[]) => {
    handleImmediateChange('tagIds', selectedIds)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end flex-wrap">
        {/* Age Range */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Age</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              className="w-20 p-2 border rounded-md text-sm"
              value={localFilters.ageMin || ''}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              onChange={(e) =>
                handleLocalChange('ageMin', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={handleCommit}
              onKeyDown={handleKeyDown}
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              className="w-20 p-2 border rounded-md text-sm"
              value={localFilters.ageMax || ''}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              onChange={(e) =>
                handleLocalChange('ageMax', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={handleCommit}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Distance */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Distance (km)</label>
          <input
            type="number"
            placeholder="Max"
            className="w-24 p-2 border rounded-md text-sm"
            value={localFilters.distanceMax || ''}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            onChange={(e) => {
              const val = Number(e.target.value)
              // If val is 0 (or NaN/empty), set to undefined to remove the filter
              handleLocalChange('distanceMax', val > 0 ? val : undefined)
            }}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Fame Rating */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Fame Rating</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              className="w-20 p-2 border rounded-md text-sm"
              value={localFilters.fameMin || ''}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              onChange={(e) =>
                handleLocalChange('fameMin', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={handleCommit}
              onKeyDown={handleKeyDown}
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              className="w-20 p-2 border rounded-md text-sm"
              value={localFilters.fameMax || ''}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              onChange={(e) =>
                handleLocalChange('fameMax', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={handleCommit}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Sort By</label>
          <select
            className="w-40 p-2 border rounded-md text-sm bg-white"
            value={localFilters.sortBy}
            onChange={(e) => handleImmediateChange('sortBy', e.target.value)}
          >
            <option value="distance-asc">Distance</option>
            <option value="fame-desc">Fame Rating</option>
            <option value="age-asc">Youngest</option>
            <option value="age-desc">Oldest</option>
            <option value="common-desc">Common Interests</option>
          </select>
        </div>

        {/* Tags Toggle */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Tags</label>
          <button
            onClick={() => setShowTags(!showTags)}
            className="flex items-center justify-between gap-2 w-40 p-2 border rounded-md text-sm bg-white hover:bg-gray-50 text-left"
          >
            <span className="truncate">
              {localFilters.tagIds.length > 0
                ? `${localFilters.tagIds.length} selected`
                : 'Select Tags'}
            </span>
            <Icon path={showTags ? mdiChevronUp : mdiChevronDown} size={0.8} />
          </button>
        </div>
      </div>

      {/* Tags section - collapsible */}
      {showTags && (
        <div className="mt-4 border-t pt-4">
          <InputFormMultiSelect
            label=""
            tags={availableTags}
            selectedTags={localFilters.tagIds}
            onChange={handleTagChange}
          />
        </div>
      )}
    </div>
  )
}

export default SearchFilters
