import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import BackgroundVideo from '../components/BackgroundVideo'
import { useGame } from '../context/GameContext'

const LINES = [
  '> Shutdown sequence accepted...',
  '> Terminating ARES-9 core processes...',
  '> Decrypting research vault...',
  '> Restoring facility systems...',
  '> ARES-9 OFFLINE.',
  '> Facility lockdown: LIFTED.',
]

function useTypingLines(lines) {
  const [visibleLines, setVisibleLines] = useState([])
  const [currentLine,  setCurrentLine]  = useState(0)
  const [currentText,  setCurrentText]  = useState('')
  const [done,         setDone]         = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (currentLine >= lines.length) { setDone(true); return }
    const line = lines[currentLine]
    if (currentText.length < line.length) {
      timerRef.current = setTimeout(() => {
        setCurrentText(line.slice(0, currentText.length + 1))
      }, 20)
    } else {
      timerRef.current = setTimeout(() => {
        setVisibleLines(prev => [...prev, { text: line, index: currentLine }])
        setCurrentLine(c => c + 1)
        setCurrentText('')
      }, 220)
    }
    return () => clearTimeout(timerRef.current)
  }, [currentLine, currentText, lines])

  return { visibleLines, currentLine, currentText, done }
}

export default function Success() {
  const navigate  = useNavigate()
  const { teamName, elapsedSeconds, hintsUsed, formatTime, gameStatus, resetGame } = useGame()
  const { visibleLines, currentLine, currentText, done } = useTypingLines(LINES)

  // If someone lands here directly without playing, redirect
  useEffect(() => {
    if (gameStatus === 'idle') navigate('/')
  }, [gameStatus, navigate])

  const mins = Math.floor(elapsedSeconds / 60)
  const secs = elapsedSeconds % 60
  const timeStr = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`

  return (
    <main className="relative bg-black h-screen w-screen flex flex-col items-center justify-center overflow-hidden selection:bg-white selection:text-black">
      <BackgroundVideo />
      <div className="absolute inset-0 bg-black/70 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl mx-4 flex flex-col items-center gap-6 text-center"
      >
        {/* Terminal boot lines */}
        <div className="liquid-glass rounded-2xl p-5 w-full text-left">
          <div className="space-y-1 font-mono text-xs min-h-[120px]">
            {visibleLines.map(({ text, index }) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={
                  text.includes('OFFLINE') || text.includes('LIFTED')
                    ? 'text-green-400/80'
                    : text.includes('ARES-9')
                      ? 'text-red-400/50'
                      : 'text-white/40'
                }
              >
                {text}
              </motion.div>
            ))}
            {!done && (
              <div className="text-white/40">
                {currentText}<span className="animate-pulse">_</span>
              </div>
            )}
          </div>
        </div>

        {/* Success reveal */}
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center gap-5"
          >
            {/* Heading */}
            <div>
              <p className="text-white/50 text-[10px] font-medium tracking-[0.2em] uppercase mb-3">
                Mission complete
              </p>
              <h1
                style={{ fontFamily: "'Instrument Serif', serif" }}
                className="text-4xl md:text-6xl font-medium bg-gradient-to-b from-white via-white/95 to-white/60 bg-clip-text text-transparent leading-tight"
              >
                ARES-9 defeated
              </h1>
            </div>

            {/* Stats */}
            <div className="liquid-glass rounded-2xl p-5 w-full">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-white/30 text-[9px] font-mono tracking-widest uppercase mb-1">
                    Team
                  </p>
                  <p className="text-white font-semibold text-sm truncate">
                    {teamName || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-white/30 text-[9px] font-mono tracking-widest uppercase mb-1">
                    Time taken
                  </p>
                  <p className="text-white font-mono text-lg font-medium">
                    {timeStr}
                  </p>
                </div>
                <div>
                  <p className="text-white/30 text-[9px] font-mono tracking-widest uppercase mb-1">
                    Hints used
                  </p>
                  <p className="text-white font-mono text-lg font-medium">
                    {hintsUsed}
                  </p>
                </div>
              </div>
            </div>

            {/* Flavour */}
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-sm">
              The facility is secure. Research data has been restored.
              Your team prevented a catastrophic reactor meltdown.
            </p>

            {/* Play again */}
            <button
              onClick={() => { resetGame(); navigate('/') }}
              className="px-10 py-3 text-[14px] font-medium border border-white/10 rounded-full hover:border-white/30 hover:bg-white/[0.02] transition-all duration-300 text-white/70 backdrop-blur-sm cursor-pointer"
            >
              Play again
            </button>
          </motion.div>
        )}
      </motion.div>
    </main>
  )
}
