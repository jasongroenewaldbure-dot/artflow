// Edge Function: aggregate analytics (views/likes/shares) into rollups
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

serve(async () => {
  try {
    const res = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/run_analytics_rollup`, {
      method: 'POST',
      headers: {
        apikey: Deno.env.get('SERVICE_ROLE_KEY')!,
        Authorization: `Bearer ${Deno.env.get('SERVICE_ROLE_KEY')!}`,
        'Content-Type': 'application/json'
      }
    })
    if (!res.ok) throw new Error('rollup RPC failed')
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})


