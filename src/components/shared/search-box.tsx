'use client'

import { Search } from 'lucide-react'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SearchBoxProps {
  placeholder?: string
  searchUrl?: string
  className?: string
  onSearch?: (query: string) => void
}

export function SearchBox({
  placeholder = 'Buscar...',
  searchUrl = '/buscar',
  className,
  onSearch,
}: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      } else {
        router.push(`${searchUrl}?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <label htmlFor="search" className="sr-only">
        {placeholder}
      </label>
      <input
        type="search"
        id="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue outline-none transition-colors"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gov-blue transition-colors"
        aria-label="Buscar"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  )
}
