import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { HelpCircle, ArrowRight } from 'lucide-react'
import PuzzleLayout from '../components/PuzzleLayout'
import HintModal from '../components/HintModal'
import { useGame } from '../context/GameContext'

// ── Crossword setup ───────────────────────────────────────────
// Hidden keyword reads vertically from the highlighted column: VIRUS
// 1. VENT    → V is at index 0
// 2. GRID    → I is at index 1  (wait — let's align properly)
// Words and their highlighted letter index (0-based):
//
//  1. VAULT    → highlighted index 0 → V
//  2. SIGNAL   → highlighted index 2 → G (no...)
//
// Let's design carefully so highlighted letters spell VIRUS:
//  1. _V_ → REBOOT  no...
// Cleanest approach: each word has ONE highlighted cell, stacked to spell VIRUS
//
//  Row 1: V I R U S E T  → first letter V  → word starting with V
//  Row 2: _ I _ _ _ _ _  → 2nd letter I   → word with I at pos 1
//  Row 3: _ _ R _ _ _ _  → 3rd letter R   → word with R at pos 2
//  Row 4: _ _ _ U _ _ _  → 4th letter U   → word with U at pos 3
//  Row 5: _ _ _ _ S _ _  → 5th letter S   → word with S at pos 4
//
// Words:
//  1. VAULT     (5) → index 0 = V  ✓
//  2. CIPHER    (6) → index 1 = I  ✓
//  3. CORRUPT   (7) → index 2 = R  ✓
//  4. SHUTDOWN  (8) → index 3 = U  ✓ (S-H-U...)  wait: S=0,H=1,U=2... no, index 3 = T
//     NUCLEUS   (7) → index 3 = L  no
//     REBOOT    (6) → index 3 = O  no  (R=0,E=1,B=2,O=3) ✓ wait: R-E-B-O-O-T index3=O no
//     Let's try QUARANTINE → Q=0,U=1,A=2,R=3... no
//     PURSUIT   (7) → P=0,U=1,R=2,S=3,U=4... index 3 = S no
//     LOCKDOWN  (8) → L=0,O=1,C=2,K=3... no
//     INTRUDE   (7) → I=0,N=1,T=2,R=3... no
//     SHUTDOWN  → S=0,H=1,U=2,T=3... index 2 = U ✓ if we use index 2
//
// Let me just define the words cleanly with highlighted index:
//  1. VIRUS    len=5  highlight=0 → V   (the word itself but that's too easy)
// Better:
//  1. VECTOR   len=6  highlight=0 → V
//  2. SILICON  len=7  highlight=1 → I
//  3. CORRUPT  len=7  highlight=2 → R
//  4. NUCLEUS  len=7  highlight=3 → L... no we need U
//     REQUEUE?  not a word
//     FUTURE    len=6  highlight=3 → U  (F=0,U=1,T=2,U=3) ✓
//     PURSUIT   → index 3 = S, not U
//     CAPSULE   → C=0,A=1,P=2,S=3... no
//     QUANTUM   → Q=0,U=1,A=2,N=3... no
//     COMPUTE   → C=0,O=1,M=2,P=3... no
//     RECOUNT   → R=0,E=1,C=2,O=3... no
//     INFILTRATE → too long
//     ROUTINE   → R=0,O=1,U=2,T=3... no
//     ACQUIRE   → A=0,C=1,Q=2,U=3 ✓  U at index 3!
//  5. word with S at index 4:
//     CRASH    → C=0,R=1,A=2,S=3... no, S at index 3
//     ACCESS   → A=0,C=1,C=2,E=3,S=4 ✓  S at index 4!
//
// Final words:
//  1. VECTOR   highlight 0 → V   "Direction and magnitude — ARES-9 moved with ___"
//  2. SILICON  highlight 1 → I   "The material in every microchip"
//  3. CORRUPT  highlight 2 → R   "What ARES-9 did to every file"
//  4. ACQUIRE  highlight 3 → U   "To obtain or gain access to something"  
//  5. ACCESS   highlight 4 → S   "What you need to enter a locked system"
//
// Hidden keyword: V-I-R-U-S = VIRUS ✓

const FRAGMENT = 'VR5S'

const WORDS = [
  {
    id: 1,
    clue: 'ARES-9 moved with purpose and direction — it had a clear ___.',
    answer: 'VECTOR',
    highlight: 0,
    length: 6,
  },
  {
    id: 2,
    clue: 'The material found in every microchip and processor in this facility.',
    answer: 'SILICON',
    highlight: 1,
    length: 7,
  },
  {
    id: 3,
    clue: 'What ARES-9 did to every research file and database record.',
    answer: 'CORRUPT',
    highlight: 2,
    length: 7,
  },
  {
    id: 4,
    clue: 'To gain or obtain something — ARES-9\'s primary objective was to ___ all data.',
    answer: 'ACQUIRE',
    highlight: 3,
    length: 7,
  },
  {
    id: 5,
    clue: 'What this terminal demands before granting entry to any locked system.',
    answer: 'ACCESS',
    highlight: 4,
    length: 6,
  },
]

const KEYWORD = 'VIRUS'

const HINTS = [
  'Each answer has one highlighted letter. Reading those letters top to bottom spells a hidden keyword.',
  'Clue 1 = VECTOR, Clue 3 = CORRUPT, Clue 5 = ACCESS. Use these to work out the hidden word pattern.',
  `All five answers: VECTOR, SILICON, CORRUPT, ACQUIRE, ACCESS. Hidden keyword: VIRUS. Fragment: ${FRAGMENT}`,
]

export default function Puzzle4() {
  const navigate = useNavigate()
  const { solvePuzzle } = useGame()

  const [inputs,   setInputs]   = useState(() => Object.fromEntries(WORDS.map(w => [w.id, ''])))
  const [statuses, setStatuses] = useState(() => Object.fromEntries(WORDS.map(w => [w.id, 'idle'])))
  const [solved,   setSolved]   = useState(() => Object.fromEntries(WORDS.map(w => [w.id, false])))
  const [keyword,  setKeyword]  = useState('')
  const [kwStatus, setKwStatus] = useState('idle')
  const [showHint, setShowHint] = useState(false)

  const allSolved = WORDS.every(w => solved[w.id])

  // Derived: highlighted letters for solved words
  const highlightedLetters = WORDS.map(w =>
    solved[w.id] ? w.answer[w.highlight] : '_'
  )

  function handleWordSubmit(e, word) {
    e.preventDefault()
    const val = inputs[word.id].trim().toUpperCase()
    if (val === word.answer) {
      setSolved(prev  => ({ ...prev,  [word.id]: true }))
      setStatuses(prev => ({ ...prev, [word.id]: 'correct' }))
    } else {
      setStatuses(prev => ({ ...prev, [word.id]: 'wrong' }))
      setTimeout(() => setStatuses(prev => ({ ...prev, [word.id]: 'idle' })), 1000)
    }
  }

  function handleKeyword(e) {
    e.preventDefault()
    if (keyword.trim().toUpperCase() === KEYWORD) {
      setKwStatus('correct')
      setTimeout(() => { solvePuzzle(4, FRAGMENT); navigate('/final') }, 1200)
    } else {
      setKwStatus('wrong')
      setTimeout(() => setKwStatus('idle'), 1000)
    }
  }

  return (
    <PuzzleLayout puzzleNumber={4}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6 text-center"
      >
        {/* Title */}
        <div>
          <p className="text-white/50 text-[10px] font-medium tracking-[0.2em] uppercase mb-2">
            Challenge 04 · Lexical Decryption
          </p>
          <h2
            style={{ fontFamily: "'Instrument Serif', serif" }}
            className="text-3xl md:text-5xl font-medium bg-gradient-to-b from-white via-white/95 to-white/60 bg-clip-text text-transparent"
          >
            Decode the keyword
          </h2>
        </div>

        {/* Instructions */}
        <div className="liquid-glass rounded-2xl p-5 w-full max-w-2xl text-left">
          <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase font-medium mb-2">
            Mission directive
          </p>
          <p className="text-white/60 text-sm leading-relaxed">
            Solve all 5 clues. Each answer has one{' '}
            <span className="text-white/90 font-medium">highlighted letter</span>.
            Reading them top to bottom reveals a hidden keyword — the key to ARES-9's identity.
          </p>
        </div>

        {/* Crossword clues */}
        <div className="liquid-glass rounded-2xl p-5 w-full max-w-2xl text-left space-y-4">
          <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase font-medium">
            Five clues — ARES-9 personnel logs
          </p>

          {WORDS.map((word, wi) => (
            <div key={word.id} className={`rounded-xl border p-4 transition-all duration-300 ${
              solved[word.id]
                ? 'border-white/15 bg-white/[0.02]'
                : statuses[word.id] === 'wrong'
                  ? 'border-red-500/25 bg-red-500/[0.03]'
                  : 'border-white/[0.08] bg-white/[0.01]'
            }`}>
              {/* Clue number + text */}
              <div className="flex items-start gap-3 mb-3">
                <span className="font-mono text-[10px] text-white/30 mt-0.5 shrink-0">
                  [{word.id}]
                </span>
                <p className="text-white/65 text-xs leading-relaxed">{word.clue}</p>
              </div>

              {/* Letter boxes */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1">
                  {Array.from({ length: word.length }).map((_, li) => {
                    const isHighlight = li === word.highlight
                    const letter = solved[word.id] ? word.answer[li] : ''
                    return (
                      <div
                        key={li}
                        className="w-7 h-7 flex items-center justify-center rounded text-[11px] font-mono font-medium transition-all duration-300"
                        style={{
                          background: isHighlight
                            ? solved[word.id] ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'
                            : solved[word.id] ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                          border: isHighlight
                            ? '1px solid rgba(255,255,255,0.35)'
                            : '1px solid rgba(255,255,255,0.1)',
                          color: isHighlight ? '#fff' : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        {letter}
                      </div>
                    )
                  })}
                </div>
                {solved[word.id] && (
                  <span className="text-white/40 text-[10px] font-mono ml-1">✓</span>
                )}
              </div>

              {/* Input */}
              {!solved[word.id] && (
                <form onSubmit={e => handleWordSubmit(e, word)} className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={word.length + 2}
                    value={inputs[word.id]}
                    onChange={e => setInputs(prev => ({ ...prev, [word.id]: e.target.value.toUpperCase() }))}
                    placeholder={`${word.length} letters`}
                    className="flex-1 bg-transparent border-b border-white/30 focus:border-white/70 outline-none text-white font-mono text-xs py-1 placeholder-white/40 tracking-widest transition-colors duration-200"
                  />
                  <button
                    type="submit"
                    className="text-white/50 hover:text-white font-mono text-[10px] tracking-widest transition-colors shrink-0"
                  >
                    [CHECK]
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>

        {/* Hidden keyword reveal */}
        <div className="liquid-glass rounded-2xl p-5 w-full max-w-2xl text-left">
          <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase font-medium mb-4">
            Hidden keyword — highlighted letters
          </p>

          {/* Letter stack */}
          <div className="flex items-center gap-2 mb-5">
            {highlightedLetters.map((letter, i) => (
              <motion.div
                key={i}
                animate={letter !== '_' ? { scale: [1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 flex items-center justify-center rounded-lg font-mono text-base font-medium"
                style={{
                  background: letter !== '_' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                  border: letter !== '_' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: letter !== '_' ? '#fff' : 'rgba(255,255,255,0.15)',
                }}
              >
                {letter}
              </motion.div>
            ))}
            <span className="text-white/20 text-xs font-mono ml-2">← read downward</span>
          </div>

          {/* Keyword input */}
          <AnimatePresence>
            {allSolved && (
              <motion.form
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleKeyword}
              >
                <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase font-medium mb-3">
                  Enter the hidden keyword to extract the fragment
                </p>
                <div
                  className="flex items-center gap-2 pl-5 pr-1.5 py-1.5 border rounded-full bg-white/[0.02] backdrop-blur-sm focus-within:border-white/40 transition-colors duration-300"
                  style={{
                    borderColor: kwStatus === 'correct' ? 'rgba(134,239,172,0.5)'
                               : kwStatus === 'wrong'   ? 'rgba(248,113,113,0.5)'
                               : 'rgba(255,255,255,0.15)',
                  }}
                >
                  <input
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value.toUpperCase())}
                    placeholder="Enter the 5-letter keyword"
                    autoFocus
                    className="flex-1 bg-transparent text-white text-[13px] font-mono tracking-widest outline-none placeholder-white/25 uppercase"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    {kwStatus === 'correct'
                      ? <span className="text-green-300 text-xs">✓</span>
                      : kwStatus === 'wrong'
                        ? <span className="text-red-400 text-xs">✗</span>
                        : <ArrowRight size={14} className="text-white" />
                    }
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {!allSolved && (
            <p className="text-white/20 text-xs font-mono">
              Solve all 5 clues to reveal the keyword...
            </p>
          )}
        </div>

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
