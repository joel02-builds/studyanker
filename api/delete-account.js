import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  console.log('delete-account gestartet')
  console.log('SUPABASE_URL:', !!process.env.SUPABASE_URL)
  console.log('SERVICE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

  const { userId } = req.body
  if (!userId) return res.status(400).json({ error: 'userId fehlt' })

  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) throw error

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Fehler:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
