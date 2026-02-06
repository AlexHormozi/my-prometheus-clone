'use client'

import { ScoreBreakdown } from '@/lib/types'
import { getScoreDelta } from '@/lib/scoring'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface DeltaSummaryProps {
  currentUserName: string
  partnerName: string
  currentUserScore: ScoreBreakdown
  partnerScore: ScoreBreakdown
}

export function DeltaSummary({ currentUserName, partnerName, currentUserScore, partnerScore }: DeltaSummaryProps) {
  const delta = getScoreDelta(currentUserScore, partnerScore)
  const leader = delta.total > 0 ? currentUserName : delta.total < 0 ? partnerName : null
  const absDelta = Math.abs(delta.total)

  const topCategories = delta.categories
    .filter(c => Math.abs(c.delta) > 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3)

  const categoryText = topCategories.length > 0
    ? topCategories.map(c => c.name).join(', ')
    : 'all categories'

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {delta.total > 0 ? (
            <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
          ) : delta.total < 0 ? (
            <TrendingDown className="h-5 w-5 text-red-500 mt-0.5" />
          ) : (
            <Minus className="h-5 w-5 text-muted-foreground mt-0.5" />
          )}
          <div>
            <h3 className="font-medium mb-2">Delta Summary</h3>
            <p className="text-sm text-muted-foreground">
              {leader ? (
                <>
                  {leader} led by {absDelta} points today, mainly via {categoryText.toLowerCase()}.
                </>
              ) : (
                <>
                  Tied at {currentUserScore.total} points today. Great balance!
                </>
              )}
            </p>
            {topCategories.length > 0 && (
              <div className="mt-3 space-y-1">
                {topCategories.map(cat => (
                  <div key={cat.name} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{cat.name}</span>
                    <span className={cat.delta > 0 ? 'text-green-600' : cat.delta < 0 ? 'text-red-600' : ''}>
                      {cat.delta > 0 ? '+' : ''}{cat.delta}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
