import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GameProvider } from './context/GameContext'
import Home            from './pages/Home'
import Puzzle1         from './pages/Puzzle1'
import Puzzle2         from './pages/Puzzle2'
import Puzzle3         from './pages/Puzzle3'
import Puzzle4         from './pages/Puzzle4'
import FinalPuzzle     from './pages/FinalPuzzle'
import Success         from './pages/Success'
import AdminDashboard  from './pages/admin/AdminDashboard'

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/"         element={<Home />}           />
          <Route path="/puzzle/1" element={<Puzzle1 />}        />
          <Route path="/puzzle/2" element={<Puzzle2 />}        />
          <Route path="/puzzle/3" element={<Puzzle3 />}        />
          <Route path="/puzzle/4" element={<Puzzle4 />}        />
          <Route path="/final"    element={<FinalPuzzle />}    />
          <Route path="/success"  element={<Success />}        />
          <Route path="/admin"    element={<AdminDashboard />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  )
}
