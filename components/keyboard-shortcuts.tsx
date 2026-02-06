'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function KeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isTyping = ['INPUT', 'TEXTAREA'].includes(target.tagName) ||
                      target.isContentEditable

      if (isTyping) return

      const key = event.key.toLowerCase()

      switch (key) {
        case 'j':
          event.preventDefault()
          router.push('/journal')
          break
        case 'c':
          event.preventDefault()
          router.push('/compare')
          break
        case 'd':
          event.preventDefault()
          router.push('/dashboard')
          break
        case 's':
          event.preventDefault()
          router.push('/settings')
          break
        case 'escape':
          const dialogs = document.querySelectorAll('[role="dialog"]')
          if (dialogs.length > 0) {
            const closeButton = dialogs[dialogs.length - 1].querySelector('[aria-label*="Close"]')
            if (closeButton) {
              (closeButton as HTMLButtonElement).click()
            }
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [router])

  return null
}
