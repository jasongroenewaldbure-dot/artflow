// Edge Function: generate image variants, EXIF, dominant color, adaptive watermarks
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

serve(async (req) => {
  try {
    const payload = await req.json()
    // expected: { bucket: string, path: string, artistName?: string, isPrimary?: boolean }
    // NOTE: Sharp is not available in Deno. Use Supabase Storage Image Transform or call a hosted worker.
    // For now, enqueue into system_logs for a worker to process.
    const res = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/system_logs`, {
      method: 'POST',
      headers: {
        apikey: Deno.env.get('SERVICE_ROLE_KEY')!,
        Authorization: `Bearer ${Deno.env.get('SERVICE_ROLE_KEY')!}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ level: 'info', message: 'queue_image_variants', metadata: payload })
    })
    if (!res.ok) throw new Error('Failed to log queue entry')
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})


