'use client'

import { useEffect, useState } from 'react'
import { DashboardStats } from '@/lib/types'
import { RangeSelector } from './range-selector'
import { SummaryTiles } from './summary-tiles'
import { ScoreLineChart } from '@/components/charts/score-line-chart'
import { WeeklyBarChart } from '@/components/charts/weekly-bar-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardView() {
  const [range, setRange] = useState<'7' | '30' | '90'>('30')
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/stats?range=${range}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('No active partnership found')
          } else {
            throw new Error('Failed to fetch stats')
          }
          return
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [range])

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  if (!data) return null

  const currentUserName = data.currentUser.profile?.display_name || 'You'
  const partnerName = data.partner.profile?.display_name || 'Partner'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Overview</h2>
          <p className="text-muted-foreground text-sm">Track your progress and compare results</p>
        </div>
        <RangeSelector selected={range} onChange={setRange} />
      </div>

      <SummaryTiles
        currentUser={{
          ...data.currentUser,
          name: currentUserName,
        }}
        partner={{
          ...data.partner,
          name: partnerName,
        }}
        winner={data.winner}
      />

      <Card>
        <CardHeader>
          <CardTitle>Daily Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreLineChart
            currentUserData={data.currentUser.dailyScores}
            partnerData={data.partner.dailyScores}
            currentUserName={currentUserName}
            partnerName={partnerName}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyBarChart
            currentUserData={data.currentUser.weeklyScores}
            partnerData={data.partner.weeklyScores}
            currentUserName={currentUserName}
            partnerName={partnerName}
          />
        </CardContent>
      </Card>
    </div>
  )
}
