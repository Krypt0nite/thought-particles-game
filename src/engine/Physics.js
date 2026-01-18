// src/engine/Physics.js - DELAYED ZONE RETURN WITH INTERACTIONS
import { Vector } from '../models/Vector'
import { createParticle } from '../models/Particle'

const ANTONYM_PAIRS = [
  ['sad', 'happy'],
  ['chaos', 'calm'],
  ['chaos', 'peace'],
  ['angry', 'peaceful'],
  ['dark', 'light'],
  ['stress', 'relax'],
  ['fear', 'brave'],
  ['hate', 'love'],
]

function areAntonyms(word1, word2) {
  const w1 = word1.toLowerCase()
  const w2 = word2.toLowerCase()

  return ANTONYM_PAIRS.some(
    ([a, b]) =>
      (w1.includes(a) && w2.includes(b)) || (w1.includes(b) && w2.includes(a)),
  )
}

export function updatePhysics(state, params) {
  const currentTime = Date.now()

  state.thoughts.forEach((t) => {
    if (state.draggedThought === t) {
      if (t.breakBond > 0) t.breakBond--
      return
    }

    let gravity = params.gravity
    let chaos = params.chaos
    let target = state.mouse
    let homeZone = null

    // Check if thought should return to zone
    if (t.zone && t.returnDelay !== undefined) {
      homeZone = state.zones.find((zone) => zone.id === t.zone)

      if (homeZone && t.returnStartTime) {
        const elapsedSeconds = (currentTime - t.returnStartTime) / 1000

        // After delay, start slowly returning
        if (elapsedSeconds >= t.returnDelay && !t.returning) {
          t.returning = true
        }

        if (t.returning) {
          // Slow return to zone
          gravity = homeZone.gravity * 0.3 // Much slower return
          chaos = homeZone.chaos
          target = homeZone
        } else {
          // During delay, thought can interact freely
          gravity = 0.2 // Very weak gravity
          chaos = homeZone.chaos * 1.5 // More chaotic
          target = t // Stay roughly where it is
        }
      }
    } else if (t.zone) {
      // Normal zone behavior (for thoughts never dragged)
      homeZone = state.zones.find((zone) => zone.id === t.zone)
      if (homeZone) {
        gravity = homeZone.gravity
        chaos = homeZone.chaos
        target = homeZone
      }
    }

    // Attraction to target
    const force = Vector.sub(target, t)
    const dist = Vector.mag(force)

    if (dist > 10) {
      const dir = Vector.normalize(force)
      const strength = t.returning ? 0.05 : 0.1 // Slower when returning
      t.vx += dir.x * gravity * strength
      t.vy += dir.y * gravity * strength
    }

    // ANTONYM ATTRACTION - works during return journey too!
    if (!t.breakBond || t.breakBond <= 0) {
      state.thoughts.forEach((other) => {
        if (other === t) return
        if (other.breakBond > 0) return

        if (areAntonyms(t.text, other.text)) {
          const attractionForce = Vector.sub(other, t)
          const attractionDist = Vector.mag(attractionForce)

          // Attraction works even when returning to zone
          if (attractionDist < 300 && attractionDist > 60) {
            const attractionDir = Vector.normalize(attractionForce)
            const strength = 0.5 * (1 - attractionDist / 300)
            t.vx += attractionDir.x * strength
            t.vy += attractionDir.y * strength

            t.glow = 0.6
            other.glow = 0.6

            // Slow down return when attracted
            if (t.returning) {
              t.vx *= 0.95
              t.vy *= 0.95
            }
          }
        }
      })
    } else {
      t.breakBond--
    }

    // Random motion
    t.vx += (Math.random() - 0.5) * chaos
    t.vy += (Math.random() - 0.5) * chaos

    // Friction - less friction when returning
    const frictionAmount = t.returning ? 0.99 : params.friction
    t.vx *= frictionAmount
    t.vy *= frictionAmount

    // Update position
    t.x += t.vx
    t.y += t.vy

    // Check if reached zone during return
    if (homeZone && t.returning) {
      const distFromZone = Vector.dist(t, homeZone)

      // Reached zone - reset return state
      if (distFromZone < homeZone.radius * 0.5) {
        t.returning = false
        t.returnDelay = undefined
        t.returnStartTime = undefined
      }

      // Keep inside zone boundary
      if (distFromZone > homeZone.radius - t.size) {
        const dir = Vector.normalize(Vector.sub(homeZone, t))
        t.x = homeZone.x - dir.x * (homeZone.radius - t.size)
        t.y = homeZone.y - dir.y * (homeZone.radius - t.size)
        t.vx *= -0.5
        t.vy *= -0.5
      }
    }

    // Decay glow
    if (t.glow > 0) {
      t.glow = Math.max(0, t.glow - 0.02)
    }
  })

  // Collision detection - works during return journey
  for (let i = 0; i < state.thoughts.length; i++) {
    for (let j = i + 1; j < state.thoughts.length; j++) {
      const t1 = state.thoughts[i]
      const t2 = state.thoughts[j]

      const d = Vector.dist(t1, t2)
      const minDist = t1.size + t2.size

      if (d < minDist && d > 0) {
        const overlap = minDist - d
        const dir = Vector.normalize(Vector.sub(t1, t2))

        t1.x += dir.x * overlap * 0.5
        t1.y += dir.y * overlap * 0.5
        t2.x -= dir.x * overlap * 0.5
        t2.y -= dir.y * overlap * 0.5

        // Softer collision during return
        const bounceAmount = t1.returning || t2.returning ? 0.6 : 0.8
        const tempVx = t1.vx
        const tempVy = t1.vy
        t1.vx = t2.vx * bounceAmount
        t1.vy = t2.vy * bounceAmount
        t2.vx = tempVx * bounceAmount
        t2.vy = tempVy * bounceAmount

        t1.glow = 0.5
        t2.glow = 0.5

        // Collision particles
        const collisionX = (t1.x + t2.x) / 2
        const collisionY = (t1.y + t2.y) / 2
        for (let k = 0; k < 5; k++) {
          state.particles.push(createParticle(collisionX, collisionY, t1.color))
        }
      }
    }
  }

  // Boundary collision
  state.thoughts.forEach((t) => {
    const canvas = { width: window.innerWidth, height: window.innerHeight }

    if (t.x - t.size < 0) {
      t.x = t.size
      t.vx *= -0.7
      t.glow = 0.3
    }
    if (t.x + t.size > canvas.width) {
      t.x = canvas.width - t.size
      t.vx *= -0.7
      t.glow = 0.3
    }
    if (t.y - t.size < 0) {
      t.y = t.size
      t.vy *= -0.7
      t.glow = 0.3
    }
    if (t.y + t.size > canvas.height) {
      t.y = canvas.height - t.size
      t.vy *= -0.7
      t.glow = 0.3
    }
  })
}
