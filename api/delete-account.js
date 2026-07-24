import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Nur POST erlaubt.' })
    return
  }

  const { user_id } = req.body ?? {}

  if (!user_id) {
    res.status(400).json({ error: 'user_id fehlt.' })
    return
  }

  try {
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id)

    if (error) {
      res.status(502).json({ error: error.message })
      return
    }

    res.status(200).json({ success: true })
  } catch (e) {
    res.status(500).json({ error: `Serverfehler: ${e.message}` })
  }
}
