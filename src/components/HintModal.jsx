import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Eye } from 'lucide-react'
import { useGame } from '../context/GameContext'

export default function HintModal({ hints = [], onClose }) {
  const { recordHint, hintsUsed } = useGame()
  const [revealed,   setRevealed]   = useState(false)
  const [hintIndex,  setHintIndex]  = useState(0)
  const [confirming, setConfirming] = useState(false)

  function handleReveal() {
    if (!confirming) { setConfirming(true); return }
    setConfirming(false); setRevealed(true); recordHint()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          className="liquid-glass rounded-2xl relative w-full max-w-md mx-4 p-6"
          initial={{ scale: 0.92, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 16, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase font-medium">
              Hint {hintIndex + 1} / {hints.length} · Used: {hintsUsed}
            </p>
            <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Hint box */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 min-h-[80px] flex items-center justify-center mb-5">
            {revealed ? (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-white/80 text-sm leading-relaxed font-light"
              >
                {hints[hintIndex]}
              </motion.p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Eye size={18} className="text-white/20" />
                <span className="text-white/30 text-xs text-center">
                  {confirming ? 'This uses a hint slot. Confirm?' : 'Hint is locked. Reveal?'}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!revealed && (
              <button
                onClick={handleReveal}
                className="flex-1 px-4 py-2.5 border border-white/20 rounded-full text-white/80 text-xs font-medium hover:bg-white/[0.04] hover:border-white/40 transition-all duration-200 cursor-pointer"
              >
                {confirming ? 'Confirm reveal' : 'Reveal hint'}
              </button>
            )}
            {revealed && hintIndex < hints.length - 1 && (
              <button
                onClick={() => { setHintIndex(i => i + 1); setRevealed(false); setConfirming(false) }}
                className="flex-1 px-4 py-2.5 border border-white/20 rounded-full text-white/80 text-xs font-medium hover:bg-white/[0.04] hover:border-white/40 transition-all duration-200 cursor-pointer"
              >
                Next hint
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-white/10 rounded-full text-white/40 text-xs font-medium hover:text-white/60 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
