// src/engine/Input.js - WITH CONNECTION MODE SUPPORT
import { Vector } from '../models/Vector'
import { createParticle } from '../models/Particle'

export function setupInput(canvas, state, callbacks) {
  let lastMousePos = { x: 0, y: 0 }

  const getMousePos = (e) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  // Find thought at position
  const findThoughtAtPos = (pos) => {
    for (let i = state.thoughts.length - 1; i >= 0; i--) {
      const t = state.thoughts[i]
      const d = Vector.dist(pos, t)
      if (d <= t.size) {
        return { thought: t, index: i }
      }
    }
    return null
  }

  const handleMouseMove = (e) => {
    const pos = getMousePos(e)
    state.mouse = pos

    // Check if hovering over any thought
    let hovering = false
    state.thoughts.forEach((t) => {
      const d = Vector.dist(pos, t)
      if (d <= t.size) {
        hovering = true
        t.glow = 0.5
        canvas.style.cursor = callbacks.connectionMode?.isActive
          ? 'pointer'
          : 'grab'
      }
    })

    if (!hovering && !state.draggedThought) {
      canvas.style.cursor = callbacks.connectionMode?.isActive
        ? 'crosshair'
        : 'default'
    }

    if (state.draggedThought) {
      const dragVelocity = {
        x: pos.x - lastMousePos.x,
        y: pos.y - lastMousePos.y,
      }
      const dragSpeed = Math.sqrt(
        dragVelocity.x * dragVelocity.x + dragVelocity.y * dragVelocity.y,
      )

      state.draggedThought.x = pos.x
      state.draggedThought.y = pos.y
      state.draggedThought.vx = dragVelocity.x
      state.draggedThought.vy = dragVelocity.y

      canvas.style.cursor = 'grabbing'

      if (dragSpeed > 5) {
        state.draggedThought.breakBond = 10
      }

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
    const found = findThoughtAtPos(pos)

    // If in connection mode, handle connection
    if (callbacks.connectionMode?.isActive && found) {
      const handled = callbacks.connectionMode.handleThoughtClick(
        found.thought,
        found.index,
      )
      if (handled) return // Don't process normal drag
    }

    // Normal drag behavior
    if (found && !callbacks.connectionMode?.isActive) {
      state.draggedThought = found.thought
      found.thought.glow = 1
      found.thought.returning = false
      found.thought.returnDelay = 0
      canvas.style.cursor = 'grabbing'

      if (callbacks.onThoughtGrabbed) callbacks.onThoughtGrabbed()

      for (let i = 0; i < 8; i++) {
        state.particles.push(
          createParticle(found.thought.x, found.thought.y, found.thought.color),
        )
      }
    }
  }

  const handleMouseUp = () => {
    if (state.draggedThought) {
      const thought = state.draggedThought
      thought.glow = 0.3

      const releaseVelocity = {
        x: state.mouse.x - lastMousePos.x,
        y: state.mouse.y - lastMousePos.y,
      }

      thought.vx = releaseVelocity.x * 2
      thought.vy = releaseVelocity.y * 2

      if (thought.zone) {
        const homeZone = state.zones.find((z) => z.id === thought.zone)
        if (homeZone) {
          const distanceFromZone = Vector.dist(thought, homeZone)
          const maxDistance = Math.max(window.innerWidth, window.innerHeight)
          const normalizedDistance = Math.min(distanceFromZone / maxDistance, 1)
          thought.returnDelay = 5 + normalizedDistance * 5
          thought.returnStartTime = Date.now()
          thought.returning = false
        }
      }

      if (callbacks.onThoughtReleased) callbacks.onThoughtReleased()
    }
    state.draggedThought = null
    canvas.style.cursor = callbacks.connectionMode?.isActive
      ? 'crosshair'
      : 'default'
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
    const found = findThoughtAtPos(pos)

    if (found && callbacks.onThoughtDoubleClick) {
      callbacks.onThoughtDoubleClick(found.thought)
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

    // Escape to cancel connection mode
    if (e.code === 'Escape' && callbacks.connectionMode?.isActive) {
      callbacks.connectionMode.toggleConnectionMode()
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
