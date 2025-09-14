// Edge Function: generate room visualizations with constraints
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

serve(async (req) => {
  try {
    const payload = await req.json()
    // expected: { artworkId: string, width_cm: number, height_cm: number, medium: string }
    // Enqueue for worker; actual rendering done off-function due to Deno image libs limits.
    const res = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/system_logs`, {
      method: 'POST',
      headers: {
        apikey: Deno.env.get('SERVICE_ROLE_KEY')!,
        Authorization: `Bearer ${Deno.env.get('SERVICE_ROLE_KEY')!}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ level: 'info', message: 'queue_visualization', metadata: payload })
    })
    if (!res.ok) throw new Error('Failed to log queue entry')
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})


