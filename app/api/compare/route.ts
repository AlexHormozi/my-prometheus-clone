import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateScore } from '@/lib/scoring'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

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

    const [currentUserEntry, partnerEntry, currentUserPhotos, partnerPhotos, currentUserComments, partnerComments, currentUserProfile, partnerProfile] = await Promise.all([
      supabase.from('journal_entries').select('*').eq('user_id', user.id).eq('entry_date', date).maybeSingle(),
      supabase.from('journal_entries').select('*').eq('user_id', partnerId).eq('entry_date', date).maybeSingle(),
      supabase.from('entry_photos').select('*').eq('user_id', user.id),
      supabase.from('entry_photos').select('*').eq('user_id', partnerId),
      supabase.from('comments').select('*, author:profiles!comments_author_id_fkey(*)'),
      supabase.from('comments').select('*, author:profiles!comments_author_id_fkey(*)'),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('profiles').select('*').eq('id', partnerId).single(),
    ])

    const currentEntryPhotos = currentUserEntry.data ? currentUserPhotos.data?.filter(p => p.entry_id === currentUserEntry.data.id) || [] : []
    const partnerEntryPhotos = partnerEntry.data ? partnerPhotos.data?.filter(p => p.entry_id === partnerEntry.data.id) || [] : []

    const currentEntryComments = currentUserEntry.data ? currentUserComments.data?.filter(c => c.entry_id === currentUserEntry.data.id) || [] : []
    const partnerEntryComments = partnerEntry.data ? partnerComments.data?.filter(c => c.entry_id === partnerEntry.data.id) || [] : []

    return NextResponse.json({
      date,
      currentUser: {
        entry: currentUserEntry.data,
        photos: currentEntryPhotos,
        comments: currentEntryComments,
        score: calculateScore(currentUserEntry.data, currentEntryPhotos),
        profile: currentUserProfile.data,
      },
      partner: {
        entry: partnerEntry.data,
        photos: partnerEntryPhotos,
        comments: partnerEntryComments,
        score: calculateScore(partnerEntry.data, partnerEntryPhotos),
        profile: partnerProfile.data,
      },
    })
  } catch (error) {
    console.error('Compare API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
