'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Users, UserX } from 'lucide-react'

interface PartnershipCardProps {
  partnership: {
    status: 'pending' | 'active'
    partnerEmail?: string
    partnerName?: string
  } | null
}

export function PartnershipCard({ partnership }: PartnershipCardProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/partnership/delete', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to disconnect partnership')

      toast({
        title: 'Partnership disconnected',
        description: 'You have successfully ended your partnership.',
      })

      window.location.reload()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect partnership. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partnership</CardTitle>
        <CardDescription>Manage your accountability partnership</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {partnership ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{partnership.partnerName || 'Partner'}</p>
                  <p className="text-sm text-muted-foreground">{partnership.partnerEmail || 'No email'}</p>
                </div>
              </div>
              <Badge variant={partnership.status === 'active' ? 'default' : 'outline'}>
                {partnership.status}
              </Badge>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={loading}>
                  <UserX className="h-4 w-4 mr-2" />
                  Disconnect Partnership
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will end your accountability partnership. You will need to create a new partnership to continue tracking together.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDisconnect} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No active partnership</p>
            <Button className="mt-4" onClick={() => window.location.href = '/onboarding'}>
              Set Up Partnership
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
