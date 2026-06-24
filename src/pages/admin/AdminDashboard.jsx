import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { subscribeToAllTeams } from '../../services/teamService'
import { Activity, Clock, HelpCircle, CheckCircle, XCircle, Loader } from 'lucide-react'

const PUZZLE_LABELS = ['NET', 'CRYPT', 'LOGIC', 'LEX', 'CORE']
const TOTAL = 45 * 60

function fmt(secs) {
  if (!secs && secs !== 0) return '—'
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function StatusBadge({ status }) {
  const cfg = {
    active:    { label: 'ACTIVE',    color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.25)' },
    completed: { label: 'COMPLETED', color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.25)' },
    failed:    { label: 'FAILED',    color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' },
  }[status] ?? { label: status.toUpperCase(), color: '#9ca3af', bg: 'transparent', border: 'rgba(156,163,175,0.2)' }

  return (
    <span
      className="font-mono text-[9px] tracking-widest px-2 py-0.5 rounded-full border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  )
}

function PuzzleNodes({ currentPuzzle, completedPuzzles = [] }) {
  return (
    <div className="flex items-center gap-1">
      {PUZZLE_LABELS.map((label, i) => {
        const num  = i + 1
        const done = completedPuzzles.includes(num)
        const active = num === currentPuzzle
        return (
          <div
            key={num}
            title={label}
            className="w-5 h-5 rounded-sm flex items-center justify-center text-[8px] font-mono"
            style={{
              background: done   ? 'rgba(74,222,128,0.15)'  :
                          active ? 'rgba(96,165,250,0.1)'   : 'rgba(255,255,255,0.03)',
              border: `1px solid ${
                done   ? 'rgba(74,222,128,0.4)'  :
                active ? 'rgba(96,165,250,0.35)' : 'rgba(255,255,255,0.08)'
              }`,
              color: done   ? '#4ade80' :
                     active ? '#60a5fa' : 'rgba(255,255,255,0.2)',
            }}
          >
            {done ? '✓' : num}
          </div>
        )
      })}
    </div>
  )
}

function TeamRow({ team, index }) {
  const pct = team.elapsedSeconds ? Math.min(1, team.elapsedSeconds / TOTAL) : 0

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors"
    >
      {/* Team name */}
      <td className="py-3 px-4 text-sm font-medium text-white/80 max-w-[140px] truncate">
        {team.teamName}
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <StatusBadge status={team.status} />
      </td>

      {/* Progress nodes */}
      <td className="py-3 px-4">
        <PuzzleNodes
          currentPuzzle={team.currentPuzzle}
          completedPuzzles={team.completedPuzzles}
        />
      </td>

      {/* Time elapsed */}
      <td className="py-3 px-4 font-mono text-xs text-white/60">
        {fmt(team.elapsedSeconds)}
      </td>

      {/* Time bar */}
      <td className="py-3 px-4 hidden md:table-cell">
        <div className="w-24 h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${pct * 100}%`,
              background: team.status === 'completed' ? '#4ade80' :
                          team.status === 'failed'    ? '#f87171' :
                          pct > 0.8 ? '#fb923c' : '#60a5fa',
            }}
          />
        </div>
      </td>

      {/* Hints */}
      <td className="py-3 px-4 font-mono text-xs text-white/50 text-center">
        {team.hintsUsed ?? 0}
      </td>

      {/* Current puzzle */}
      <td className="py-3 px-4 font-mono text-xs text-white/40 text-center">
        {team.status === 'completed' ? '✓ Done' :
         team.status === 'failed'    ? '✗ Failed' :
         `P${Math.min(team.currentPuzzle, 5)}`}
      </td>
    </motion.tr>
  )
}

export default function AdminDashboard() {
  const [teams,   setTeams]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [filter,  setFilter]  = useState('all') // all | active | completed | failed

  useEffect(() => {
    try {
      const unsub = subscribeToAllTeams(data => {
        setTeams(data)
        setLoading(false)
      })
      return () => unsub()
    } catch (err) {
      setError('Firebase not configured. Add your config to src/services/firebase.js')
      setLoading(false)
    }
  }, [])

  const filtered = filter === 'all' ? teams : teams.filter(t => t.status === filter)

  const stats = {
    total:     teams.length,
    active:    teams.filter(t => t.status === 'active').length,
    completed: teams.filter(t => t.status === 'completed').length,
    failed:    teams.filter(t => t.status === 'failed').length,
    avgTime:   (() => {
      const done = teams.filter(t => t.status === 'completed' && t.elapsedSeconds)
      if (!done.length) return null
      return Math.round(done.reduce((a, t) => a + t.elapsedSeconds, 0) / done.length)
    })(),
  }

  return (
    <div
      className="min-h-screen w-screen"
      style={{ background: '#000', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Header */}
      <div className="border-b border-white/[0.08] px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-medium text-white mb-0.5"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              CIPHER-7 Admin
            </h1>
            <p className="text-white/30 text-xs font-mono tracking-widest">
              LIVE TEAM MONITOR — FACILITY LOCKDOWN
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="text-green-400/70 text-xs font-mono">LIVE</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Teams',   value: stats.total,     icon: Activity },
            { label: 'Active',        value: stats.active,    icon: Loader,       color: '#60a5fa' },
            { label: 'Completed',     value: stats.completed, icon: CheckCircle,  color: '#4ade80' },
            { label: 'Failed',        value: stats.failed,    icon: XCircle,      color: '#f87171' },
            { label: 'Avg Time',      value: stats.avgTime ? fmt(stats.avgTime) : '—', icon: Clock },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={12} style={{ color: color ?? 'rgba(255,255,255,0.4)' }} />
                <span className="text-white/40 text-[10px] font-mono tracking-widest uppercase">
                  {label}
                </span>
              </div>
              <p className="text-white text-2xl font-medium font-mono">{value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {['all', 'active', 'completed', 'failed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase border transition-all duration-200 cursor-pointer"
              style={{
                borderColor: filter === f ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)',
                background:  filter === f ? 'rgba(255,255,255,0.06)' : 'transparent',
                color:       filter === f ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
              }}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-white/20 text-xs font-mono">
            {filtered.length} team{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-white/[0.08] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader size={16} className="text-white/30 animate-spin" />
              <span className="text-white/30 text-sm font-mono">Connecting to Firestore...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-6">
              <XCircle size={20} className="text-red-400/60" />
              <p className="text-red-400/60 text-sm font-mono">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-white/20 text-sm font-mono">No teams found.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  {['Team', 'Status', 'Progress', 'Elapsed', 'Time bar', 'Hints', 'On'].map(h => (
                    <th
                      key={h}
                      className="py-2.5 px-4 text-[9px] font-mono tracking-widest text-white/30 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((team, i) => (
                    <TeamRow key={team.id} team={team} index={i} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        <p className="text-white/15 text-[10px] font-mono text-center">
          Updates in real time via Firestore · CIPHER-7 SECURITY SYSTEMS
        </p>
      </div>
    </div>
  )
}
