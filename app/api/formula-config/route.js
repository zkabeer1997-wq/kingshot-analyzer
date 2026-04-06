import { createAnonSupabaseClient } from '../../../lib/supabase-server'

const DEFAULTS = {
  coefficients: {
    dmg_sqrt_weight: 1.0, atk_weight: 1.0, leth_weight: 1.0,
    def_weight: 1.0, hp_weight: 1.0, injured_scale: 1.0, version: 1
  },
  sample_count: 0, avg_error: 0
}

export async function GET() {
  try {
    const supabase = createAnonSupabaseClient()
    const { data, error } = await supabase
      .from('formula_config')
      .select('coefficients, sample_count, avg_error, last_calibrated_at')
      .eq('config_key', 'default')
      .single()

    if (error) return Response.json(DEFAULTS)
    return Response.json(data)
  } catch {
    return Response.json(DEFAULTS)
  }
}
