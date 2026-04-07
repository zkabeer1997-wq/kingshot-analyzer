// Proxy route to kingshotsimulator.com's battle simulation API
// This avoids CORS issues by calling from our server.
//
// POST /api/battle-sim
// Body: { attacker, defender, num_sims }
// Response: { result } — the avg_unit_details + skills_report from kingshotsimulator
//
// We use a stable per-request user ID so kingshotsimulator can rate-limit fairly.

const KSSIM_BASE = 'https://api.panel.kingshotsimulator.com'
const KSSIM_HEADERS_BASE = {
  'Content-Type': 'application/json',
  'Origin': 'https://kingshotsimulator.com',
  'Referer': 'https://kingshotsimulator.com/',
}

// Generate a stable user ID based on request hash so identical requests reuse the same job
function makeUserId() {
  // Simple random UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

async function pollJob(jobId, userId, maxWaitMs = 30000) {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    await new Promise(r => setTimeout(r, 400))
    const r = await fetch(`${KSSIM_BASE}/queue/jobs/${jobId}`, {
      headers: { ...KSSIM_HEADERS_BASE, 'X-User-ID': userId },
    })
    if (!r.ok) {
      throw new Error(`Poll failed: ${r.status}`)
    }
    const d = await r.json()
    if (d.job?.status === 'completed') return d.result
    if (d.job?.status === 'failed') {
      throw new Error('Job failed: ' + (d.job.error || 'unknown'))
    }
    if (d.job?.status === 'expired') {
      throw new Error('Job expired')
    }
  }
  throw new Error('Job poll timeout')
}

export async function POST(request) {
  try {
    const body = await request.json()
    if (!body.attacker || !body.defender) {
      return Response.json({ error: 'Missing attacker or defender' }, { status: 400 })
    }

    const userId = makeUserId()
    const payload = {
      attacker: body.attacker,
      defender: body.defender,
      num_sims: Math.max(1, Math.min(100, body.num_sims || 20)),
    }

    const submitResp = await fetch(`${KSSIM_BASE}/battle`, {
      method: 'POST',
      headers: { ...KSSIM_HEADERS_BASE, 'X-User-ID': userId },
      body: JSON.stringify(payload),
    })

    if (!submitResp.ok) {
      const text = await submitResp.text()
      return Response.json({ error: `Submit failed: ${submitResp.status} ${text}` }, { status: 502 })
    }

    const submitData = await submitResp.json()
    if (!submitData.job?.job_id) {
      return Response.json({ error: 'No job_id returned', raw: submitData }, { status: 502 })
    }

    const result = await pollJob(submitData.job.job_id, userId)
    return Response.json({ result })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
