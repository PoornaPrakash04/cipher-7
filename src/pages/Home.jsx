import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useGame } from '../context/GameContext'
import BackgroundVideo from '../components/BackgroundVideo'

const TAGLINE = 'CLASSIFIED // AXIOM RESEARCH LABS // SECTOR 7'

function useTypewriter(text, active, speed = 45) {
  const [displayed, setDisplayed] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    if (!active) { setDisplayed(''); return }
    setDisplayed('')
    let i = 0
    function tick() { i++; setDisplayed(text.slice(0, i)); if (i < text.length) ref.current = setTimeout(tick, speed) }
    ref.current = setTimeout(tick, speed)
    return () => clearTimeout(ref.current)
  }, [text, active, speed])
  return displayed
}

export default function Home() {
  const navigate = useNavigate()
  const { startGame, resetGame, loading, error } = useGame()

  const [teamName,  setTeamName]  = useState('')
  const [shake,     setShake]     = useState(false)
  const [showForm,  setShowForm]  = useState(false)

  // typewriter for the input placeholder
  const placeholder = useTypewriter('Enter team designation...', showForm, 60)

  async function handleStart(e) {
    e.preventDefault()
    if (!teamName.trim()) { setShake(true); setTimeout(() => setShake(false), 500); return }
    resetGame(); await startGame(teamName.trim())
    navigate('/puzzle/1')
  }

  return (
    <main className="relative bg-black h-screen w-screen flex flex-col overflow-hidden selection:bg-white selection:text-black shrink-0">
      <BackgroundVideo />
      <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none" />

      {/* ── Navbar ─────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 px-6 py-6 w-full"
      >
        <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            {/* Pulsing status dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-white/60 text-xs font-medium tracking-[0.15em] uppercase">
              Facility Lockdown
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-white/60 text-sm font-medium">
            <span>45:00</span>
            <span>5 Challenges</span>
            <span>Sector 7</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs tracking-widest font-medium">CIPHER-7</span>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center justify-center w-full gap-10">

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-[10px] md:text-[11px] font-medium tracking-[0.2em] uppercase"
          >
            {TAGLINE}
          </motion.p>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Instrument Serif', serif" }}
            className="text-4xl md:text-[64px] font-medium tracking-[-0.01em] leading-[1.1] bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent max-w-4xl"
          >
            A rogue AI has locked
            <br className="hidden md:block" />
            down the facility
          </motion.h1>

          {/* Sub-heading */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/50 text-sm md:text-base font-light max-w-md leading-relaxed"
          >
            You have 45 minutes to solve 5 security challenges and shut down ARES-9 before the reactor reaches critical.
          </motion.p>

          {/* CTA — same pattern as spec: button → form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="min-h-[50px] mt-2"
          >
            <AnimatePresence mode="wait">
              {!showForm ? (
                <motion.button
                  key="cta-button"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setShowForm(true)}
                  className="px-10 py-3 text-[14px] font-medium border border-white/10 rounded-full hover:border-white/30 hover:bg-white/[0.02] transition-all duration-300 text-white/90 backdrop-blur-sm cursor-pointer"
                >
                  Begin Mission
                </motion.button>
              ) : (
                <motion.form
                  key="cta-form"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleStart}
                  className="flex items-center gap-2 pl-5 pr-1.5 py-1.5 text-[14px] font-medium border border-white/20 rounded-full bg-white/[0.02] backdrop-blur-sm w-full max-w-[340px] focus-within:border-white/40 transition-colors duration-300"
                >
                  <motion.input
                    animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}}
                    type="text"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder={placeholder}
                    autoFocus
                    maxLength={32}
                    className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder-white/35 min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40"
                  >
                    <ArrowRight size={14} className="text-white" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
            {error && (
              <p className="text-red-400/80 text-xs text-center mt-3 font-medium">{error}</p>
            )}
          </motion.div>

          {/* Bottom hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-white/30 text-[13px] font-medium tracking-wide">
              5 puzzles · 45 minutes · no escape
            </span>
          </motion.div>

        </div>
      </section>
    </main>
  )
}
