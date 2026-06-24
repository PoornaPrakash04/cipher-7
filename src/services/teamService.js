import {
  doc, setDoc, updateDoc, onSnapshot,
  collection, query, orderBy, serverTimestamp, arrayUnion,
} from 'firebase/firestore'
import { db } from './firebase'

// ── Create team doc on game start ─────────────────────────────
export async function createTeam({ uid, teamName }) {
  await setDoc(doc(db, 'teams', uid), {
    uid,
    teamName,
    startTime:        serverTimestamp(),
    currentPuzzle:    1,
    completedPuzzles: [],
    fragments:        {},
    hintsUsed:        0,
    elapsedSeconds:   0,
    status:           'active',   // active | completed | failed
    solvedAt:         null,
  })
}

// ── Advance puzzle + store fragment ───────────────────────────
export async function advancePuzzle({ uid, puzzleNumber, fragmentCode, elapsedSeconds }) {
  await updateDoc(doc(db, 'teams', uid), {
    currentPuzzle:                    puzzleNumber + 1,
    completedPuzzles:                 arrayUnion(puzzleNumber),
    [`fragments.puzzle${puzzleNumber}`]: fragmentCode,
    elapsedSeconds,
  })
}

// ── Increment hint counter ─────────────────────────────────────
export async function recordHintUsed(uid) {
  const ref  = doc(db, 'teams', uid)
  // Use a transaction-free increment via FieldValue would need import
  // Simple approach: read then write (fine for low-concurrency escape room)
  const { getDoc, increment } = await import('firebase/firestore')
  await updateDoc(ref, { hintsUsed: increment(1) })
}

// ── Mark completed ─────────────────────────────────────────────
export async function completeGame({ uid, elapsedSeconds, hintsUsed }) {
  await updateDoc(doc(db, 'teams', uid), {
    status:         'completed',
    solvedAt:       serverTimestamp(),
    elapsedSeconds,
    hintsUsed,
  })
}

// ── Mark failed (time up) ──────────────────────────────────────
export async function failGame({ uid, elapsedSeconds }) {
  await updateDoc(doc(db, 'teams', uid), {
    status:         'failed',
    solvedAt:       serverTimestamp(),
    elapsedSeconds,
  })
}

// ── Real-time listener for admin dashboard ─────────────────────
export function subscribeToAllTeams(callback) {
  const q = query(collection(db, 'teams'), orderBy('startTime', 'desc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}
