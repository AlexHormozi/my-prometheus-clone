import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateScore } from '@/lib/scoring'
import { subDays, format, startOfWeek } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '30'
    const days = parseInt(range)

    const { data: partnership } = await supabase
      .from('partnerships')
      .select('user_a,user_b')
      .eq('status', 'active')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .limit(1)
      .maybeSingle()

    if (!partnership) {
      return NextResponse.json({ error: 'No active partnership' }, { status: 404 })
    }

    const partnerId = partnership.user_a === user.id ? partnership.user_b : partnership.user_a
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd')

    const [currentUserEntries, partnerEntries, currentUserPhotos, partnerPhotos, currentUserProfile, partnerProfile] = await Promise.all([
      supabase.from('journal_entries').select('id,entry_date,priorities,wins,blockers,minutes_deep_work,mood,tomorrow_plan,is_submitted').eq('user_id', user.id).gte('entry_date', startDate).order('entry_date'),
      supabase.from('journal_entries').select('id,entry_date,priorities,wins,blockers,minutes_deep_work,mood,tomorrow_plan,is_submitted').eq('user_id', partnerId).gte('entry_date', startDate).order('entry_date'),
      supabase.from('entry_photos').select('id,entry_id').eq('user_id', user.id).gte('created_at', new Date(startDate).toISOString()),
      supabase.from('entry_photos').select('id,entry_id').eq('user_id', partnerId).gte('created_at', new Date(startDate).toISOString()),
      supabase.from('profiles').select('id,display_name').eq('id', user.id).limit(1).maybeSingle(),
      supabase.from('profiles').select('id,display_name').eq('id', partnerId).limit(1).maybeSingle(),
    ])

    const processUserStats = (entries: any[], photos: any[]) => {
      const photosByEntryId = new Map<string, number>()
      photos.forEach(p => {
        const count = photosByEntryId.get(p.entry_id) || 0
        photosByEntryId.set(p.entry_id, count + 1)
      })

      const entryByDate = new Map<string, any>()
      const dailyScores: Array<{ date: string; score: number }> = []
      const weeklyScores: { [key: string]: number } = {}
      let submittedCount = 0
      let totalDeepWork = 0
      let totalMood = 0

      entries.forEach(entry => {
        entryByDate.set(entry.entry_date, entry)
        const photoCount = photosByEntryId.get(entry.id) || 0
        const score = calculateScore(entry, Array(photoCount).fill({}))
        dailyScores.push({ date: entry.entry_date, score: score.total })

        const weekStart = format(startOfWeek(new Date(entry.entry_date)), 'yyyy-MM-dd')
        weeklyScores[weekStart] = (weeklyScores[weekStart] || 0) + score.total

        if (entry.is_submitted) submittedCount++
        totalDeepWork += entry.minutes_deep_work || 0
        totalMood += entry.mood || 0
      })

      let currentStreak = 0
      let bestStreak = 0
      let tempStreak = 0
      const today = new Date()

      for (let i = 0; i < days; i++) {
        const checkDate = format(subDays(today, i), 'yyyy-MM-dd')
        const hasEntry = entryByDate.has(checkDate) && entryByDate.get(checkDate).is_submitted
        if (hasEntry) {
          tempStreak++
          if (i === 0 || currentStreak > 0) currentStreak = tempStreak
          bestStreak = Math.max(bestStreak, tempStreak)
        } else {
          if (i === 0) currentStreak = 0
          tempStreak = 0
        }
      }

      const completionRate = days > 0 ? Math.round((submittedCount / days) * 100) : 0
      const avgMood = entries.length > 0 ? Math.round((totalMood / entries.length) * 10) / 10 : 0
      const weeklyScoresArray = Object.entries(weeklyScores).map(([week, score]) => ({ week, score }))

      return {
        dailyScores,
        weeklyScores: weeklyScoresArray,
        currentStreak,
        bestStreak,
        completionRate,
        totalDeepWork,
        averageMood: avgMood,
      }
    }

    const currentUserStats = processUserStats(currentUserEntries.data || [], currentUserPhotos.data || [])
    const partnerStats = processUserStats(partnerEntries.data || [], partnerPhotos.data || [])

    const currentUserTotal = currentUserStats.dailyScores.reduce((sum, d) => sum + d.score, 0)
    const partnerTotal = partnerStats.dailyScores.reduce((sum, d) => sum + d.score, 0)

    const winner = currentUserTotal > partnerTotal
      ? { userId: user.id, name: currentUserProfile.data?.display_name || 'You', totalScore: currentUserTotal }
      : partnerTotal > currentUserTotal
      ? { userId: partnerId, name: partnerProfile.data?.display_name || 'Partner', totalScore: partnerTotal }
      : undefined

    return NextResponse.json({
      range,
      currentUser: {
        ...currentUserStats,
        profile: currentUserProfile.data,
      },
      partner: {
        ...partnerStats,
        profile: partnerProfile.data,
      },
      winner,
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
