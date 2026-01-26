// src/utils/TouchHandlers.js - IMPROVED MOBILE TOUCH SUPPORT
export function setupTouchHandlers(canvas, state, callbacks) {
  let touchStartDistance = 0
  let initialZoom = 1
  let touches = []
  let lastTouchPos = { x: 0, y: 0 }
  let touchStartTime = 0

  const getTouchPos = (touch) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    }
  }

  const getTouchDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // const getTouchCenter = (touch1, touch2) => {
  //   return {
  //     x: (touch1.clientX + touch2.clientX) / 2,
  //     y: (touch1.clientY + touch2.clientY) / 2,
  //   }
  // }

  // Find thought at position
  const findThoughtAtPos = (pos) => {
    for (let i = state.thoughts.length - 1; i >= 0; i--) {
      const t = state.thoughts[i]
      const dx = pos.x - t.x
      const dy = pos.y - t.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      // Larger touch target for mobile
      if (distance <= t.size * 1.2) {
        return { thought: t, index: i }
      }
    }
    return null
  }

  const handleTouchStart = (e) => {
    e.preventDefault()
    touches = Array.from(e.touches)
    touchStartTime = Date.now()

    // Initialize audio on first touch (Chrome policy)
    if (callbacks.onFirstTouch) {
      callbacks.onFirstTouch()
    }

    if (touches.length === 1) {
      // Single touch - check for thought drag
      const pos = getTouchPos(touches[0])
      lastTouchPos = pos
      state.mouse = pos

      const found = findThoughtAtPos(pos)

      if (found) {
        state.draggedThought = found.thought
        found.thought.glow = 1
        found.thought.returning = false
        found.thought.returnDelay = 0

        if (callbacks.onThoughtGrabbed) {
          callbacks.onThoughtGrabbed()
        }

        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(10)
        }
      }
    } else if (touches.length === 2) {
      // Two fingers - prepare for pinch zoom
      touchStartDistance = getTouchDistance(touches[0], touches[1])
      initialZoom = state.camera.zoom

      // Release any dragged thought
      if (state.draggedThought) {
        state.draggedThought.glow = 0.3
        state.draggedThought = null
      }
    }
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    touches = Array.from(e.touches)

    if (touches.length === 1) {
      const pos = getTouchPos(touches[0])
      state.mouse = pos

      if (state.draggedThought) {
        // Calculate velocity for momentum
        const vx = pos.x - lastTouchPos.x
        const vy = pos.y - lastTouchPos.y

        // Update thought position
        state.draggedThought.x = pos.x
        state.draggedThought.y = pos.y
        state.draggedThought.vx = vx * 0.5
        state.draggedThought.vy = vy * 0.5

        // Break bond if dragging fast
        const speed = Math.sqrt(vx * vx + vy * vy)
        if (speed > 10) {
          state.draggedThought.breakBond = 10
        }
      }

      lastTouchPos = pos
    } else if (touches.length === 2) {
      // Pinch zoom
      const currentDistance = getTouchDistance(touches[0], touches[1])
      const scale = currentDistance / touchStartDistance
      const newZoom = Math.max(0.5, Math.min(1.5, initialZoom * scale))

      state.camera.zoom = newZoom
      if (callbacks.onZoomChange) {
        callbacks.onZoomChange(newZoom)
      }

      // Pan with two fingers
      // const center = getTouchCenter(touches[0], touches[1])
      // Could implement panning here if needed
    }
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    const remainingTouches = Array.from(e.touches)
    const touchDuration = Date.now() - touchStartTime

    if (remainingTouches.length === 0) {
      // All touches ended
      if (state.draggedThought) {
        const thought = state.draggedThought
        thought.glow = 0.3

        // Apply momentum from last movement
        // (velocity already set in touchMove)

        // Calculate return delay
        if (thought.zone) {
          const homeZone = state.zones.find((z) => z.id === thought.zone)
          if (homeZone) {
            const dx = thought.x - homeZone.x
            const dy = thought.y - homeZone.y
            const distanceFromZone = Math.sqrt(dx * dx + dy * dy)
            const maxDistance = Math.max(window.innerWidth, window.innerHeight)
            const normalizedDistance = Math.min(
              distanceFromZone / maxDistance,
              1,
            )
            thought.returnDelay = 5 + normalizedDistance * 5
            thought.returnStartTime = Date.now()
            thought.returning = false
          }
        }

        if (callbacks.onThoughtReleased) {
          callbacks.onThoughtReleased()
        }

        // Check for tap (quick touch without much movement)
        if (touchDuration < 200) {
          // This was a tap - could trigger thought selection
          if (callbacks.onThoughtTap) {
            callbacks.onThoughtTap(thought)
          }
        }
      }

      state.draggedThought = null
    } else if (remainingTouches.length === 1) {
      // Went from 2 fingers to 1 - could start dragging
      const pos = getTouchPos(remainingTouches[0])
      lastTouchPos = pos
      state.mouse = pos
    }

    touches = remainingTouches
  }

  // Prevent default touch behaviors (scrolling, zooming page)
  const preventDefaultTouch = (e) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }

  // Add listeners
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
  canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false })

  // Prevent page zoom on double-tap
  document.addEventListener('touchstart', preventDefaultTouch, {
    passive: false,
  })

  // Cleanup function
  return () => {
    canvas.removeEventListener('touchstart', handleTouchStart)
    canvas.removeEventListener('touchmove', handleTouchMove)
    canvas.removeEventListener('touchend', handleTouchEnd)
    canvas.removeEventListener('touchcancel', handleTouchEnd)
    document.removeEventListener('touchstart', preventDefaultTouch)
  }
}
