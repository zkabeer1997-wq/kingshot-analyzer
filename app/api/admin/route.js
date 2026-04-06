import { createServerSupabaseClient } from '../../../lib/supabase-server'

const ALLOWED_TABLES = ['battle_reports', 'gear_configs', 'formula_config']

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('admin_key')
    const table = searchParams.get('table')

    if (adminKey !== process.env.ADMIN_PASSPHRASE) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!table || !ALLOWED_TABLES.includes(table)) {
      return Response.json({ error: 'Invalid table. Allowed: ' + ALLOWED_TABLES.join(', ') }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ table, count: data.length, data })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
