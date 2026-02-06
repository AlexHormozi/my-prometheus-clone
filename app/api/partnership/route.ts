import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: partnership, error: partnershipError } = await supabase
      .from('partnerships')
      .select('*')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .maybeSingle()

    if (partnershipError || !partnership) {
      return NextResponse.json(null)
    }

    const partnerId = partnership.user_a === user.id ? partnership.user_b : partnership.user_a

    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', partnerId)
      .single()

    return NextResponse.json({
      status: partnership.status,
      partnerEmail: 'Partner',
      partnerName: partnerProfile?.display_name || 'Partner',
    })
  } catch (error) {
    console.error('Partnership fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
