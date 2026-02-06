'use client'

import { useEffect, useState } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { CompareData } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { EntryCard } from './entry-card'
import { DeltaSummary } from './delta-summary'

export function CompareView() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [data, setData] = useState<CompareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/compare?date=${selectedDate}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('No active partnership found')
          } else {
            throw new Error('Failed to fetch comparison data')
          }
          return
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError('Failed to load data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedDate])

  const goToPrevDay = () => {
    setSelectedDate(format(subDays(new Date(selectedDate), 1), 'yyyy-MM-dd'))
  }

  const goToNextDay = () => {
    setSelectedDate(format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd'))
  }

  const goToToday = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'))
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          {error.includes('partnership') && (
            <Button onClick={() => window.location.href = '/onboarding'}>
              Set Up Partnership
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading comparison...</p>
      </div>
    )
  }

  if (!data) return null

  const currentUserName = data.currentUser.profile?.display_name || 'You'
  const partnerName = data.partner.profile?.display_name || 'Partner'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">{format(new Date(selectedDate), 'MMM dd, yyyy')}</span>
          </div>
        </div>
        <Button variant="outline" onClick={goToToday}>
          Today
        </Button>
      </div>

      <DeltaSummary
        currentUserName={currentUserName}
        partnerName={partnerName}
        currentUserScore={data.currentUser.score}
        partnerScore={data.partner.score}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <EntryCard
          title={currentUserName}
          entry={data.currentUser.entry}
          photos={data.currentUser.photos}
          comments={data.currentUser.comments}
          score={data.currentUser.score}
        />
        <EntryCard
          title={partnerName}
          entry={data.partner.entry}
          photos={data.partner.photos}
          comments={data.partner.comments}
          score={data.partner.score}
          isEmpty={!data.partner.entry}
        />
      </div>
    </div>
  )
}
