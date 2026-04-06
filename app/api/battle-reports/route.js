import { createServerSupabaseClient } from '../../../lib/supabase-server'

const ALLOWED_FIELDS = [
  'governor_name', 'kingdom', 'profile_type',
  'atk_inf', 'atk_cav', 'atk_arch',
  'atk_bonus', 'leth_bonus', 'def_bonus', 'hp_bonus',
  'atk_tier', 'atk_leaders', 'atk_joiners',
  'def_inf', 'def_cav', 'def_arch',
  'def_atk_bonus', 'def_leth_bonus', 'def_def_bonus', 'def_hp_bonus',
  'def_tier', 'def_leaders', 'def_joiners',
  'outcome', 'predicted_ratio', 'actual_ratio', 'notes',
  'actual_outcome', 'actual_mypowerlost', 'actual_opppowerlost',
  'actual_myinjuredinf', 'actual_myinjuredcav', 'actual_myinjuredarch',
  'actual_oppinjuredinf', 'actual_oppinjuredcav', 'actual_oppinjuredarch',
  'predicted_mydmg', 'predicted_oppdmg',
  'predicted_myinjured', 'predicted_oppinjured',
  'input_mybr', 'input_oppbr',
]

export async function POST(request) {
  try {
    const body = await request.json()
    if (!body.profile_type) {
      return Response.json({ error: 'Missing profile_type' }, { status: 400 })
    }
    if (body.profile_type === 'actual_result' && !body.actual_outcome) {
      return Response.json({ error: 'Missing actual_outcome' }, { status: 400 })
    }

    const sanitized = {}
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) sanitized[key] = body[key]
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('battle_reports')
      .insert(sanitized)
      .select('id, profile_type, actual_outcome, predicted_ratio')

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true, data }, { status: 201 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('admin_key')
    if (adminKey !== process.env.ADMIN_PASSPHRASE) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('battle_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ data, count: data.length })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
