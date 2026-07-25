export default function StudyAnkerLogo({ size = 80, color = '#1C3A52' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ring oben */}
      <circle cx="50" cy="13" r="9" stroke={color} strokeWidth="5.5" fill="none" />
      {/* Schaft */}
      <line x1="50" y1="22" x2="50" y2="88" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
      {/* Querbalken */}
      <line x1="26" y1="38" x2="74" y2="38" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
      {/* A-Beine */}
      <line x1="50" y1="22" x2="20" y2="82" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
      <line x1="50" y1="22" x2="80" y2="82" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
      {/* Anker-Arme links */}
      <path d="M20 82 C10 88 8 96 14 100" stroke={color} strokeWidth="5.5" strokeLinecap="round" fill="none" />
      {/* Anker-Arme rechts */}
      <path d="M80 82 C90 88 92 96 86 100" stroke={color} strokeWidth="5.5" strokeLinecap="round" fill="none" />
      {/* Buch unten — zwei Seiten */}
      <path d="M33 90 Q50 84 67 90 Q50 96 33 90Z" fill={color} opacity="0.7" />
      <line x1="50" y1="84" x2="50" y2="96" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Doktorhut */}
      <rect x="32" y="8" width="36" height="6" rx="1" fill={color} />
      <polygon points="50,2 68,8 50,14 32,8" fill={color} />
      <line x1="68" y1="8" x2="72" y2="16" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="72" cy="17" r="2" fill={color} />
    </svg>
  )
}
