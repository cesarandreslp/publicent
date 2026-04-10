import { cn } from '@/lib/utils'
import { Breadcrumb, BreadcrumbItem } from './breadcrumb'

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbItems: BreadcrumbItem[]
  className?: string
  children?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  breadcrumbItems,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn('bg-gray-50 border-b', className)}>
      <div className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} className="py-4" />
        
        <div className="pb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-gray-600 max-w-3xl">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
