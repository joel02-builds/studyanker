function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function tageSeit(iso) {
  const diffMs = startOfDay(new Date()) - startOfDay(iso)
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

export function formatDatum(iso) {
  const tage = tageSeit(iso)

  if (tage <= 0) return 'Heute'
  if (tage === 1) return 'Gestern'
  if (tage < 7) return `vor ${tage} Tagen`
  if (tage < 14) return 'vor 1 Woche'

  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })
}
