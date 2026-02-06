'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame, Target, Clock, Smile, Trophy } from 'lucide-react'

interface SummaryTilesProps {
  currentUser: {
    currentStreak: number
    bestStreak: number
    completionRate: number
    totalDeepWork: number
    averageMood: number
    name: string
  }
  partner: {
    currentStreak: number
    bestStreak: number
    completionRate: number
    totalDeepWork: number
    averageMood: number
    name: string
  }
  winner?: {
    name: string
    totalScore: number
  }
}

export function SummaryTiles({ currentUser, partner, winner }: SummaryTilesProps) {
  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊', '😄']

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">{currentUser.name}</span>
              <span className="text-2xl font-bold">{currentUser.currentStreak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">{partner.name}</span>
              <span className="text-2xl font-bold">{partner.currentStreak}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
          <Target className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">{currentUser.name}</span>
              <span className="text-2xl font-bold">{currentUser.bestStreak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">{partner.name}</span>
              <span className="text-2xl font-bold">{partner.bestStreak}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <Target className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">{currentUser.name}</span>
              <span className="text-2xl font-bold">{currentUser.completionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">{partner.name}</span>
              <span className="text-2xl font-bold">{partner.completionRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deep Work</CardTitle>
          <Clock className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">{currentUser.name}</span>
              <span className="text-2xl font-bold">{Math.round(currentUser.totalDeepWork / 60)}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">{partner.name}</span>
              <span className="text-2xl font-bold">{Math.round(partner.totalDeepWork / 60)}h</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
          <Smile className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{currentUser.name}</span>
              <span className="text-2xl">{moodEmojis[Math.round(currentUser.averageMood)] || '😐'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{partner.name}</span>
              <span className="text-2xl">{moodEmojis[Math.round(partner.averageMood)] || '😐'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {winner && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Period Winner</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winner.name}</div>
            <p className="text-xs text-muted-foreground mt-1">{winner.totalScore} points</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
