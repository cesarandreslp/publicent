"use client"

import Link from "next/link"

export function GovBar() {
  return (
    <div className="bg-gov-blue text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-10 text-xs">
          <Link 
            href="https://www.gov.co" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <img 
              src="/images/govco.png" 
              alt="GOV.CO" 
              className="h-5 w-auto"
            />
            <span className="hidden sm:inline">Portal del Estado Colombiano</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/accesibilidad" 
              className="hover:underline"
              title="Opciones de accesibilidad"
            >
              <span className="sr-only">Accesibilidad</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="4" r="2"/>
                <path d="M12 6v14M8 8l4 2 4-2M8 20l4-4 4 4"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
