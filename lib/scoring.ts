import { JournalEntry, ScoreBreakdown, EntryPhoto } from './types'

export function calculateScore(
  entry: JournalEntry | null,
  photos: EntryPhoto[] = []
): ScoreBreakdown {
  if (!entry) {
    return {
      priorities: 0,
      wins: 0,
      blockers: 0,
      deepWork: 0,
      mood: 0,
      tomorrowPlan: 0,
      photos: 0,
      total: 0,
    }
  }

  const priorities = Math.min(entry.priorities?.length || 0, 3) * 5
  const wins = entry.wins?.trim() ? 10 : 0
  const blockers = entry.blockers?.trim() ? 5 : 0
  const deepWork = Math.min(Math.floor(entry.minutes_deep_work / 30), 10) * 5
  const mood = entry.mood * 2
  const tomorrowPlan = entry.tomorrow_plan?.trim() ? 10 : 0
  const photosScore = Math.min(photos.length, 3) * 5

  const total =
    priorities + wins + blockers + deepWork + mood + tomorrowPlan + photosScore

  return {
    priorities,
    wins,
    blockers,
    deepWork,
    mood,
    tomorrowPlan,
    photos: photosScore,
    total,
  }
}

export function getScoreDelta(
  score1: ScoreBreakdown,
  score2: ScoreBreakdown
): {
  total: number
  categories: Array<{
    name: string
    delta: number
    leader: 'user1' | 'user2' | 'tie'
  }>
} {
  const categories = [
    { name: 'Priorities', key: 'priorities' as keyof ScoreBreakdown },
    { name: 'Wins', key: 'wins' as keyof ScoreBreakdown },
    { name: 'Blockers', key: 'blockers' as keyof ScoreBreakdown },
    { name: 'Deep Work', key: 'deepWork' as keyof ScoreBreakdown },
    { name: 'Mood', key: 'mood' as keyof ScoreBreakdown },
    { name: 'Tomorrow Plan', key: 'tomorrowPlan' as keyof ScoreBreakdown },
    { name: 'Photos', key: 'photos' as keyof ScoreBreakdown },
  ]

  const categoryDeltas = categories.map(({ name, key }) => {
    const val1 = score1[key] as number
    const val2 = score2[key] as number
    const delta = val1 - val2
    return {
      name,
      delta,
      leader: delta > 0 ? ('user1' as const) : delta < 0 ? ('user2' as const) : ('tie' as const),
    }
  })

  return {
    total: score1.total - score2.total,
    categories: categoryDeltas,
  }
}
