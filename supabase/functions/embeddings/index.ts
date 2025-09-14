// Edge Function: compute and store embeddings for artworks/artists
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

type EmbeddingPayload = {
  entity: 'artwork' | 'artist',
  id: string,
  text: string
}

serve(async (req) => {
  try {
    const { entity, id, text } = await req.json() as EmbeddingPayload
    if (!text) throw new Error('text required')
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) throw new Error('OPENAI_API_KEY missing')

    const resp = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: text })
    })
    const data = await resp.json()
    const vector = data.data?.[0]?.embedding
    if (!vector) throw new Error('No embedding returned')

    const table = entity === 'artwork' ? 'artworks' : 'profiles'
    const res = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        apikey: Deno.env.get('SERVICE_ROLE_KEY')!,
        Authorization: `Bearer ${Deno.env.get('SERVICE_ROLE_KEY')!}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ embedding: vector })
    })
    if (!res.ok) throw new Error('Failed to store embedding')
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})


