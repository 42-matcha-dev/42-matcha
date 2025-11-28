import React, { useState } from 'react'
import InputFormMultiSelect from './InputFormMultiSelect'
import { mdiFilterVariant, mdiChevronDown, mdiChevronUp } from '@mdi/js'
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

  const handleChange = (key: keyof FilterState, value: any) => {
    onChange({ ...filters, [key]: value })
  }

  const handleTagChange = (selectedIds: number[]) => {
    handleChange('tagIds', selectedIds)
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
              value={filters.ageMin || ''}
              onChange={(e) =>
                handleChange('ageMin', e.target.value ? Number(e.target.value) : undefined)
              }
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              className="w-20 p-2 border rounded-md text-sm"
              value={filters.ageMax || ''}
              onChange={(e) =>
                handleChange('ageMax', e.target.value ? Number(e.target.value) : undefined)
              }
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
            value={filters.distanceMax || ''}
            onChange={(e) =>
              handleChange('distanceMax', e.target.value ? Number(e.target.value) : undefined)
            }
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
              value={filters.fameMin || ''}
              onChange={(e) =>
                handleChange('fameMin', e.target.value ? Number(e.target.value) : undefined)
              }
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              className="w-20 p-2 border rounded-md text-sm"
              value={filters.fameMax || ''}
              onChange={(e) =>
                handleChange('fameMax', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Sort By</label>
          <select
            className="w-40 p-2 border rounded-md text-sm bg-white"
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
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
              {filters.tagIds.length > 0 ? `${filters.tagIds.length} selected` : 'Select Tags'}
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
            selectedTags={filters.tagIds}
            onChange={handleTagChange}
          />
        </div>
      )}
    </div>
  )
}

export default SearchFilters
