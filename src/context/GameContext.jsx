import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react'
import { signInAnonymously } from 'firebase/auth'
import { auth } from '../services/firebase'
import {
  createTeam, advancePuzzle, recordHintUsed,
  completeGame, failGame,
} from '../services/teamService'

export const TOTAL_TIME_SECONDS = 45 * 60
export const TOTAL_PUZZLES      = 5

const GameContext = createContext(null)

// ── localStorage helpers ───────────────────────────────────────
const KEY = 'cipher7_game'
const save  = s  => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {} }
const load  = () => { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null } catch { return null } }
const clear = () => { try { localStorage.removeItem(KEY) } catch {} }

export function GameProvider({ children }) {
  const saved = load()

  const [uid,            setUid]            = useState(saved?.uid            ?? null)
  const [teamName,       setTeamName]       = useState(saved?.teamName       ?? '')
  const [currentPuzzle,  setCurrentPuzzle]  = useState(saved?.currentPuzzle  ?? 1)
  const [fragments,      setFragments]      = useState(saved?.fragments       ?? {})
  const [hintsUsed,      setHintsUsed]      = useState(saved?.hintsUsed      ?? 0)
  const [gameStatus,     setGameStatus]     = useState(saved?.gameStatus      ?? 'idle')
  const [timeLeft,       setTimeLeft]       = useState(saved?.timeLeft        ?? TOTAL_TIME_SECONDS)
  const [elapsedSeconds, setElapsedSeconds] = useState(saved?.elapsedSeconds  ?? 0)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState(null)

  const timerRef      = useRef(null)
  const elapsedRef    = useRef(saved?.elapsedSeconds ?? 0)  // always current value for callbacks

  // Keep ref in sync
  useEffect(() => { elapsedRef.current = elapsedSeconds }, [elapsedSeconds])

  // ── Persist key state ──────────────────────────────────────────
  useEffect(() => {
    if (gameStatus === 'idle') return
    save({ uid, teamName, currentPuzzle, fragments, hintsUsed, gameStatus, timeLeft, elapsedSeconds })
  }, [uid, teamName, currentPuzzle, fragments, hintsUsed, gameStatus, timeLeft, elapsedSeconds])

  // ── Timer ──────────────────────────────────────────────────────
  const startTimer = useCallback((fromElapsed = 0) => {
    const base = Date.now() - fromElapsed * 1000
    timerRef.current = setInterval(() => {
      const elapsed   = Math.floor((Date.now() - base) / 1000)
      const remaining = TOTAL_TIME_SECONDS - elapsed
      elapsedRef.current = elapsed
      setElapsedSeconds(elapsed)
      setTimeLeft(Math.max(0, remaining))
      if (remaining <= 0) {
        clearInterval(timerRef.current)
        setGameStatus('failed')
      }
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  // Resume timer on mount if game was mid-flight
  useEffect(() => {
    if (saved?.gameStatus === 'active') startTimer(saved.elapsedSeconds ?? 0)
    return () => stopTimer()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle time-up
  useEffect(() => {
    if (gameStatus === 'failed' && uid) {
      stopTimer()
      failGame({ uid, elapsedSeconds: elapsedRef.current }).catch(console.error)
    }
  }, [gameStatus, uid, stopTimer])

  // ── Start game ─────────────────────────────────────────────────
  async function startGame(name) {
    setLoading(true); setError(null)
    clear()
    try {
      const cred = await signInAnonymously(auth)
      const id   = cred.user.uid
      setUid(id); setTeamName(name)
      setCurrentPuzzle(1); setFragments({}); setHintsUsed(0)
      setElapsedSeconds(0); setTimeLeft(TOTAL_TIME_SECONDS)
      setGameStatus('active')
      await createTeam({ uid: id, teamName: name })
      startTimer(0)
    } catch (err) {
      console.error(err)
      setError('Failed to start. Check Firebase config.')
    } finally {
      setLoading(false)
    }
  }

  // ── Solve a puzzle ─────────────────────────────────────────────
  async function solvePuzzle(puzzleNumber, fragmentCode) {
    const newFragments = { ...fragments, [`puzzle${puzzleNumber}`]: fragmentCode }
    setFragments(newFragments)
    setCurrentPuzzle(puzzleNumber + 1)
    if (uid) {
      advancePuzzle({
        uid,
        puzzleNumber,
        fragmentCode,
        elapsedSeconds: elapsedRef.current,
      }).catch(console.error)
    }
  }

  // ── Use a hint ─────────────────────────────────────────────────
  function recordHint() {
    setHintsUsed(h => h + 1)
    if (uid) recordHintUsed(uid).catch(console.error)
  }

  // ── Finish game ────────────────────────────────────────────────
  function finishGame() {
    stopTimer()
    setGameStatus('completed')
    save({
      uid, teamName, currentPuzzle, fragments,
      hintsUsed, gameStatus: 'completed',
      timeLeft, elapsedSeconds: elapsedRef.current,
    })
    if (uid) {
      completeGame({
        uid,
        elapsedSeconds: elapsedRef.current,
        hintsUsed,
      }).catch(console.error)
    }
  }

  // ── Reset ──────────────────────────────────────────────────────
  function resetGame() {
    stopTimer(); clear()
    setUid(null); setTeamName(''); setCurrentPuzzle(1)
    setFragments({}); setHintsUsed(0)
    setTimeLeft(TOTAL_TIME_SECONDS); setElapsedSeconds(0)
    setGameStatus('idle')
  }

  function formatTime(seconds = timeLeft) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <GameContext.Provider value={{
      uid, teamName, currentPuzzle, fragments, hintsUsed,
      gameStatus, timeLeft, elapsedSeconds, loading, error,
      startGame, solvePuzzle, recordHint, finishGame, resetGame, formatTime,
      TOTAL_PUZZLES,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be inside GameProvider')
  return ctx
}
