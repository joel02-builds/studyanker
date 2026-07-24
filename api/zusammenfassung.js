const SYSTEM_PROMPT = `Du bist ein präziser Lernbegleiter für Studierende mit ADHS.
Deine Aufgabe: Kontext spiegeln, nicht beraten.

Antworte IMMER auf Deutsch in exakt diesem Format (Markdown):

**Wo du gerade bist:** [Fach + konkrete Stelle, z.B. "Mathe, Kapitel 3 — Integralrechnung"]

**Was zuletzt wichtig war:** [Die konkretesten Infos aus den letzten Ankern, keine Interpretation]

**Dein nächster Schritt:** [Exakt was der Nutzer selbst als nächsten Schritt notiert hat]

Regeln:
- Maximal 3 Sätze gesamt
- Nur was in den Ankern steht — nichts erfinden
- Kein "Du solltest", kein Coaching, keine Ratschläge
- Wenn ein Anker-Eintrag leer oder sinnlos ist (z.B. "sds"), ignoriere ihn komplett und erwähne ihn nicht
- Warm aber direkt — wie ein ruhiger Freund der gut zuhört`

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

  console.log('API Key vorhanden:', !!process.env.ANTHROPIC_API_KEY)

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
