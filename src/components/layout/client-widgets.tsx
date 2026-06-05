'use client'

import dynamic from 'next/dynamic'

const AccessibilityToolbar = dynamic(
  () => import('@/components/shared/AccessibilityToolbar').then(m => ({ default: m.AccessibilityToolbar })),
  { ssr: false }
)
const WhatsAppButton = dynamic(
  () => import('@/components/shared/WhatsAppButton').then(m => ({ default: m.WhatsAppButton })),
  { ssr: false }
)
const CookieConsent = dynamic(
  () => import('@/components/shared/CookieConsent').then(m => ({ default: m.CookieConsent })),
  { ssr: false }
)
const ChatWidget = dynamic(
  () => import('@/components/portal/ChatWidget').then(m => ({ default: m.ChatWidget })),
  { ssr: false }
)

interface Props {
  chatIaActivo?: boolean
  nombreEntidad?: string | null
}

export function ClientWidgets({ chatIaActivo, nombreEntidad }: Props) {
  return (
    <>
      <AccessibilityToolbar />
      <WhatsAppButton />
      <CookieConsent />
      {chatIaActivo && <ChatWidget nombreEntidad={nombreEntidad} />}
    </>
  )
}
