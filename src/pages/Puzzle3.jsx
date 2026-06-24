import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { HelpCircle, ArrowRight } from 'lucide-react'
import PuzzleLayout from '../components/PuzzleLayout'
import HintModal from '../components/HintModal'
import { useGame } from '../context/GameContext'

// ── Answer: Dr. Patel, Floor 3, Lab Gamma, Biology ────────────
const FRAGMENT = 'PT4L'
const ANSWER   = 'PATEL'

const SCIENTISTS = ['Dr. Voss', 'Dr. Chen', 'Dr. Patel', 'Dr. Okafor', 'Dr. Lima']
const FLOORS     = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5']
const LABS       = ['Lab Alpha', 'Lab Beta', 'Lab Gamma', 'Lab Delta', 'Lab Epsilon']
const FIELDS     = ['Physics', 'Chemistry', 'Biology', 'Computing', 'Engineering']

const CLUES = [
  { id: 1, text: 'The scientist on Floor 3 works in Lab Gamma.' },
  { id: 2, text: 'Dr. Chen is on a floor higher than Dr. Voss, but lower than Dr. Patel.' },
  { id: 3, text: 'The biologist works directly above the chemist — one floor apart.' },
  { id: 4, text: 'Dr. Okafor works in Lab Delta on Floor 5. Dr. Lima is in Engineering.' },
  { id: 5, text: 'ARES-9 log: "Key secured with the biologist on Floor 3."' },
]

const HINTS = [
  'Start with Clue 4 — it places Dr. Okafor and tells you Dr. Lima\'s field. Then use Clue 5 to find the floor.',
  'Clue 5 directly tells you the floor (3) and field (Biology). Clue 1 tells you Floor 3 = Lab Gamma. Clue 2 narrows down who is on Floor 3.',
  `Dr. Patel is the biologist on Floor 3 in Lab Gamma. The answer is PATEL. Fragment code: ${FRAGMENT}`,
]

// Cell states cycle: null → true (✓) → false (✗) → null
function nextState(s) {
  if (s === null)  return true
  if (s === true)  return false
  return null
}

function GridCell({ value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full h-8 flex items-center justify-center border-r border-white/[0.07] last:border-r-0 transition-all duration-150 hover:bg-white/[0.04] cursor-pointer text-sm"
      style={{
        background: value === true  ? 'rgba(134,239,172,0.08)' :
                    value === false ? 'rgba(248,113,113,0.06)' : 'transparent',
      }}
    >
      {value === true  && <span className="text-green-400/90 text-xs">✓</span>}
      {value === false && <span className="text-red-400/60  text-xs">✗</span>}
    </button>
  )
}

export default function Puzzle3() {
  const navigate = useNavigate()
  const { solvePuzzle } = useGame()

  // grid[scientist][colKey] = null | true | false
  const makeGrid = () => {
    const g = {}
    SCIENTISTS.forEach(s => {
      g[s] = {}
      ;[...FLOORS, ...LABS, ...FIELDS].forEach(k => { g[s][k] = null })
    })
    return g
  }
  const [grid,    setGrid]    = useState(makeGrid)
  const [answer,  setAnswer]  = useState('')
  const [status,  setStatus]  = useState('idle')
  const [showHint, setShowHint] = useState(false)

  function toggle(scientist, key) {
    setGrid(prev => ({
      ...prev,
      [scientist]: { ...prev[scientist], [key]: nextState(prev[scientist][key]) },
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (answer.trim().toUpperCase() === ANSWER) {
      setStatus('correct')
      setTimeout(() => { solvePuzzle(3, FRAGMENT); navigate('/puzzle/4') }, 1200)
    } else {
      setStatus('wrong')
      setTimeout(() => setStatus('idle'), 1000)
    }
  }

  // Column groups
  const groups = [
    { label: 'FLOOR',       cols: FLOORS  },
    { label: 'LAB',         cols: LABS    },
    { label: 'SPECIALITY',  cols: FIELDS  },
  ]

  return (
    <PuzzleLayout puzzleNumber={3}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6 text-center"
      >
        {/* Title */}
        <div>
          <p className="text-white/50 text-[10px] font-medium tracking-[0.2em] uppercase mb-2">
            Challenge 03 · Personnel Analysis
          </p>
          <h2
            style={{ fontFamily: "'Instrument Serif', serif" }}
            className="text-3xl md:text-5xl font-medium bg-gradient-to-b from-white via-white/95 to-white/60 bg-clip-text text-transparent"
          >
            Find the keyholder
          </h2>
        </div>

        {/* Clues */}
        <div className="liquid-glass rounded-2xl p-5 w-full max-w-3xl text-left">
          <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase font-medium mb-3">
            Intercepted ARES-9 personnel files
          </p>
          <div className="space-y-2">
            {CLUES.map(c => (
              <div key={c.id} className="flex items-start gap-3">
                <span className="font-mono text-[10px] text-white/25 mt-0.5 shrink-0">
                  [{String(c.id).padStart(2,'0')}]
                </span>
                <p className="text-white/70 text-sm leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Logic Grid */}
        <div className="liquid-glass rounded-2xl p-4 w-full max-w-3xl text-left overflow-x-auto">
          <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase font-medium mb-4">
            Logic grid — click to mark ✓ (yes) or ✗ (no)
          </p>

          <table className="w-full border-collapse text-xs" style={{ minWidth: '600px' }}>
            <thead>
              {/* Group headers */}
              <tr>
                <th className="w-24 border-b border-r border-white/10" />
                {groups.map(g => (
                  <th
                    key={g.label}
                    colSpan={g.cols.length}
                    className="text-center pb-1 border-b border-r border-white/10 font-mono text-[9px] tracking-widest text-white/30 last:border-r-0"
                  >
                    {g.label}
                  </th>
                ))}
              </tr>
              {/* Column labels */}
              <tr>
                <th className="border-b border-r border-white/10 pb-2" />
                {groups.flatMap(g => g.cols).map((col, i) => (
                  <th
                    key={col}
                    className="border-b border-r border-white/[0.07] last:border-r-0 pb-2 px-1 font-mono text-[9px] text-white/40 font-normal text-center"
                    style={{ minWidth: '58px' }}
                  >
                    {col.replace('Floor ', 'F').replace('Lab ', '').replace('Lab', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCIENTISTS.map((sci, si) => (
                <tr key={sci} className={si % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                  {/* Scientist name */}
                  <td className="border-r border-white/10 pr-2 py-1 font-medium text-white/70 text-[11px] whitespace-nowrap">
                    {sci}
                  </td>
                  {/* Cells */}
                  {groups.flatMap(g => g.cols).map(col => (
                    <td key={col} className="border-r border-white/[0.07] last:border-r-0 p-0">
                      <GridCell
                        value={grid[sci][col]}
                        onClick={() => toggle(sci, col)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Answer input */}
        <div className="liquid-glass rounded-2xl p-5 w-full max-w-3xl text-left">
          <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase font-medium mb-3">
            Which scientist holds the access key? Enter their last name.
          </p>
          <form onSubmit={handleSubmit}>
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
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="e.g. CHEN"
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
