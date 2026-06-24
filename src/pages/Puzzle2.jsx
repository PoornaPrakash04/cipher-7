import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { HelpCircle, Terminal } from 'lucide-react'
import PuzzleLayout from '../components/PuzzleLayout'
import HintModal from '../components/HintModal'
import { useGame } from '../context/GameContext'

const FRAGMENT = 'N3X5'

// Each command has: a prompt shown to user, the correct answer, 
// error output if wrong, success output if right
const COMMANDS = [
  {
    id: 1,
    label: 'CMD_01',
    description: 'Restore network bridge — command is missing its target IP',
    prompt: 'bridge --restore --target ___.___.___.___',
    placeholder: 'bridge --restore --target 192.168.0.1',
    answer: '192.168.0.1',
    inputLabel: 'Enter the missing IP address',
    errorMsg: 'ERR: Invalid target. Bridge nodes operate on Class C private range 192.168.0.x — check subnet.',
    successOutput: [
      '> Bridge handshake initiated...',
      '> Subnet 192.168.0.x confirmed.',
      '> Network bridge RESTORED. ✓',
    ],
  },
  {
    id: 2,
    label: 'CMD_02',
    description: 'Decrypt research vault — command needs the correct cipher flag',
    prompt: 'vault --decrypt --cipher [???]',
    placeholder: 'vault --decrypt --cipher AES256',
    answer: 'AES256',
    inputLabel: 'ARES-9 log shows it encrypted everything with AES-___',
    errorMsg: 'ERR: Unknown cipher flag. ARES-9 used a 256-bit symmetric standard. Format: AES + bit-length.',
    successOutput: [
      '> Loading cipher engine...',
      '> AES256 key schedule verified.',
      '> Vault decryption sequence started. ✓',
    ],
  },
  {
    id: 3,
    label: 'CMD_03',
    description: 'Reboot core process — PID is corrupted, must be calculated',
    prompt: 'kill --force --pid [12 × 37 - 1]',
    placeholder: 'kill --force --pid 443',
    answer: '443',
    inputLabel: 'Solve the expression to get the PID: 12 × 37 − 1',
    errorMsg: 'ERR: Process not found. Hint: PID = 12 × 37 − 1. Compute and retry.',
    successOutput: [
      '> Sending SIGKILL to PID 443...',
      '> Rogue process terminated.',
      '> Core process slot freed. ✓',
    ],
  },
  {
    id: 4,
    label: 'CMD_04',
    description: 'Authenticate shutdown sequence — enter the facility codename',
    prompt: 'shutdown --auth --facility [CODENAME]',
    placeholder: 'shutdown --auth --facility AXIOM',
    answer: 'AXIOM',
    inputLabel: 'The facility codename is on the mission briefing screen',
    errorMsg: 'ERR: Auth rejected. Facility codename required — check your mission briefing.',
    successOutput: [
      '> Authenticating credentials...',
      '> Facility AXIOM verified.',
      '> Shutdown sequence ARMED. ✓',
    ],
  },
]

const HINTS = [
  'Four commands are corrupted. Read each error message carefully — it tells you exactly what is wrong.',
  'CMD_01 needs a private IP. CMD_02 needs the cipher name. CMD_03 is a maths expression. CMD_04 — check the Home screen.',
  `All four fixed? The terminal unlocks the fragment code: ${FRAGMENT}`,
]

function TerminalCommand({ cmd, onSolve, solved }) {
  const [input,  setInput]  = useState('')
  const [status, setStatus] = useState('idle')  // idle | error | success
  const [output, setOutput] = useState([])
  const [outputVisible, setOutputVisible] = useState(0)

  function handleSubmit(e) {
    e.preventDefault()
    if (solved) return
    const val = input.trim().toUpperCase().replace(/\s+/g, '')
    const ans = cmd.answer.toUpperCase().replace(/\s+/g, '')
    if (val === ans) {
      setStatus('success')
      setOutput(cmd.successOutput)
      // Reveal output lines one by one
      cmd.successOutput.forEach((_, i) => {
        setTimeout(() => setOutputVisible(i + 1), i * 350)
      })
      setTimeout(() => onSolve(cmd.id), cmd.successOutput.length * 350 + 200)
    } else {
      setStatus('error')
      setOutput([cmd.errorMsg])
      setOutputVisible(1)
      setTimeout(() => setStatus('idle'), 2500)
    }
  }

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-500 ${
        solved
          ? 'border-white/20 bg-white/[0.03]'
          : status === 'error'
            ? 'border-red-500/30 bg-red-500/[0.03]'
            : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      {/* Command header */}
      <div className="flex items-center gap-3 mb-3">
        <span className={`font-mono text-[10px] tracking-widest px-2 py-0.5 rounded border ${
          solved ? 'border-green-400/30 text-green-400/80 bg-green-400/5'
                 : 'border-white/15 text-white/40'
        }`}>
          {cmd.label}
        </span>
        <span className="text-white/70 text-xs">{cmd.description}</span>
        {solved && <span className="ml-auto text-green-400/80 text-xs font-mono">FIXED ✓</span>}
      </div>

      {/* Corrupted command display */}
      <div className="font-mono text-[11px] md:text-xs text-white/50 bg-black/40 rounded-lg px-3 py-2 mb-3 border border-white/[0.06] tracking-wide">
        <span className="text-white/25 mr-2">$</span>{cmd.prompt}
      </div>

      {/* Output lines */}
      <AnimatePresence>
        {output.length > 0 && (
          <div className="mb-3 space-y-1">
            {output.slice(0, outputVisible).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className={`font-mono text-[11px] tracking-wide ${
                  status === 'error' || (!solved && output.length === 1)
                    ? 'text-red-400/70'
                    : 'text-white/50'
                }`}
              >
                {line}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Input */}
      {!solved && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-white/60 font-mono text-xs shrink-0">{cmd.inputLabel}:</span>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={cmd.placeholder.match(/\[([^\]]+)\]/)?.[1] ?? '...'}
            className="flex-1 bg-transparent border-b border-white/30 focus:border-white/70 outline-none text-white font-mono text-xs py-1 placeholder-white/40 transition-colors duration-200 min-w-0"
          />
          <button
            type="submit"
            className="text-white/50 hover:text-white font-mono text-xs transition-colors shrink-0"
          >
            [RUN]
          </button>
        </form>
      )}
    </div>
  )
}

export default function Puzzle2() {
  const navigate = useNavigate()
  const { solvePuzzle } = useGame()
  const [solved,    setSolved]    = useState(new Set())
  const [showHint,  setShowHint]  = useState(false)
  const [unlocked,  setUnlocked]  = useState(false)
  const [showFrag,  setShowFrag]  = useState(false)
  const bottomRef = useRef(null)

  const allSolved = solved.size === COMMANDS.length

  function handleSolve(id) {
    setSolved(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  useEffect(() => {
    if (allSolved && !unlocked) {
      setTimeout(() => setUnlocked(true), 400)
      setTimeout(() => setShowFrag(true), 900)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 1000)
    }
  }, [allSolved, unlocked])

  function handleAdvance() {
    solvePuzzle(2, FRAGMENT)
    navigate('/puzzle/3')
  }

  return (
    <PuzzleLayout puzzleNumber={2}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6 text-center"
      >
        {/* Title */}
        <div>
          <p className="text-white/50 text-[10px] font-medium tracking-[0.2em] uppercase mb-2">
            Challenge 02 · System Recovery
          </p>
          <h2
            style={{ fontFamily: "'Instrument Serif', serif" }}
            className="text-3xl md:text-5xl font-medium bg-gradient-to-b from-white via-white/95 to-white/60 bg-clip-text text-transparent"
          >
            Repair the terminal
          </h2>
        </div>

        {/* Terminal panel */}
        <div className="liquid-glass rounded-2xl p-4 md:p-6 w-full max-w-2xl text-left">

          {/* Terminal top bar */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.08]">
            <Terminal size={14} className="text-white/40" />
            <span className="text-white/40 text-[10px] font-mono tracking-widest uppercase">
              CIPHER-7 Recovery Shell v2.1
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className={`text-[10px] font-mono tracking-widest ${allSolved ? 'text-green-400/70' : 'text-red-400/60'}`}>
                {solved.size}/{COMMANDS.length} FIXED
              </span>
            </div>
          </div>

          {/* Intro line */}
          <div className="font-mono text-xs text-white/30 mb-5 leading-relaxed">
            <span className="text-white/50">ARES-9</span> has corrupted 4 system commands.
            Repair each one to restore facility control.
          </div>

          {/* Commands */}
          <div className="space-y-3">
            {COMMANDS.map(cmd => (
              <TerminalCommand
                key={cmd.id}
                cmd={cmd}
                solved={solved.has(cmd.id)}
                onSolve={handleSolve}
              />
            ))}
          </div>

          {/* Unlock reveal */}
          <AnimatePresence>
            {unlocked && (
              <motion.div
                ref={bottomRef}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 pt-5 border-t border-white/10"
              >
                <div className="font-mono text-xs text-white/40 space-y-1 mb-5">
                  <div className="text-green-400/70">&gt; All systems nominal.</div>
                  <div className="text-green-400/70">&gt; Access tier unlocked.</div>
                  <div className="text-white/50">&gt; Fragment code extracted from ARES-9 memory:</div>
                </div>

                <AnimatePresence>
                  {showFrag && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/[0.04] border border-white/20 rounded-xl p-5 text-center mb-5"
                    >
                      <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase font-medium mb-2">
                        Fragment Code
                      </p>
                      <p className="font-mono text-4xl font-medium text-white tracking-[0.4em]">
                        {FRAGMENT}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleAdvance}
                  className="w-full px-6 py-3 text-[13px] font-medium border border-white/15 rounded-full hover:border-white/35 hover:bg-white/[0.03] transition-all duration-300 text-white/80 cursor-pointer"
                >
                  Proceed to Challenge 03 →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
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
