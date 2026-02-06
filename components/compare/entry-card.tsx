'use client'

import { JournalEntry, ScoreBreakdown, EntryPhoto, Comment } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, MessageSquare } from 'lucide-react'
import { PhotosGrid } from './photos-grid'

interface EntryCardProps {
  title: string
  entry: JournalEntry | null
  photos: EntryPhoto[]
  comments: Comment[]
  score: ScoreBreakdown
  isEmpty?: boolean
}

export function EntryCard({ title, entry, photos, comments, score, isEmpty }: EntryCardProps) {
  if (isEmpty || !entry) {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Circle className="h-12 w-12 mb-4 opacity-20" />
            <p>No entry for this date</p>
            <p className="text-sm mt-2">Encourage your partner to fill out today's journal.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const moodLabels = ['', 'Rough', 'Meh', 'Okay', 'Good', 'Great']

  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {entry.is_submitted ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Submitted
            </Badge>
          ) : (
            <Badge variant="outline">Draft</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold">{score.total} pts</div>

        {entry.priorities && entry.priorities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Priorities</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {entry.priorities.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        {entry.wins && (
          <div>
            <h4 className="text-sm font-medium mb-2">Wins</h4>
            <p className="text-sm text-muted-foreground">{entry.wins}</p>
          </div>
        )}

        {entry.blockers && (
          <div>
            <h4 className="text-sm font-medium mb-2">Blockers</h4>
            <p className="text-sm text-muted-foreground">{entry.blockers}</p>
          </div>
        )}

        <div className="flex gap-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Deep Work</h4>
            <p className="text-sm text-muted-foreground">{entry.minutes_deep_work} min</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Mood</h4>
            <p className="text-sm text-muted-foreground">{moodLabels[entry.mood]}</p>
          </div>
        </div>

        {entry.tomorrow_plan && (
          <div>
            <h4 className="text-sm font-medium mb-2">Tomorrow's Plan</h4>
            <p className="text-sm text-muted-foreground">{entry.tomorrow_plan}</p>
          </div>
        )}

        {photos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Photos</h4>
            <PhotosGrid photos={photos} />
          </div>
        )}

        {comments.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
