import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { HelpCircle, ArrowRight, Zap } from 'lucide-react'
import PuzzleLayout from '../components/PuzzleLayout'
import HintModal from '../components/HintModal'
import { useGame } from '../context/GameContext'

// ── The 4 fragments collected across puzzles ──────────────────
// P1: AR3S  P2: N3X5  P3: PT4L  P4: VR5S
// Final code = first character of each fragment in order: A-N-P-V → ANPV? 
// Better: teams must arrange fragments to form the shutdown sequence
// The correct order is numerical by the digit in each fragment:
// AR3S(3), N3X5(3)... let's do it differently:
// Teams enter all 4 fragments into 4 slots, then hit INITIATE
// The correct SHUTDOWN CODE is the digits extracted from each fragment in puzzle order:
// AR3S → 3, N3X5 → 3... duplicates. 
// Let's use a different approach: combine first letters: A + N + P + V = ANPV, not great
// Best approach: the shutdown code is simply all 4 fragments entered in the correct order
// shown as a combined string: AR3S-N3X5-PT4L-VR5S
// But that's too easy if they just copy them.
// 
// Let's make it: extract the NUMBER from each fragment (puzzle order) → 3, 5, 4, 5
// The shutdown sequence = those digits in reverse order: 5-4-5-3 → 5453
// That's the final code they type.

const FRAGMENTS = [
  { puzzle: 1, label: 'Fragment Alpha', code: 'AR3S',  digit: '3' },
  { puzzle: 2, label: 'Fragment Beta',  code: 'N3X5',  digit: '5' },  // wait N3X5 has 3 and 5
  { puzzle: 3, label: 'Fragment Gamma', code: 'PT4L',  digit: '4' },
  { puzzle: 4, label: 'Fragment Delta', code: 'VR5S',  digit: '5' },
]
// digits in order: 3,5,4,5 → reversed: 5,4,5,3 → SHUTDOWN CODE: 5453
// But 5 appears twice which is confusing. Let me fix the digits:
// P1: AR3S → 3
// P2: N3X5 → use just the last digit: 5  
// P3: PT4L → 4
// P4: VR5S → 5... still duplicates
// 
// Simplest satisfying final: they see all 4 fragments, 
// extract ONE digit from each (the number embedded), sum them: 3+5+4+5=17? no
// OR: arrange by digit ascending → AR3S(3), PT4L(4), N3X5(5), VR5S(5)... still dupes
//
// Cleanest: the shutdown code = digits concatenated in PUZZLE ORDER = 3-4-5-5? 
// Let me just redesign fragment codes to have unique digits:
// P1: AR3S → 3   P2: N7X2 → 2   P3: PT4L → 4   P4: VR6S → 6
// Shutdown = digits in order = 3246? Or reversed = 6423
// Let's do: reverse order = 6-4-2-3 = 6423
// But we already told people the fragment codes. Let me keep P1,P3,P4 and fix P2:

// FINAL DECISION - clean unique digits:
// P1: AR3S → 3  (already shipped)
// P2: N3X5 → use digit 5 (last number in fragment)  
// P3: PT4L → 4
// P4: VR5S → use digit 5... 
// 
// You know what, let's just make the shutdown code the FIRST LETTER of each fragment in order:
// AR3S → A,  N3X5 → N,  PT4L → P,  VR5S → V  → ANPV
// Nah.
//
// FINAL FINAL: The shutdown code is simply: take the digit from each fragment, 
// read them in puzzle order → 3, 5, 4, 5
// But ARES-9 encrypted it: add 1 to each digit → 4, 6, 5, 6 → type 4656
// That's the twist - the clue on screen tells them "+1 to each digit"

const SHUTDOWN_CODE = '4656'  // digits from fragments (3,5,4,5) each +1

const HINTS = [
  'Extract the digit hidden inside each fragment code. Read them in puzzle order.',
  'The digits are: AR3S→3, N3X5→5, PT4L→4, VR5S→5. But ARES-9 encrypted the sequence — add 1 to each digit.',
  `The shutdown code is 3+1, 5+1, 4+1, 5+1 = 4, 6, 5, 6. Enter: ${SHUTDOWN_CODE}`,
]

// Typing animation for terminal lines
function useTypingLines(lines, active) {
  const [visibleLines, setVisibleLines] = useState([])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active || currentLine >= lines.length) return
    const line = lines[currentLine]
    if (currentText.length < line.length) {
      timerRef.current = setTimeout(() => {
        setCurrentText(line.slice(0, currentText.length + 1))
      }, 22)
    } else {
      timerRef.current = setTimeout(() => {
        setVisibleLines(prev => [...prev, { text: line, index: currentLine }])
        setCurrentLine(prev => prev + 1)
        setCurrentText('')
      }, 180)
    }
    return () => clearTimeout(timerRef.current)
  }, [active, currentLine, currentText, lines])

  return { visibleLines, currentLine, currentText, done: currentLine >= lines.length }
}

const BOOT_LINES = [
  '> CIPHER-7 FINAL PROTOCOL INITIATED',
  '> Cross-referencing collected fragments...',
  '> Fragment integrity: VERIFIED',
  '> ARES-9 encryption layer detected on shutdown sequence.',
  '> Each fragment digit has been offset by +1.',
  '> Reverse the offset to reconstruct the true shutdown code.',
  '> Awaiting authorisation input...',
]

export default function FinalPuzzle() {
  const navigate = useNavigate()
  const { solvePuzzle, finishGame, fragments } = useGame()

  const [code,      setCode]      = useState(['', '', '', ''])
  const [status,    setStatus]    = useState('idle')
  const [showHint,  setShowHint]  = useState(false)
  const [booting,   setBooting]   = useState(true)

  const { visibleLines, currentLine, currentText, done: bootDone } =
    useTypingLines(BOOT_LINES, booting)

  function updateCode(i, val) {
    const digits = val.replace(/\D/g, '').slice(0, 1)
    const next = [...code]
    next[i] = digits
    setCode(next)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const entered = code.join('')
    if (entered === SHUTDOWN_CODE) {
      setStatus('correct')
      setTimeout(() => {
        solvePuzzle(5, SHUTDOWN_CODE)
        finishGame()
        navigate('/success')
      }, 1500)
    } else {
      setStatus('wrong')
      setTimeout(() => setStatus('idle'), 1000)
    }
  }

  return (
    <PuzzleLayout puzzleNumber={5}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6 text-center"
      >
        {/* Title */}
        <div>
          <p className="text-white/50 text-[10px] font-medium tracking-[0.2em] uppercase mb-2">
            Final Challenge · Shutdown Protocol
          </p>
          <h2
            style={{ fontFamily: "'Instrument Serif', serif" }}
            className="text-3xl md:text-5xl font-medium bg-gradient-to-b from-white via-white/95 to-white/60 bg-clip-text text-transparent"
          >
            Shut down ARES-9
          </h2>
        </div>

        {/* Terminal boot sequence */}
        <div className="liquid-glass rounded-2xl p-5 w-full max-w-2xl text-left">
          <div className="space-y-1 font-mono text-xs min-h-[140px]">
            {visibleLines.map(({ text, index }) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={
                  text.includes('VERIFIED') ? 'text-green-400/70' :
                  text.includes('ARES-9') || text.includes('encrypted') ? 'text-red-400/60' :
                  text.includes('CIPHER-7') ? 'text-white/80' :
                  'text-white/40'
                }
              >
                {text}
              </motion.div>
            ))}
            {!bootDone && currentLine < BOOT_LINES.length && (
              <div className="text-white/40">
                {currentText}
                <span className="animate-pulse">_</span>
              </div>
            )}
          </div>
        </div>

        {/* Collected fragments display */}
        <AnimatePresence>
          {bootDone && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="liquid-glass rounded-2xl p-5 w-full max-w-2xl text-left"
            >
              <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase font-medium mb-4">
                Collected fragments — extract each digit, add 1
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                {FRAGMENTS.map((f, i) => (
                  <motion.div
                    key={f.puzzle}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-center"
                  >
                    <p className="text-white/30 text-[9px] font-mono tracking-widest mb-2">
                      {f.label}
                    </p>
                    <p className="font-mono text-lg font-medium text-white tracking-[0.2em]">
                      {/* highlight the digit */}
                      {f.code.split('').map((ch, ci) => (
                        <span
                          key={ci}
                          style={{ color: /\d/.test(ch) ? '#fff' : 'rgba(255,255,255,0.3)' }}
                        >
                          {ch}
                        </span>
                      ))}
                    </p>
                    <p className="text-white/25 text-[9px] font-mono mt-2">
                      digit: <span className="text-white/60">{f.digit}</span>
                      {' → '}
                      <span className="text-white/80">{parseInt(f.digit) + 1}</span>
                    </p>
                  </motion.div>
                ))}
              </div>
              <p className="text-white/30 text-[10px] font-mono text-center mt-3">
                Shutdown sequence = encrypted digits in order → enter all 4 below
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Code input */}
        <AnimatePresence>
          {bootDone && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="liquid-glass rounded-2xl p-5 w-full max-w-2xl text-left"
            >
              <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase font-medium mb-5">
                Enter the 4-digit shutdown code
              </p>

              <form onSubmit={handleSubmit}>
                {/* 4 digit boxes */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => updateCode(i, e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !digit && i > 0) {
                          document.getElementById(`code-${i - 1}`)?.focus()
                        }
                      }}
                      onInput={e => {
                        if (e.target.value && i < 3) {
                          document.getElementById(`code-${i + 1}`)?.focus()
                        }
                      }}
                      id={`code-${i}`}
                      className="w-14 h-14 text-center text-2xl font-mono font-medium bg-white/[0.04] border rounded-xl outline-none transition-all duration-200 text-white"
                      style={{
                        borderColor: status === 'correct' ? 'rgba(134,239,172,0.5)'
                                   : status === 'wrong'   ? 'rgba(248,113,113,0.4)'
                                   : digit ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)',
                        boxShadow: digit ? '0 0 12px rgba(255,255,255,0.05)' : 'none',
                      }}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={code.some(d => d === '')}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 text-[13px] font-medium border border-white/15 rounded-full hover:border-white/35 hover:bg-white/[0.03] transition-all duration-300 text-white/80 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {status === 'correct' ? (
                    <><Zap size={14} className="text-green-400" /> Shutdown initiated...</>
                  ) : status === 'wrong' ? (
                    <span className="text-red-400/80">Incorrect code — try again</span>
                  ) : (
                    <><ArrowRight size={14} /> Initiate shutdown sequence</>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
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
