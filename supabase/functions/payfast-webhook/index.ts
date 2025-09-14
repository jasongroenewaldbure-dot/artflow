// Edge Function: PayFast ITN (Instant Transaction Notification) webhook
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

serve(async (req) => {
  try {
    const form = await req.formData()
    const payload: Record<string, string> = {}
    for (const [k, v] of form.entries()) payload[k] = String(v)

    // TODO: verify signature with passphrase; basic logging for now
    const res = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/system_logs`, {
      method: 'POST',
      headers: {
        apikey: Deno.env.get('SERVICE_ROLE_KEY')!,
        Authorization: `Bearer ${Deno.env.get('SERVICE_ROLE_KEY')!}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ level: 'info', message: 'payfast_itn', metadata: payload })
    })
    if (!res.ok) throw new Error('Failed to log ITN')
    return new Response('OK', { status: 200 })
  } catch (e) {
    return new Response(String(e), { status: 500 })
  }
})


