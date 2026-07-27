import { useTheme } from '../useTheme'

export default function StudyAnkerLogo({ size = 80 }) {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '12px',
        background: isDarkMode ? 'rgba(255, 255, 255, 0.92)' : 'transparent',
      }}
    >
      <img
        src="/logo.png"
        alt="StudyAnker Logo"
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          mixBlendMode: 'multiply',
          borderRadius: '12px',
          background: 'transparent',
        }}
      />
    </div>
  )
}
