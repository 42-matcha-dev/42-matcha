'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import Header from '@/app/components/Header'
import UserCard, { SearchUser } from '@/app/components/UserCard'
import SearchFilters, { FilterState } from '@/app/components/SearchFilters'
import Pagination from '@/app/components/Pagination'
import { getCookie, deleteCookie } from '@/utils/cookie.util'

interface Tag {
  id: number
  name: string
  category: string
}

interface SearchResponse {
  results: SearchUser[]
  totalCount: number
}

export default function Search() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Helper to parse URL params into FilterState
  const getInitialFilters = useCallback((): FilterState => {
    const params = searchParams
    return {
      ageMin: params.get('ageMin') ? Number(params.get('ageMin')) : undefined,
      ageMax: params.get('ageMax') ? Number(params.get('ageMax')) : undefined,
      distanceMax: params.get('distanceMax') ? Number(params.get('distanceMax')) : 30,
      fameMin: params.get('fameMin') ? Number(params.get('fameMin')) : undefined,
      fameMax: params.get('fameMax') ? Number(params.get('fameMax')) : undefined,
      tagIds: params.get('tags') ? params.get('tags')!.split(',').map(Number) : [],
      sortBy: params.get('sortBy') || 'distance'
    }
  }, [searchParams])

  const getInitialPage = useCallback(() => {
    const pageParam = searchParams.get('page')
    return pageParam ? Number(pageParam) : 0
  }, [searchParams])

  const [users, setUsers] = useState<SearchUser[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Filter State initialized from URL
  const [filters, setFilters] = useState<FilterState>(getInitialFilters)
  const [page, setPage] = useState(getInitialPage)

  const PAGE_SIZE = 20

  // Sync URL with State
  const updateURL = useCallback(
    (currentFilters: FilterState, currentPage: number) => {
      const params = new URLSearchParams()
      if (currentFilters.ageMin !== undefined)
        params.set('ageMin', currentFilters.ageMin.toString())
      if (currentFilters.ageMax !== undefined)
        params.set('ageMax', currentFilters.ageMax.toString())
      if (currentFilters.distanceMax !== undefined)
        params.set('distanceMax', currentFilters.distanceMax.toString())
      if (currentFilters.fameMin !== undefined)
        params.set('fameMin', currentFilters.fameMin.toString())
      if (currentFilters.fameMax !== undefined)
        params.set('fameMax', currentFilters.fameMax.toString())
      if (currentFilters.tagIds.length > 0) params.set('tags', currentFilters.tagIds.join(','))
      if (currentFilters.sortBy) params.set('sortBy', currentFilters.sortBy)

      if (currentPage > 0) params.set('page', currentPage.toString())

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router]
  )

  // Fetch Tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const token = getCookie('token')
        if (!token) return // will be handled by fetchUsers redirect

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setAvailableTags(data)
        }
      } catch (err) {
        console.error('Failed to fetch tags', err)
      }
    }
    fetchTags()
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const token = getCookie('token')
      if (!token) {
        router.push('/login')
        return
      }

      const params = new URLSearchParams()
      if (filters.ageMin !== undefined) params.append('ageMin', filters.ageMin.toString())
      if (filters.ageMax !== undefined) params.append('ageMax', filters.ageMax.toString())
      if (filters.distanceMax !== undefined)
        params.append('distanceMax', filters.distanceMax.toString())
      if (filters.fameMin !== undefined) params.append('fameMin', filters.fameMin.toString())
      if (filters.fameMax !== undefined) params.append('fameMax', filters.fameMax.toString())
      if (filters.tagIds.length > 0) params.append('tags', filters.tagIds.join(','))

      params.append('page', page.toString())
      params.append('limit', PAGE_SIZE.toString())

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/search?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          deleteCookie('token')
          router.push('/login')
          return
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch users')
      }

      const data: SearchResponse = await response.json()
      setUsers(data.results)
      setTotalCount(data.totalCount)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters, page, router])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL(filters, page)
      fetchUsers()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [fetchUsers, filters, page, updateURL])

  return (
    <main className="flex flex-col h-screen bg-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Search</h1>
            </div>

            <SearchFilters
              availableTags={availableTags}
              filters={filters}
              onChange={(newFilters) => {
                setFilters(newFilters)
                setPage(0)
              }}
            />

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-10">{error}</div>
            ) : (
              <>
                {users.length === 0 ? (
                  <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm p-8">
                    <p className="text-xl font-semibold mb-2">No matches found</p>
                    <p>Try adjusting your filters to find more people.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 justify-items-center">
                    {users.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                )}

                <Pagination
                  currentPage={page}
                  totalItems={totalCount}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
