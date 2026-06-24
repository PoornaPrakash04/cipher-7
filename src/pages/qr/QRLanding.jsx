import { motion } from 'motion/react'
import { useParams, Link } from 'react-router-dom'
import { Wifi, AlertTriangle, ArrowLeft } from 'lucide-react'
import BackgroundVideo from '../../components/BackgroundVideo'

// Node 3 is the real one
const NODES = {
  '1': { real: false, message: 'SIGNAL CORRUPTED — No viable data found on this node. Keep searching.' },
  '2': { real: false, message: 'DECOY DETECTED — ARES-9 planted this node to waste your time.' },
  '3': {
    real: true,
    digit: '3',
    clue: 'Find the book with the red sticker.',
    fragment: '9X2K',
    message: 'AUTHENTIC SIGNAL ACQUIRED',
  },
  '4': { real: false, message: 'NULL NODE — This frequency carries no intelligence. Move on.' },
  '5': { real: false, message: 'INTERFERENCE — Electromagnetic noise only. This is a dead end.' },
}

export default function QRLanding() {
  const { id } = useParams()
  const node = NODES[id]

  if (!node) return (
    <div className="h-screen w-screen bg-black flex items-center justify-center text-white/40 font-mono text-sm">
      INVALID NODE
    </div>
  )

  return (
    <main className="relative bg-black h-screen w-screen flex flex-col items-center justify-center overflow-hidden selection:bg-white selection:text-black">
      <BackgroundVideo />
      <div className="absolute inset-0 bg-black/70 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="liquid-glass rounded-2xl p-7 text-center">

          {/* Node ID */}
          <p className="text-white/40 text-[10px] font-medium tracking-[0.2em] uppercase mb-5">
            CIPHER-7 · Signal Node {id} of 5
          </p>

          {/* Icon */}
          <div className="flex justify-center mb-5">
            {node.real
              ? <Wifi size={36} className="text-white/80" />
              : <AlertTriangle size={36} className="text-white/30" />
            }
          </div>

          {/* Status */}
          <h2
            style={{ fontFamily: "'Instrument Serif', serif" }}
            className={`text-2xl font-medium mb-4 ${node.real ? 'text-white' : 'text-white/40'}`}
          >
            {node.real ? 'Signal acquired' : 'Dead end'}
          </h2>

          {/* Message */}
          <div className={`rounded-xl p-4 mb-5 border text-sm leading-relaxed ${
            node.real
              ? 'bg-white/[0.05] border-white/20 text-white/80'
              : 'bg-white/[0.02] border-white/[0.08] text-white/35'
          }`}>
            {node.real ? (
              <div className="space-y-3 text-left">
                <p className="text-white/50 text-[10px] tracking-[0.15em] uppercase font-medium">
                  Intercepted directive
                </p>
                <p className="text-white/90">
                  Next clue: <span className="text-white font-medium">{node.clue}</span>
                </p>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-white/50 text-[10px] tracking-[0.15em] uppercase font-medium mb-1">
                    Fragment digit
                  </p>
                  <p className="font-mono text-3xl font-medium text-white tracking-widest">
                    {node.digit}
                  </p>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-white/50 text-[10px] tracking-[0.15em] uppercase font-medium mb-1">
                    Fragment code
                  </p>
                  <p className="font-mono text-xl font-medium text-white tracking-[0.3em]">
                    {node.fragment}
                  </p>
                </div>
              </div>
            ) : (
              <p>{node.message}</p>
            )}
          </div>

          {/* Back link */}
          <Link
            to="/puzzle/2"
            className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs font-medium tracking-wide"
          >
            <ArrowLeft size={12} />
            Back to terminal
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
