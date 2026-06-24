import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, HelpCircle, RefreshCw } from 'lucide-react'
import PuzzleLayout from '../components/PuzzleLayout'
import HintModal from '../components/HintModal'
import { useGame } from '../context/GameContext'

// Caesar cipher shifted by 7
const ENCRYPTED = 'HALB ZH ILYL. AOPZ PZ UVA H ZPTBSHAPVU.'
const ANSWER    = 'HELP ME HERE. THIS IS NOT A SIMULATION.'
const FRAGMENT  = 'AR3S'

const HINTS = [
  'Each letter has been shifted the same number of positions in the alphabet.',
  'Try shifting each letter back by 7 positions. A→T, B→U, C→V...',
  `The decoded message contains a cry for help. The fragment code is: ${FRAGMENT}`,
]

function shift(text, n) {
  return text.split('').map(ch => {
    if (!/[A-Z]/.test(ch)) return ch
    return String.fromCharCode(((ch.charCodeAt(0) - 65 - n + 26) % 26) + 65)
  }).join('')
}

export default function Puzzle1() {
  const navigate  = useNavigate()
  const { solvePuzzle } = useGame()

  const [shiftVal,  setShiftVal]  = useState(0)
  const [answer,    setAnswer]    = useState('')
  const [showHint,  setShowHint]  = useState(false)
  const [status,    setStatus]    = useState('idle') // idle | wrong | correct

  const decoded = shift(ENCRYPTED, shiftVal)

  function handleSubmit(e) {
    e.preventDefault()
    if (answer.trim().toUpperCase() === FRAGMENT) {
      setStatus('correct')
      setTimeout(() => { solvePuzzle(1, FRAGMENT); navigate('/puzzle/2') }, 1200)
    } else {
      setStatus('wrong')
      setTimeout(() => setStatus('idle'), 1000)
    }
  }

  return (
    <PuzzleLayout puzzleNumber={1}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6 text-center"
      >
        {/* Title */}
        <div>
          <p className="text-white/50 text-[10px] font-medium tracking-[0.2em] uppercase mb-2">
            Challenge 01 · Network Intercept
          </p>
          <h2
            style={{ fontFamily: "'Instrument Serif', serif" }}
            className="text-3xl md:text-5xl font-medium bg-gradient-to-b from-white via-white/95 to-white/60 bg-clip-text text-transparent"
          >
            Decode the transmission
          </h2>
        </div>

        {/* Glass panel */}
        <div className="liquid-glass rounded-2xl p-6 md:p-8 w-full max-w-2xl text-left">

          {/* Intercepted message */}
          <div className="mb-6">
            <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase mb-3 font-medium">
              Intercepted signal — ARES-9 channel 4
            </p>
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10 font-mono text-white/90 tracking-widest text-sm md:text-base leading-loose">
              {ENCRYPTED}
            </div>
          </div>

          {/* Shift slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase font-medium">
                Shift decoder — offset: {shiftVal}
              </p>
              <button
                onClick={() => setShiftVal(0)}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <RefreshCw size={12} />
              </button>
            </div>
            <input
              type="range" min={0} max={25} value={shiftVal}
              onChange={e => setShiftVal(Number(e.target.value))}
              className="w-full accent-white/70 cursor-pointer"
            />
            {/* Live decoded output */}
            <div className="mt-3 bg-white/[0.02] rounded-xl p-4 border border-white/[0.08] font-mono text-white/70 tracking-widest text-sm leading-loose min-h-[52px]">
              {decoded}
            </div>
          </div>

          {/* Fragment input */}
          <form onSubmit={handleSubmit}>
            <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase font-medium mb-3">
              Enter the 4-character fragment code hidden in the message
            </p>
            <div
              className="flex items-center gap-2 pl-5 pr-1.5 py-1.5 border rounded-full bg-white/[0.02] backdrop-blur-sm focus-within:border-white/40 transition-colors duration-300"
              style={{
                borderColor: status === 'correct' ? 'rgba(134,239,172,0.5)'
                           : status === 'wrong'   ? 'rgba(248,113,113,0.5)'
                           : 'rgba(255,255,255,0.15)',
              }}
            >
              <input
                type="text"
                maxLength={6}
                value={answer}
                onChange={e => setAnswer(e.target.value.toUpperCase())}
                placeholder="e.g. XK7A"
                className="flex-1 bg-transparent text-white text-[13px] font-mono tracking-widest outline-none placeholder-white/25 uppercase"
              />
              <button
                type="submit"
                className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
              >
                {status === 'correct'
                  ? <span className="text-green-300 text-xs">✓</span>
                  : status === 'wrong'
                    ? <span className="text-red-400 text-xs">✗</span>
                    : <ArrowRight size={14} className="text-white" />
                }
              </button>
            </div>
          </form>
        </div>

        {/* Hint button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => setShowHint(true)}
          className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-[13px] font-medium tracking-wide"
        >
          <HelpCircle size={13} />
          Request hint
        </motion.button>
      </motion.div>

      {showHint && <HintModal hints={HINTS} onClose={() => setShowHint(false)} />}
    </PuzzleLayout>
  )
}
