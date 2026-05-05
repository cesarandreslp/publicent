"use client"

import dynamic from "next/dynamic"

const AccessibilityToolbar = dynamic(
  () => import("@/components/shared/AccessibilityToolbar").then(m => ({ default: m.AccessibilityToolbar })),
  { ssr: false }
)
const WhatsAppButton = dynamic(
  () => import("@/components/shared/WhatsAppButton").then(m => ({ default: m.WhatsAppButton })),
  { ssr: false }
)
const CookieConsent = dynamic(
  () => import("@/components/shared/CookieConsent").then(m => ({ default: m.CookieConsent })),
  { ssr: false }
)

export function ClientWidgets() {
  return (
    <>
      <AccessibilityToolbar />
      <WhatsAppButton />
      <CookieConsent />
    </>
  )
}
