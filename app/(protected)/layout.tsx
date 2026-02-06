import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <KeyboardShortcuts />
      {children}
    </>
  )
}
