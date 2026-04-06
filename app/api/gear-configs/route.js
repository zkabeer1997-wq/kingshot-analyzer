import { createServerSupabaseClient } from '../../../lib/supabase-server'

export async function POST(request) {
  try {
    const body = await request.json()
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from('gear_configs').insert({
      governor_name: body.governor_name || 'User',
      kingdom: body.kingdom || 'Auto',
      gear_data: body.gear_data || body,
      profile_type: body.profile_type || 'auto',
    })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true }, { status: 201 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    if (searchParams.get('admin_key') !== process.env.ADMIN_PASSPHRASE) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('gear_configs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ data, count: data.length })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
