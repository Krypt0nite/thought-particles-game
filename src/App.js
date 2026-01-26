// src/App.js - COMPLETE FIXED VERSION WITH CONNECTION MODE
import { useRef, useState, useEffect, useCallback } from 'react'
import ControlPanel from './ui/ControlPanel'
import Stats from './ui/Stats'
import AiSuggestionsPanel from './ui/AiSuggestionsPanel'
import AnalyticsPanel from './ui/AnalyticsPanel'
import MultiPlayerStatus from './ui/MultiPlayerStatus'
import ConnectionMode, { ConnectionLabelModal } from './ui/ConnectionMode'
import { startEngine } from './engine/Engine'
import { setupInput } from './engine/Input'
import { setupTouchHandlers } from './utils/TouchHandlers'
import { soundEffects } from './utils/SoundEffects'
import { ZONES } from './config/zones'
import { createThought } from './models/Thought'
import {
  createAmbientParticle,
  updateParticles,
  createEnergyWave,
  updateEnergyWaves,
} from './models/Particle'

// AI & Analytics
import { getAISuggestions, findThoughtConnections } from './utils/AiSuggestions'
import { analyzeThoughts } from './utils/AnalyticsEngine'

// Multiplayer & Connection Mode
import useMultiplayer from './hooks/UseMultiplayer'
import useConnectionMode from './hooks/useConnectionMode'

export default function App() {
  const canvasRef = useRef(null)
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
    showConnections: true,
  })
  const paramsRef = useRef({
    gravity: 0.5,
    chaos: 0.1,
    friction: 0.98,
    timeScale: 1,
  })
  const runningRef = useRef(true)

  // UI State
  const [showControls, setShowControls] = useState(true)
  const [isRunning, setIsRunning] = useState(true)
  const [thoughtText, setThoughtText] = useState('')
  const [selectedZone, setSelectedZone] = useState(null)
  const [thoughtsCount, setThoughtsCount] = useState(0)
  const [particlesCount, setParticlesCount] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // AI Suggestions State
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(true)

  // Analytics State
  const [analytics, setAnalytics] = useState(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [sessionCount, setSessionCount] = useState(1)

  // Multiplayer State
  const [multiplayerEnabled, setMultiplayerEnabled] = useState(false)

  // Connection Mode Hook
  const connectionMode = useConnectionMode(stateRef, {
    onConnectionCreated: (connection) => {
      console.log('Connection created:', connection)
      if (soundEnabled) {
        soundEffects.playTone(800, 0.1, 'sine', 0.2)
        setTimeout(() => soundEffects.playTone(1000, 0.1, 'sine', 0.15), 50)
      }
    },
    onSoundEffect: (type) => {
      if (!soundEnabled) return
      if (type === 'select') soundEffects.thoughtGrabbed()
      if (type === 'connect') soundEffects.thoughtReleased()
    },
  })

  // Multiplayer Hook
  const multiplayer = useMultiplayer(multiplayerEnabled, {
    roomId: 'mind-palace-room',
    userName: 'You',
    userColor: '#9b59b6',
    onUserJoined: (user) => {
      console.log(`${user.name} joined the room`)
      if (soundEnabled) soundEffects.zoneEntered('focus')
    },
    onUserLeft: (user) => {
      console.log(`${user.name} left the room`)
    },
    onThoughtReceived: (thought) => {
      const canvas = canvasRef.current
      if (canvas) {
        const newThought = createThought({
          x: canvas.width * 0.5 + (Math.random() - 0.5) * 200,
          y: canvas.height * 0.5 + (Math.random() - 0.5) * 200,
          text: thought.text,
          zone: null,
        })
        newThought.sharedBy = thought.sharedBy
        stateRef.current.thoughts.push(newThought)
      }
    },
  })

  // AI SUGGESTIONS - Update when thoughts change
  useEffect(() => {
    const thoughts = stateRef.current.thoughts
    const newSuggestions = getAISuggestions(thoughts, {
      maxSuggestions: 5,
      includeBalanceSuggestions: true,
    })
    setSuggestions(newSuggestions)
  }, [thoughtsCount])

  // ANALYTICS - Update when thoughts change
  useEffect(() => {
    const thoughts = stateRef.current.thoughts
    const newAnalytics = analyzeThoughts(thoughts, {
      sessions: sessionCount,
      includeTimeline: true,
      includeMoodAnalysis: true,
    })
    setAnalytics(newAnalytics)
  }, [thoughtsCount, sessionCount])

  // AUTO-CONNECTIONS - Find connections using AI
  useEffect(() => {
    const thoughts = stateRef.current.thoughts
    if (thoughts.length >= 2) {
      const aiConnections = findThoughtConnections(thoughts)
      const existingConnections = stateRef.current.connections || []
      const newConnections = aiConnections.filter(
        (conn) =>
          !existingConnections.some(
            (ec) =>
              (ec.from === conn.from && ec.to === conn.to) ||
              (ec.from === conn.to && ec.to === conn.from),
          ),
      )
      stateRef.current.connections = [...existingConnections, ...newConnections]
    }
  }, [thoughtsCount])

  // Initialize canvas and zones
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const controlPanelWidth = 400
      const availableWidth = canvas.width - controlPanelWidth
      const availableHeight = canvas.height

      const horizontalSpacing = availableWidth / 2
      const verticalSpacing = availableHeight / 2
      const startX = controlPanelWidth + 50
      const startY = 50

      stateRef.current.zones = [
        {
          ...ZONES[0],
          x: startX + horizontalSpacing * 0.5,
          y: startY + verticalSpacing * 0.5,
          radius: Math.min(120, verticalSpacing * 0.35),
        },
        {
          ...ZONES[1],
          x: startX + horizontalSpacing * 1.5,
          y: startY + verticalSpacing * 0.5,
          radius: Math.min(120, verticalSpacing * 0.35),
        },
        {
          ...ZONES[2],
          x: startX + horizontalSpacing * 0.5,
          y: startY + verticalSpacing * 1.5,
          radius: Math.min(120, verticalSpacing * 0.35),
        },
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
    setSessionCount((prev) => prev + 1)

    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Callbacks
  const saveState = useCallback(() => {
    const data = JSON.stringify({
      thoughts: stateRef.current.thoughts,
      connections: stateRef.current.connections,
      sessionCount,
    })
    localStorage.setItem('mindPalaceState', data)
    alert('💾 State saved!')
  }, [sessionCount])

  const toggleRunning = useCallback(() => {
    runningRef.current = !runningRef.current
    setIsRunning(runningRef.current)
  }, [])

  const deleteThought = useCallback((thought) => {
    const index = stateRef.current.thoughts.indexOf(thought)
    if (index > -1) {
      stateRef.current.thoughts.splice(index, 1)
      setThoughtsCount(stateRef.current.thoughts.length)
    }
  }, [])

  // Setup input handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const cleanup = setupInput(canvas, stateRef.current, {
      onZoomChange: (newZoom) => {
        const limited = Math.min(1.3, newZoom)
        setZoom(limited)
      },
      onTogglePause: toggleRunning,
      onSave: saveState,
      onDeleteThought: deleteThought,
      onThoughtGrabbed: () => soundEnabled && soundEffects.thoughtGrabbed(),
      onThoughtReleased: () => soundEnabled && soundEffects.thoughtReleased(),
      // Connection mode integration
      connectionMode: connectionMode,
    })

    return cleanup
  }, [soundEnabled, toggleRunning, saveState, deleteThought, connectionMode])

  // Setup touch handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const cleanup = setupTouchHandlers(canvas, stateRef.current, {
      onZoomChange: (newZoom) => setZoom(newZoom),
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

  // Update connection mode state for renderer
  useEffect(() => {
    stateRef.current.connectionModeActive = connectionMode.isActive
    stateRef.current.connectionModePendingThought =
      connectionMode.pendingThought
    stateRef.current.connectionModePendingIndex =
      connectionMode.pendingThoughtIndex
  }, [
    connectionMode.isActive,
    connectionMode.pendingThought,
    connectionMode.pendingThoughtIndex,
  ])

  // Multiplayer cursors update
  useEffect(() => {
    if (!multiplayerEnabled || !multiplayer.isConnected) return
    stateRef.current.multiplayerUsers = multiplayer.getUsersWithCursors()
  }, [multiplayerEnabled, multiplayer])

  // Add thought function
  const addThought = useCallback(
    (textOverride = null) => {
      const text = textOverride || thoughtText
      if (!text.trim()) return

      const canvas = canvasRef.current
      let targetX, targetY

      if (selectedZone) {
        const zone = stateRef.current.zones.find((z) => z.id === selectedZone)
        if (zone) {
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
        text: text.trim(),
        zone: selectedZone ? ZONES.find((z) => z.id === selectedZone) : null,
      })

      newThought.createdAt = Date.now()
      stateRef.current.thoughts.push(newThought)
      setThoughtText('')

      if (soundEnabled) soundEffects.thoughtAdded()

      if (multiplayerEnabled && multiplayer.isConnected) {
        multiplayer.broadcastThought(newThought)
      }

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

      setThoughtsCount(stateRef.current.thoughts.length)
    },
    [thoughtText, selectedZone, soundEnabled, multiplayerEnabled, multiplayer],
  )

  const addSuggestionAsThought = useCallback(
    (suggestionText) => {
      addThought(suggestionText)
    },
    [addThought],
  )

  const toggleSound = () => {
    const newState = !soundEnabled
    setSoundEnabled(newState)
    soundEffects.setEnabled(newState)
  }

  const toggleMultiplayer = () => {
    setMultiplayerEnabled(!multiplayerEnabled)
  }

  const clearAll = () => {
    stateRef.current.thoughts = []
    stateRef.current.particles = []
    stateRef.current.connections = []
    stateRef.current.energyWaves = []
    setThoughtsCount(0)
  }

  const loadState = () => {
    const data = localStorage.getItem('mindPalaceState')
    if (data) {
      const parsed = JSON.parse(data)
      stateRef.current.thoughts = parsed.thoughts || []
      stateRef.current.connections = parsed.connections || []
      if (parsed.sessionCount) setSessionCount(parsed.sessionCount)
      setThoughtsCount(stateRef.current.thoughts.length)
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

  return (
    <div className="w-screen h-screen bg-[#0a0e1a] relative overflow-hidden">
      <div className="w-full h-full overflow-hidden">
        <canvas ref={canvasRef} className="block" />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {/* Control Panel */}
        <div className="pointer-events-auto">
          <ControlPanel
            show={showControls}
            onToggle={() => setShowControls((s) => !s)}
            isRunning={isRunning}
            onToggleRunning={toggleRunning}
            onClear={clearAll}
            thoughtText={thoughtText}
            setThoughtText={setThoughtText}
            onAddThought={() => addThought()}
            zones={ZONES}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            onSave={saveState}
            onLoad={loadState}
            onExport={exportImage}
            onToggleConnections={toggleConnections}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
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
            multiplayerEnabled={multiplayerEnabled}
            onToggleMultiplayer={toggleMultiplayer}
            showSuggestions={showSuggestions}
            onToggleSuggestions={() => setShowSuggestions(!showSuggestions)}
            showAnalytics={showAnalytics}
            onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
          />
        </div>

        {/* Stats */}
        <div className="pointer-events-auto">
          <Stats
            thoughtsCount={thoughtsCount}
            particlesCount={particlesCount}
            zoom={zoom}
            multiplayerEnabled={multiplayerEnabled}
            userCount={multiplayer.userCount}
            connectionStatus={multiplayer.connectionStatus}
          />
        </div>

        {/* AI Suggestions Panel */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="pointer-events-auto">
            <AiSuggestionsPanel
              suggestions={suggestions}
              onAddSuggestion={addSuggestionAsThought}
              onClose={() => setShowSuggestions(false)}
            />
          </div>
        )}

        {/* Analytics Panel */}
        {showAnalytics && analytics && (
          <div className="pointer-events-auto">
            <AnalyticsPanel
              analytics={analytics}
              onClose={() => setShowAnalytics(false)}
            />
          </div>
        )}

        {/* Multiplayer Status */}
        {multiplayerEnabled && (
          <div className="pointer-events-auto">
            <MultiPlayerStatus
              isConnected={multiplayer.isConnected}
              connectionStatus={multiplayer.connectionStatus}
              users={multiplayer.users}
              userCount={multiplayer.userCount}
            />
          </div>
        )}

        {/* CONNECTION MODE UI - This is what was missing! */}
        <div className="pointer-events-auto">
          <ConnectionMode
            isActive={connectionMode.isActive}
            onToggle={connectionMode.toggleConnectionMode}
            selectedThought={connectionMode.pendingThought}
            connections={stateRef.current.connections || []}
            pendingConnection={connectionMode.pendingThought}
          />
        </div>

        {/* CONNECTION LABEL MODAL */}
        <ConnectionLabelModal
          isOpen={connectionMode.showLabelModal}
          onClose={connectionMode.cancelLabelModal}
          onSave={connectionMode.completeConnection}
          connection={connectionMode.tempConnection}
          thoughts={stateRef.current.thoughts}
        />
      </div>
    </div>
  )
}
