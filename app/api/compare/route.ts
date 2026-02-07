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
      .select('user_a,user_b')
      .eq('status', 'active')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .limit(1)
      .maybeSingle()

    if (!partnership) {
      return NextResponse.json({ error: 'No active partnership' }, { status: 404 })
    }

    const partnerId = partnership.user_a === user.id ? partnership.user_b : partnership.user_a

    const [currentUserEntry, partnerEntry, currentUserProfile, partnerProfile] = await Promise.all([
      supabase.from('journal_entries').select('*').eq('user_id', user.id).eq('entry_date', date).maybeSingle(),
      supabase.from('journal_entries').select('*').eq('user_id', partnerId).eq('entry_date', date).maybeSingle(),
      supabase.from('profiles').select('id,display_name').eq('id', user.id).limit(1).maybeSingle(),
      supabase.from('profiles').select('id,display_name').eq('id', partnerId).limit(1).maybeSingle(),
    ])

    const [currentUserPhotos, partnerPhotos, currentUserComments, partnerComments] = await Promise.all([
      currentUserEntry.data?.id
        ? supabase.from('entry_photos').select('id,entry_id,storage_path,caption,created_at').eq('entry_id', currentUserEntry.data.id)
        : Promise.resolve({ data: [] }),
      partnerEntry.data?.id
        ? supabase.from('entry_photos').select('id,entry_id,storage_path,caption,created_at').eq('entry_id', partnerEntry.data.id)
        : Promise.resolve({ data: [] }),
      currentUserEntry.data?.id
        ? supabase.from('comments').select('*, author:profiles!comments_author_id_fkey(id,display_name)').eq('entry_id', currentUserEntry.data.id)
        : Promise.resolve({ data: [] }),
      partnerEntry.data?.id
        ? supabase.from('comments').select('*, author:profiles!comments_author_id_fkey(id,display_name)').eq('entry_id', partnerEntry.data.id)
        : Promise.resolve({ data: [] }),
    ])

    const currentEntryPhotos = currentUserPhotos.data || []
    const partnerEntryPhotos = partnerPhotos.data || []

    const currentEntryComments = currentUserComments.data || []
    const partnerEntryComments = partnerComments.data || []

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
