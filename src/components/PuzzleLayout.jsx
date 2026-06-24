import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import BackgroundVideo from './BackgroundVideo'
import { useGame } from '../context/GameContext'

const STEPS = ['NET', 'CRYPT', 'LOGIC', 'LEX', 'CORE']

function Timer() {
  const { timeLeft, formatTime } = useGame()
  const pct       = timeLeft / (45 * 60)
  const isDanger  = timeLeft <= 5  * 60
  const isWarning = timeLeft <= 10 * 60
  const color     = isDanger ? '#ff4d6a' : isWarning ? '#ffaa00' : '#ffffff'

  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className="font-mono text-xl font-medium tracking-widest"
        style={{ color, transition: 'color 1s' }}
      >
        {formatTime()}
      </span>
      <div className="w-20 h-px bg-white/10">
        <div
          className="h-full transition-all duration-1000"
          style={{ width: `${pct * 100}%`, background: color }}
        />
      </div>
    </div>
  )
}

function ProgressNodes() {
  const { currentPuzzle } = useGame()
  return (
    <div className="hidden md:flex items-center gap-2">
      {STEPS.map((label, i) => {
        const num    = i + 1
        const done   = num < currentPuzzle
        const active = num === currentPuzzle

        return (
          <div key={num} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-mono font-medium transition-all duration-300"
                style={{
                  background: done   ? 'rgba(255,255,255,0.18)' :
                              active ? 'rgba(255,255,255,0.10)' :
                                       'rgba(255,255,255,0.03)',
                  border: `1px solid ${
                    done   ? 'rgba(255,255,255,0.45)' :
                    active ? 'rgba(255,255,255,0.35)' :
                             'rgba(255,255,255,0.12)'
                  }`,
                  color: done   ? 'rgba(255,255,255,1)'  :
                         active ? 'rgba(255,255,255,0.9)' :
                                  'rgba(255,255,255,0.25)',
                  boxShadow: active ? '0 0 12px rgba(255,255,255,0.15)' : 'none',
                }}
              >
                {done ? '✓' : num}
              </div>
              <span
                className="text-[8px] font-mono tracking-widest"
                style={{
                  color: done   ? 'rgba(255,255,255,0.6)' :
                         active ? 'rgba(255,255,255,0.7)' :
                                  'rgba(255,255,255,0.2)',
                }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-5 h-px mb-4 transition-all duration-500"
                style={{
                  background: done ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function PuzzleLayout({ children, puzzleNumber }) {
  const { teamName, gameStatus } = useGame()
  const navigate = useNavigate()

  if (gameStatus === 'failed')    navigate('/')
  if (gameStatus === 'completed') navigate('/success')

  return (
    <main className="relative bg-black h-screen w-screen flex flex-col overflow-hidden selection:bg-white selection:text-black shrink-0">
      <BackgroundVideo />

      {/* Stronger overlay for readability */}
      <div className="absolute inset-0 bg-black/70 z-10 pointer-events-none" />

      {/* HUD Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 px-6 py-5 w-full"
      >
        <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">

          {/* Left */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-white font-semibold text-sm truncate max-w-[120px]">
                {teamName || 'TEAM'}
              </span>
            </div>
            <span className="hidden md:block text-white/20 text-xs">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-white/60 text-xs font-medium tracking-[0.1em] uppercase">
              <AlertTriangle size={10} className="text-red-400" />
              Challenge {puzzleNumber} of 5
            </span>
          </div>

          {/* Centre: progress nodes */}
          <ProgressNodes />

          {/* Right: timer */}
          <Timer />
        </div>
      </motion.nav>

      {/* Puzzle content — scrollable */}
      <section className="relative z-20 flex-1 flex flex-col items-center px-6 py-6 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">
          {children}
        </div>
      </section>
    </main>
  )
}
