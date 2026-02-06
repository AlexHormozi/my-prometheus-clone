import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateScore } from '@/lib/scoring'
import { subDays, format, startOfWeek, endOfWeek } from 'date-fns'

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
      .select('*')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq('status', 'active')
      .single()

    if (!partnership) {
      return NextResponse.json({ error: 'No active partnership' }, { status: 404 })
    }

    const partnerId = partnership.user_a === user.id ? partnership.user_b : partnership.user_a
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd')

    const [currentUserEntries, partnerEntries, currentUserPhotos, partnerPhotos, currentUserProfile, partnerProfile] = await Promise.all([
      supabase.from('journal_entries').select('*').eq('user_id', user.id).gte('entry_date', startDate).order('entry_date'),
      supabase.from('journal_entries').select('*').eq('user_id', partnerId).gte('entry_date', startDate).order('entry_date'),
      supabase.from('entry_photos').select('*').eq('user_id', user.id),
      supabase.from('entry_photos').select('*').eq('user_id', partnerId),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('profiles').select('*').eq('id', partnerId).single(),
    ])

    const processUserStats = (entries: any[], photos: any[]) => {
      const dailyScores = entries.map(entry => {
        const entryPhotos = photos.filter(p => p.entry_id === entry.id)
        const score = calculateScore(entry, entryPhotos)
        return { date: entry.entry_date, score: score.total }
      })

      const weeklyScores: { [key: string]: number } = {}
      entries.forEach(entry => {
        const weekStart = format(startOfWeek(new Date(entry.entry_date)), 'yyyy-MM-dd')
        const entryPhotos = photos.filter(p => p.entry_id === entry.id)
        const score = calculateScore(entry, entryPhotos)
        weeklyScores[weekStart] = (weeklyScores[weekStart] || 0) + score.total
      })

      const weeklyScoresArray = Object.entries(weeklyScores).map(([week, score]) => ({ week, score }))

      let currentStreak = 0
      let bestStreak = 0
      let tempStreak = 0
      const today = new Date()

      for (let i = 0; i < days; i++) {
        const checkDate = format(subDays(today, i), 'yyyy-MM-dd')
        const hasEntry = entries.some(e => e.entry_date === checkDate && e.is_submitted)
        if (hasEntry) {
          tempStreak++
          if (i === 0 || currentStreak > 0) currentStreak = tempStreak
          bestStreak = Math.max(bestStreak, tempStreak)
        } else {
          if (i === 0) currentStreak = 0
          tempStreak = 0
        }
      }

      const submittedCount = entries.filter(e => e.is_submitted).length
      const completionRate = days > 0 ? Math.round((submittedCount / days) * 100) : 0
      const totalDeepWork = entries.reduce((sum, e) => sum + (e.minutes_deep_work || 0), 0)
      const avgMood = entries.length > 0 ? entries.reduce((sum, e) => sum + (e.mood || 0), 0) / entries.length : 0

      return {
        dailyScores,
        weeklyScores: weeklyScoresArray,
        currentStreak,
        bestStreak,
        completionRate,
        totalDeepWork,
        averageMood: Math.round(avgMood * 10) / 10,
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
