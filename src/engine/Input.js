// src/engine/Input.js - FIXED CURSOR DETECTION
import { Vector } from '../models/Vector'
import { createParticle } from '../models/Particle'

export function setupInput(canvas, state, callbacks) {
  let lastMousePos = { x: 0, y: 0 }
  // let dragStartPos = { x: 0, y: 0 }

  const getMousePos = (e) => {
    const rect = canvas.getBoundingClientRect()
    // More accurate position calculation
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handleMouseMove = (e) => {
    const pos = getMousePos(e)
    // const prevMouse = state.mouse
    state.mouse = pos

    // Check if hovering over any thought - MORE ACCURATE
    let hovering = false
    state.thoughts.forEach((t) => {
      const d = Vector.dist(pos, t)
      // Check if mouse is INSIDE the thought bubble (not just near it)
      if (d <= t.size) {
        hovering = true
        t.glow = 0.5
        canvas.style.cursor = 'grab' // Show grab cursor
      }
    })

    if (!hovering && !state.draggedThought) {
      canvas.style.cursor = 'default'
    }

    if (state.draggedThought) {
      // Calculate drag velocity
      const dragVelocity = {
        x: pos.x - lastMousePos.x,
        y: pos.y - lastMousePos.y,
      }
      const dragSpeed = Math.sqrt(
        dragVelocity.x * dragVelocity.x + dragVelocity.y * dragVelocity.y,
      )

      // Update position directly to cursor
      state.draggedThought.x = pos.x
      state.draggedThought.y = pos.y

      // Store drag velocity
      state.draggedThought.vx = dragVelocity.x
      state.draggedThought.vy = dragVelocity.y

      canvas.style.cursor = 'grabbing'

      // Break attraction with speed
      if (dragSpeed > 5) {
        state.draggedThought.breakBond = 10
      }

      // Trail particles
      if (Math.random() < 0.3) {
        state.particles.push(
          createParticle(pos.x, pos.y, state.draggedThought.color),
        )
      }
    }

    lastMousePos = { ...pos }
  }

  const handleMouseDown = (e) => {
    const pos = getMousePos(e)
    // dragStartPos = { ...pos }

    // Find clicked thought - check if click is INSIDE bubble
    const clicked = state.thoughts.find((t) => {
      const distance = Vector.dist(pos, t)
      return distance <= t.size
    })

    if (clicked) {
      state.draggedThought = clicked
      clicked.glow = 1
      clicked.returning = false // Stop returning to zone
      clicked.returnDelay = 0 // Reset return delay
      canvas.style.cursor = 'grabbing'

      // Grab particles
      for (let i = 0; i < 8; i++) {
        state.particles.push(
          createParticle(clicked.x, clicked.y, clicked.color),
        )
      }
    }
  }

  const handleMouseUp = () => {
    if (state.draggedThought) {
      const thought = state.draggedThought
      thought.glow = 0.3

      // Calculate release velocity for momentum
      const releaseVelocity = {
        x: state.mouse.x - lastMousePos.x,
        y: state.mouse.y - lastMousePos.y,
      }

      // Apply momentum
      thought.vx = releaseVelocity.x * 2
      thought.vy = releaseVelocity.y * 2

      // If thought has a zone, calculate return delay based on distance
      if (thought.zone) {
        const homeZone = state.zones.find((z) => z.id === thought.zone)
        if (homeZone) {
          const distanceFromZone = Vector.dist(thought, homeZone)
          // Return delay: 5-10 seconds based on distance
          // Closer = shorter delay, farther = longer delay
          const maxDistance = Math.max(window.innerWidth, window.innerHeight)
          const normalizedDistance = Math.min(distanceFromZone / maxDistance, 1)
          thought.returnDelay = 5 + normalizedDistance * 5 // 5 to 10 seconds
          thought.returnStartTime = Date.now()
          thought.returning = false // Will start returning after delay
        }
      }
    }
    state.draggedThought = null
    canvas.style.cursor = 'default'
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    state.camera.zoom = Math.max(0.5, Math.min(1.3, state.camera.zoom * delta))

    if (callbacks.onZoomChange) {
      callbacks.onZoomChange(state.camera.zoom)
    }
  }

  const handleDoubleClick = (e) => {
    const pos = getMousePos(e)
    const clicked = state.thoughts.find((t) => Vector.dist(pos, t) <= t.size)

    if (clicked && callbacks.onThoughtDoubleClick) {
      callbacks.onThoughtDoubleClick(clicked)
    }
  }

  const handleKeyDown = (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault()
      if (callbacks.onTogglePause) callbacks.onTogglePause()
    }

    if (e.code === 'Delete' || e.code === 'Backspace') {
      if (state.selectedThought && e.target.tagName !== 'INPUT') {
        e.preventDefault()
        if (callbacks.onDeleteThought)
          callbacks.onDeleteThought(state.selectedThought)
      }
    }

    if (e.ctrlKey && e.code === 'KeyS') {
      e.preventDefault()
      if (callbacks.onSave) callbacks.onSave()
    }
  }

  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('mousedown', handleMouseDown)
  canvas.addEventListener('mouseup', handleMouseUp)
  canvas.addEventListener('wheel', handleWheel, { passive: false })
  canvas.addEventListener('dblclick', handleDoubleClick)
  window.addEventListener('keydown', handleKeyDown)

  return () => {
    canvas.removeEventListener('mousemove', handleMouseMove)
    canvas.removeEventListener('mousedown', handleMouseDown)
    canvas.removeEventListener('mouseup', handleMouseUp)
    canvas.removeEventListener('wheel', handleWheel)
    canvas.removeEventListener('dblclick', handleDoubleClick)
    window.removeEventListener('keydown', handleKeyDown)
  }
}
