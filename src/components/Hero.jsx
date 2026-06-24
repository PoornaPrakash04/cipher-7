import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'

const PLACEHOLDER_INITIAL  = 'Enter Your Email Here For Early Access'
const PLACEHOLDER_SUBMITTED = 'You Will Receive Notifications By Email'

function useTypewriter(text, active) {
  const [displayed, setDisplayed] = useState('')
  const rafRef = useRef(null)

  useEffect(() => {
    if (!active) { setDisplayed(''); return }
    setDisplayed('')
    let i = 0
    function tick() {
      i++
      setDisplayed(text.slice(0, i))
      if (i < text.length) {
        rafRef.current = setTimeout(tick, 60)
      }
    }
    rafRef.current = setTimeout(tick, 60)
    return () => clearTimeout(rafRef.current)
  }, [text, active])

  return displayed
}

export default function Hero() {
  const [mode, setMode] = useState('button') // 'button' | 'form'
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  const placeholderText = submitted ? PLACEHOLDER_SUBMITTED : PLACEHOLDER_INITIAL
  const placeholder = useTypewriter(placeholderText, mode === 'form')

  function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    // Reset back to button after 4 seconds
    setTimeout(() => {
      setMode('button')
      setSubmitted(false)
      setEmail('')
    }, 4000)
  }

  return (
    <section className="relative flex-1 flex flex-col items-center justify-center px-6">
      <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center justify-center w-full gap-12">

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white/80 text-[10px] md:text-[11px] font-medium tracking-[0.2em] uppercase mb-4"
        >
          BUILD A NO-CODE AI APP IN MINUTES
        </motion.p>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: "'Instrument Serif', serif" }}
          className="text-4xl md:text-[64px] font-medium tracking-[-0.01em] leading-[1.1] mb-6 bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent max-w-4xl"
        >
          A new way to think and create
          <br className="hidden md:block" />
          with computers
        </motion.h1>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="min-h-[50px] mt-2"
        >
          <AnimatePresence mode="wait">
            {mode === 'button' ? (
              <motion.button
                key="cta-button"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMode('form')}
                className="px-10 py-3 text-[14px] font-medium border border-white/10 rounded-full hover:border-white/30 hover:bg-white/[0.02] transition-all duration-300 text-white/90 backdrop-blur-sm cursor-pointer"
              >
                Get early access
              </motion.button>
            ) : (
              <motion.form
                key="cta-form"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="flex items-center gap-2 pl-5 pr-1.5 py-1.5 text-[14px] font-medium border border-white/20 rounded-full bg-white/[0.02] backdrop-blur-sm w-full max-w-[320px] focus-within:border-white/40 transition-colors duration-300"
              >
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={placeholder}
                  autoFocus
                  className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder-white/45 min-w-0"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
                >
                  {submitted
                    ? <Check size={14} className="text-white" />
                    : <ArrowRight size={14} className="text-white" />
                  }
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Play Video Demo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <a
            href="#"
            className="text-white/80 hover:text-white/40 transition-colors duration-300 text-[13px] font-medium tracking-wide"
          >
            Play Video Demo
          </a>
        </motion.div>

      </div>
    </section>
  )
}
