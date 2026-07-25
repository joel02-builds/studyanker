const OFFLINE_URL = '/offline.html'
const CACHE_NAME = 'studyanker-offline-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return

  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL))
  )
})

const REMINDER_TEXTE = [
  "Wo warst du zuletzt? Stan wartet ⚓",
  "Kurz ankern — 30 Sekunden reichen.",
  "Lernst du heute? Ich halte deinen Platz frei.",
  "Ein Anker vor dem Aufhören macht morgen leichter.",
  "Stan ist da. Wo bist du gerade?",
  "Kein Druck — nur kurz reinschauen.",
  "Dein letzter Anker wartet auf dich.",
]

let reminderTimeoutId = null

function reminderPlanen(zeit) {
  clearTimeout(reminderTimeoutId)

  const [stunden, minuten] = zeit.split(':').map(Number)
  const jetzt = new Date()
  const ziel = new Date()
  ziel.setHours(stunden, minuten, 0, 0)
  if (ziel <= jetzt) ziel.setDate(ziel.getDate() + 1)

  const wartezeit = ziel.getTime() - jetzt.getTime()

  reminderTimeoutId = setTimeout(() => {
    const wochentag = new Date().getDay()
    const text = REMINDER_TEXTE[wochentag % REMINDER_TEXTE.length]

    self.registration.showNotification('StudyAnker', {
      body: text,
      icon: '/logo.png',
    })

    reminderPlanen(zeit)
  }, wartezeit)
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_REMINDER') {
    reminderPlanen(event.data.time)
  } else if (event.data?.type === 'CANCEL_REMINDER') {
    clearTimeout(reminderTimeoutId)
    reminderTimeoutId = null
  }
})
