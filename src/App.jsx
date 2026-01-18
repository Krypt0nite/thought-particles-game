// src/App.jsx
import { useRef, useState } from 'react'
import ControlPanel from './ui/ControlPanel'
import Stats from './ui/Stats'

export default function App() {
  const canvasRef = useRef(null)

  const [showControls, setShowControls] = useState(true)
  const [isRunning, setIsRunning] = useState(true)
  const [thoughtText, setThoughtText] = useState('')
  const [thoughts, setThoughts] = useState([])

  const addThought = () => {
    if (!thoughtText.trim()) return
    setThoughts((t) => [...t, { text: thoughtText }])
    setThoughtText('')
  }

  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />

      <ControlPanel
        show={showControls}
        onToggle={() => setShowControls((s) => !s)}
        isRunning={isRunning}
        onToggleRunning={() => setIsRunning((r) => !r)}
        onClear={() => setThoughts([])}
        thoughtText={thoughtText}
        setThoughtText={setThoughtText}
        onAddThought={addThought}
        zones={[]} // wired later
        selectedZone={null}
        setSelectedZone={() => {}}
      />

      <Stats thoughtsCount={thoughts.length} />
    </div>
  )
}
