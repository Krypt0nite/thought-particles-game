import { useRef, useEffect } from 'react'
import { startEngine } from '../engine/Engine'
import { ZONES } from '../config/zones'
import { createZone } from '../models/Zone'

export function useThoughtEngine(canvasRef, params, running) {
  const state = useRef({
    thoughts: [],
    particles: [],
    mouse: { x: 0, y: 0 },
    zones: [],
    draggedThought: null,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    state.current.zones = ZONES.map((z) => createZone(z, canvas))
    startEngine({ canvas, state, params, running })
  }, [])

  return state
}
