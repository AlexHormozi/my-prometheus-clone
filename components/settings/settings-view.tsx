'use client'

import { useEffect, useState } from 'react'
import { ProfileForm } from './profile-form'
import { PartnershipCard } from './partnership-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Bell } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  email: string
  display_name?: string
}

interface Partnership {
  status: 'pending' | 'active'
  partnerEmail?: string
  partnerName?: string
}

export function SettingsView() {
  const [user, setUser] = useState<User | null>(null)
  const [partnership, setPartnership] = useState<Partnership | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, partnerRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/partnership'),
        ])

        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        }

        if (partnerRes.ok) {
          const partnerData = await partnerRes.json()
          setPartnership(partnerData)
        }
      } catch (error) {
        console.error('Failed to fetch settings data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export')
      if (!response.ok) throw new Error('Failed to export data')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prometheus-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Export complete',
        description: 'Your data has been downloaded successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {user && (
        <ProfileForm
          initialDisplayName={user.display_name}
          email={user.email}
        />
      )}

      <PartnershipCard partnership={partnership} />

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how you receive updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Bell className="h-5 w-5" />
            <p className="text-sm">Notification settings coming soon</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>Download all your journal entries and photos</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export My Data
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
          <CardDescription>Quick navigation shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Journal</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">J</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Compare</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">C</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dashboard</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">D</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Settings</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">S</kbd>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
