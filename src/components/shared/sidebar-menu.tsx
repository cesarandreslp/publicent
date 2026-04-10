'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

export interface SidebarMenuItem {
  label: string
  href: string
  icon?: React.ReactNode
  children?: SidebarMenuItem[]
}

interface SidebarMenuProps {
  title: string
  items: SidebarMenuItem[]
  className?: string
}

export function SidebarMenu({ title, items, className }: SidebarMenuProps) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  const hasActiveChild = (item: SidebarMenuItem): boolean => {
    if (isActive(item.href)) return true
    if (item.children) {
      return item.children.some(child => hasActiveChild(child))
    }
    return false
  }

  return (
    <nav className={cn('bg-white rounded-lg shadow-sm border', className)}>
      <h2 className="text-lg font-semibold text-white bg-gov-blue px-4 py-3 rounded-t-lg">
        {title}
      </h2>
      
      <ul className="py-2">
        {items.map((item, index) => (
          <li key={index}>
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                isActive(item.href)
                  ? 'bg-gov-blue/10 text-gov-blue font-medium border-l-4 border-gov-blue'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gov-blue border-l-4 border-transparent'
              )}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.children && item.children.length > 0 && (
                <ChevronRight className={cn(
                  'w-4 h-4 transition-transform',
                  hasActiveChild(item) && 'rotate-90'
                )} />
              )}
            </Link>
            
            {item.children && item.children.length > 0 && hasActiveChild(item) && (
              <ul className="bg-gray-50 py-1">
                {item.children.map((child, childIndex) => (
                  <li key={childIndex}>
                    <Link
                      href={child.href}
                      className={cn(
                        'flex items-center gap-2 pl-8 pr-4 py-2 text-sm transition-colors',
                        isActive(child.href)
                          ? 'text-gov-blue font-medium'
                          : 'text-gray-600 hover:text-gov-blue'
                      )}
                    >
                      {child.icon}
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
