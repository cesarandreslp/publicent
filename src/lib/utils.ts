import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Para fechas date-only ('YYYY-MM-DD') devuelve un Date al mediodía UTC del día
 * indicado. El formateo posterior se fija en `timeZone: 'UTC'` para que el día
 * impreso coincida en SSR (Vercel UTC) y cliente (Bogotá UTC-5).
 *
 * Si entra un Date o un ISO completo con hora, se respeta tal cual y el
 * formateo usa America/Bogota (caso típico: timestamps de la BD).
 */
function parseDateSafe(date: Date | string): { date: Date; dateOnly: boolean } {
  if (date instanceof Date) return { date, dateOnly: false }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (m) {
    return {
      date: new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0)),
      dateOnly: true,
    }
  }
  return { date: new Date(date), dateOnly: false }
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const { date: d, dateOnly } = parseDateSafe(date)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: dateOnly ? 'UTC' : 'America/Bogota',
    ...options,
  }
  return d.toLocaleDateString('es-CO', defaultOptions)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
