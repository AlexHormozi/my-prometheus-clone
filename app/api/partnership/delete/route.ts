import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: partnership, error: fetchError } = await supabase
      .from('partnerships')
      .select('*')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .single()

    if (fetchError || !partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 })
    }

    const { error: deleteError } = await supabase
      .from('partnerships')
      .delete()
      .eq('id', partnership.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Partnership delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
