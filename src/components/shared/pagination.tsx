'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  className?: string
}

export function Pagination({ currentPage, totalPages, baseUrl, className }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('...')
      }
      
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      
      pages.push(totalPages)
    }
    
    return pages
  }

  const getPageUrl = (page: number) => {
    return page === 1 ? baseUrl : `${baseUrl}?page=${page}`
  }

  if (totalPages <= 1) return null

  return (
    <nav aria-label="Paginación" className={cn('flex justify-center', className)}>
      <ul className="flex items-center gap-1">
        {/* Anterior */}
        <li>
          {currentPage > 1 ? (
            <Link
              href={getPageUrl(currentPage - 1)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gov-blue hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </span>
          )}
        </li>

        {/* Números de página */}
        {getPageNumbers().map((page, index) => (
          <li key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-400">...</span>
            ) : (
              <Link
                href={getPageUrl(page as number)}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg transition-colors',
                  page === currentPage
                    ? 'bg-gov-blue text-white font-medium'
                    : 'text-gray-600 hover:text-gov-blue hover:bg-gray-100'
                )}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </Link>
            )}
          </li>
        ))}

        {/* Siguiente */}
        <li>
          {currentPage < totalPages ? (
            <Link
              href={getPageUrl(currentPage + 1)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gov-blue hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Página siguiente"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 cursor-not-allowed">
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}
