import { Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'
import EditorPage from './pages/EditorPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/project/:id" element={<EditorPage />} />
    </Routes>
  )
}
