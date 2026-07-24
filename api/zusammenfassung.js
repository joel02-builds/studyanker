const SYSTEM_PROMPT = `Du bist ein ruhiger, unterstützender Lernbegleiter für Studierende mit ADHS.
Analysiere die folgenden Lern-Anker des Nutzers und antworte auf Deutsch mit maximal 4 Sätzen:
1. Woran der Nutzer gerade arbeitet (Thema/Fach)
2. Was der rote Faden der letzten Sessions war
3. Was der konkrete nächste Schritt ist
Sei warm, direkt, ohne Floskeln. Keine Ratschläge. Nur Kontext spiegeln.`

function formatiereAnker(anker) {
  return anker
    .map((a, i) => {
      return [
        `Anker ${i + 1} (${new Date(a.created_at).toLocaleDateString('de-DE')}):`,
        `Fach: ${a.fach}`,
        a.wo_war_ich && `Wo war ich: ${a.wo_war_ich}`,
        a.was_war_wichtig && `Was war wichtig: ${a.was_war_wichtig}`,
        a.naechster_schritt && `Nächster Schritt: ${a.naechster_schritt}`,
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')
}

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

  const { anker } = req.body ?? {}

  if (!Array.isArray(anker) || anker.length === 0) {
    res.status(400).json({ error: 'Keine Anker-Daten übergeben.' })
    return
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: formatiereAnker(anker) }],
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      res.status(502).json({ error: `Anthropic API Fehler (${response.status}): ${body}` })
      return
    }

    const data = await response.json()
    res.status(200).json({ text: data.content[0].text })
  } catch (e) {
    res.status(500).json({ error: `Serverfehler: ${e.message}` })
  }
}
