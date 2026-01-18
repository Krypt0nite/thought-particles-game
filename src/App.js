// src/App.js - SIMPLIFIED, NO SCROLLBARS, PERFECT DEFAULT VIEW
import { useRef, useState, useEffect } from 'react'
import ControlPanel from './ui/ControlPanel'
import Stats from './ui/Stats'
import { startEngine } from './engine/Engine'
import { setupInput } from './engine/Input'
import { ZONES } from './config/zones'
import { createZone } from './models/Zone'
import { createThought } from './models/Thought'
import {
  createAmbientParticle,
  updateParticles,
  createEnergyWave,
  updateEnergyWaves,
} from './models/Particle'

export default function App() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const stateRef = useRef({
    thoughts: [],
    particles: [],
    energyWaves: [],
    connections: [],
    mouse: { x: 0, y: 0 },
    zones: [],
    draggedThought: null,
    selectedThought: null,
    camera: { x: 0, y: 0, zoom: 1 },
    showConnections: false,
  })
  const paramsRef = useRef({
    gravity: 0.5,
    chaos: 0.1,
    friction: 0.98,
    timeScale: 1,
  })
  const runningRef = useRef(true)

  const [showControls, setShowControls] = useState(true)
  const [isRunning, setIsRunning] = useState(true)
  const [thoughtText, setThoughtText] = useState('')
  const [selectedZone, setSelectedZone] = useState(null)
  const [thoughtsCount, setThoughtsCount] = useState(0)
  const [particlesCount, setParticlesCount] = useState(0)
  const [zoom, setZoom] = useState(1)

  // Initialize canvas - EXACTLY viewport size, no scrollbars
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateSize = () => {
      // Canvas is EXACTLY the viewport size
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Control panel width
      const controlPanelWidth = 400

      // Available space for zones
      const availableWidth = canvas.width - controlPanelWidth
      const availableHeight = canvas.height

      // Zone grid - 2x2 layout
      const horizontalSpacing = availableWidth / 2
      const verticalSpacing = availableHeight / 2
      const startX = controlPanelWidth + 50
      const startY = 50

      stateRef.current.zones = [
        // Creative Zone - Top Left
        {
          ...ZONES[0],
          x: startX + horizontalSpacing * 0.5,
          y: startY + verticalSpacing * 0.5,
          radius: Math.min(120, verticalSpacing * 0.35),
        },
        // Focus Zone - Top Right
        {
          ...ZONES[1],
          x: startX + horizontalSpacing * 1.5,
          y: startY + verticalSpacing * 0.5,
          radius: Math.min(120, verticalSpacing * 0.35),
        },
        // Organize Zone - Bottom Left
        {
          ...ZONES[2],
          x: startX + horizontalSpacing * 0.5,
          y: startY + verticalSpacing * 1.5,
          radius: Math.min(120, verticalSpacing * 0.35),
        },
        // Relax Zone - Bottom Right
        {
          ...ZONES[3],
          x: startX + horizontalSpacing * 1.5,
          y: startY + verticalSpacing * 1.5,
          radius: Math.min(120, verticalSpacing * 0.35),
        },
      ]
    }

    updateSize()
    window.addEventListener('resize', updateSize)

    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Browser zoom handling - prevent white background
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Setup input handlers with dragging
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const cleanup = setupInput(canvas, stateRef.current, {
      onZoomChange: (newZoom) => {
        const limited = Math.min(1.3, newZoom)
        setZoom(limited)
      },
      onTogglePause: () => toggleRunning(),
      onSave: () => saveState(),
      onDeleteThought: (thought) => deleteThought(thought),
    })

    return cleanup
  }, [])

  // Start engine
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    startEngine({
      canvas,
      state: stateRef,
      params: paramsRef,
      running: runningRef,
    })
  }, [])

  // Update particles and energy waves
  useEffect(() => {
    const interval = setInterval(() => {
      if (runningRef.current) {
        stateRef.current.particles = updateParticles(stateRef.current.particles)
        stateRef.current.energyWaves = updateEnergyWaves(
          stateRef.current.energyWaves,
        )

        if (Math.random() < 0.5 && canvasRef.current) {
          stateRef.current.particles.push(
            createAmbientParticle(canvasRef.current),
          )
        }

        if (Math.random() < 0.1 && canvasRef.current) {
          stateRef.current.energyWaves.push(createEnergyWave(canvasRef.current))
        }

        setThoughtsCount(stateRef.current.thoughts.length)
        setParticlesCount(stateRef.current.particles.length)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [])

  const addThought = () => {
    if (!thoughtText.trim()) return

    const canvas = canvasRef.current
    let targetX, targetY

    if (selectedZone) {
      const zone = stateRef.current.zones.find((z) => z.id === selectedZone)
      if (zone) {
        // Place thought INSIDE the zone (random position within zone)
        const angle = Math.random() * Math.PI * 2
        const distance = Math.random() * (zone.radius - 50)
        targetX = zone.x + Math.cos(angle) * distance
        targetY = zone.y + Math.sin(angle) * distance
      }
    } else {
      targetX = canvas.width * 0.65
      targetY = canvas.height * 0.5
    }

    const newThought = createThought({
      x: targetX,
      y: targetY,
      text: thoughtText,
      zone: selectedZone ? ZONES.find((z) => z.id === selectedZone) : null,
    })

    stateRef.current.thoughts.push(newThought)
    setThoughtText('')

    // Celebration particles
    for (let i = 0; i < 40; i++) {
      stateRef.current.particles.push({
        x: newThought.x,
        y: newThought.y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        size: Math.random() * 8 + 4,
        color: newThought.color,
        glow: 1,
      })
    }

    // Energy wave
    stateRef.current.energyWaves.push({
      x: newThought.x,
      y: newThought.y,
      radius: 20,
      maxRadius: 400,
      speed: 4,
      alpha: 1,
      color: newThought.color,
    })
  }

  const toggleRunning = () => {
    runningRef.current = !runningRef.current
    setIsRunning(runningRef.current)
  }

  const clearAll = () => {
    stateRef.current.thoughts = []
    stateRef.current.particles = []
    stateRef.current.connections = []
    stateRef.current.energyWaves = []
  }

  const saveState = () => {
    const data = JSON.stringify({
      thoughts: stateRef.current.thoughts,
      connections: stateRef.current.connections,
    })
    localStorage.setItem('mindPalaceState', data)
    alert('💾 State saved!')
  }

  const loadState = () => {
    const data = localStorage.getItem('mindPalaceState')
    if (data) {
      const parsed = JSON.parse(data)
      stateRef.current.thoughts = parsed.thoughts || []
      stateRef.current.connections = parsed.connections || []
      alert('✨ State loaded!')
    } else {
      alert('No saved state found')
    }
  }

  const exportImage = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `mind-palace-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const toggleConnections = () => {
    stateRef.current.showConnections = !stateRef.current.showConnections
  }

  const deleteThought = (thought) => {
    const index = stateRef.current.thoughts.indexOf(thought)
    if (index > -1) {
      stateRef.current.thoughts.splice(index, 1)
    }
  }

  return (
    <div className="w-screen h-screen bg-[#0a0e1a] relative overflow-hidden">
      {/* Canvas - NO scrollbars */}
      <div className="w-full h-full overflow-hidden">
        <canvas ref={canvasRef} className="block" />
      </div>

      {/* UI Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <ControlPanel
            show={showControls}
            onToggle={() => setShowControls((s) => !s)}
            isRunning={isRunning}
            onToggleRunning={toggleRunning}
            onClear={clearAll}
            thoughtText={thoughtText}
            setThoughtText={setThoughtText}
            onAddThought={addThought}
            zones={ZONES}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            onSave={saveState}
            onLoad={loadState}
            onExport={exportImage}
            onToggleConnections={toggleConnections}
            zoom={zoom}
            onZoomIn={() => {
              const newZoom = Math.min(1.3, zoom + 0.1)
              setZoom(newZoom)
              stateRef.current.camera.zoom = newZoom
            }}
            onZoomOut={() => {
              const newZoom = Math.max(0.5, zoom - 0.1)
              setZoom(newZoom)
              stateRef.current.camera.zoom = newZoom
            }}
          />
        </div>

        <div className="pointer-events-auto">
          <Stats
            thoughtsCount={thoughtsCount}
            particlesCount={particlesCount}
            zoom={zoom}
          />
        </div>
      </div>
    </div>
  )
}
