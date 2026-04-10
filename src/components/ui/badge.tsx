import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "secondary" | "destructive"
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors"
  const variants: Record<string, string> = {
    default:     "bg-gov-blue text-white",
    outline:     "border border-current bg-transparent",
    secondary:   "bg-gray-100 text-gray-700",
    destructive: "bg-red-100 text-red-700",
  }
  return <span className={`${base} ${variants[variant]} ${className}`} {...props} />
}
