import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { supabase } from '../lib/supabaseClient'

export default function KiZusammenfassung() {
  const [status, setStatus] = useState('laden') // 'laden' | 'denkt' | 'fertig' | 'fehler'
  const [text, setText] = useState('')
  const [fehler, setFehler] = useState('')

  useEffect(() => {
    async function ausfuehren() {
      const { data: anker, error } = await supabase
        .from('anker')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(7)

      if (error) {
        setFehler(error.message)
        setStatus('fehler')
        return
      }

      setStatus('denkt')

      try {
        const response = await fetch('/api/zusammenfassung', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ anker }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error ?? `Serverfehler (${response.status})`)
        }

        setText(data.text)
        setStatus('fertig')
      } catch (e) {
        setFehler(e.message)
        setStatus('fehler')
      }
    }

    ausfuehren()
  }, [])

  return (
    <div className="min-h-screen bg-anker-bg px-6 py-8">
      <div className="max-w-[500px] mx-auto">
        <Link to="/" className="text-base text-slate-400 hover:text-slate-600">
          ← Zurück
        </Link>

        <div className="flex items-center gap-3 mt-6 mb-8">
          <img src="/maskottchen.png" alt="Klar" style={{ height: '40px' }} />
          <h1 className="text-2xl font-semibold text-anker-accent">
            Mein Lernkontext
          </h1>
        </div>

        {(status === 'laden' || status === 'denkt') && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-anker-accent/20 border-t-anker-accent animate-spin mb-4" />
            <p className="text-base text-slate-500">Ich lese deine letzten Sessions...</p>
          </div>
        )}

        {status === 'fertig' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 text-lg text-slate-700 leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p>{children}</p>,
                strong: ({ children }) => <strong className="text-anker-accent">{children}</strong>,
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        )}

        {status === 'fehler' && (
          <div className="bg-white rounded-2xl border border-red-200 p-6">
            <p className="text-sm text-slate-400 mb-2">Fehlerdetails</p>
            <p className="text-base text-red-600 break-words whitespace-pre-wrap font-mono">{fehler}</p>
          </div>
        )}
      </div>
    </div>
  )
}
