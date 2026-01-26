// src/engine/Physics.js - WITH COLLISION SOUNDS
import { Vector } from '../models/Vector'
import { createParticle } from '../models/Particle'
import { soundEffects } from '../utils/SoundEffects'

// EXPANDED ANTONYM PAIRS
const ANTONYM_PAIRS = [
  // Original pairs
  ['sad', 'happy'],
  ['chaos', 'calm'],
  ['chaos', 'peace'],
  ['angry', 'peaceful'],
  ['dark', 'light'],
  ['stress', 'relax'],
  ['fear', 'brave'],
  ['hate', 'love'],

  // Emotional spectrum
  ['anxious', 'serene'],
  ['lonely', 'connected'],
  ['empty', 'fulfilled'],
  ['confused', 'clear'],
  ['heavy', 'lighthearted'],
  ['numb', 'alive'],
  ['restless', 'content'],
  ['broken', 'whole'],
  ['tired', 'energized'],
  ['hopeless', 'hopeful'],

  // Mental states
  ['doubt', 'faith'],
  ['ignorance', 'wisdom'],
  ['noise', 'silence'],
  ['overthinking', 'clarity'],
  ['reactive', 'aware'],
  ['lost', 'found'],
  ['blurred', 'focused'],
  ['uncertain', 'decisive'],

  // Philosophical
  ['control', 'surrender'],
  ['attachment', 'freedom'],
  ['ego', 'humility'],
  ['escape', 'presence'],
  ['seeking', 'acceptance'],
  ['survival', 'living'],
  ['meaningless', 'purposeful'],
  ['routine', 'ritual'],

  // Flow states
  ['rush', 'flow'],
  ['pressure', 'ease'],
  ['tension', 'release'],

  // Elemental
  ['fire', 'water'],
  ['storm', 'stillness'],
  ['gravity', 'float'],
  ['weight', 'space'],
  ['shadow', 'glow'],
  ['void', 'fullness'],
  ['night', 'dawn'],
  ['ashes', 'flame'],
  ['end', 'beginning'],
  ['silence', 'music'],
]

// SYNONYM PAIRS (thoughts that repel each other)
const SYNONYM_PAIRS = [
  ['calm', 'serene'],
  ['peace', 'stillness'],
  ['joy', 'bliss'],
  ['sad', 'melancholy'],
  ['happy', 'content'],
  ['anger', 'rage'],
  ['love', 'devotion'],
  ['fear', 'dread'],
]

// Track collision sounds to prevent spam
let lastCollisionSoundTime = 0
const COLLISION_SOUND_COOLDOWN = 100 // ms between collision sounds

function areAntonyms(word1, word2) {
  const w1 = word1.toLowerCase()
  const w2 = word2.toLowerCase()

  return ANTONYM_PAIRS.some(
    ([a, b]) =>
      (w1.includes(a) && w2.includes(b)) || (w1.includes(b) && w2.includes(a)),
  )
}

// Check if words are synonyms (for repulsion)
function areSynonyms(word1, word2) {
  const w1 = word1.toLowerCase()
  const w2 = word2.toLowerCase()

  return SYNONYM_PAIRS.some(
    ([a, b]) =>
      (w1.includes(a) && w2.includes(b)) || (w1.includes(b) && w2.includes(a)),
  )
}

// Play collision sound with cooldown
function playCollisionSound(intensity) {
  const now = Date.now()
  if (now - lastCollisionSoundTime > COLLISION_SOUND_COOLDOWN) {
    soundEffects.collision(intensity)
    lastCollisionSoundTime = now
  }
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

    if (t.zone && t.returnDelay !== undefined) {
      homeZone = state.zones.find((zone) => zone.id === t.zone)

      if (homeZone && t.returnStartTime) {
        const elapsedSeconds = (currentTime - t.returnStartTime) / 1000

        if (elapsedSeconds >= t.returnDelay && !t.returning) {
          t.returning = true
        }

        if (t.returning) {
          gravity = homeZone.gravity * 0.3
          chaos = homeZone.chaos
          target = homeZone
        } else {
          gravity = 0.2
          chaos = homeZone.chaos * 1.5
          target = t
        }
      }
    } else if (t.zone) {
      homeZone = state.zones.find((zone) => zone.id === t.zone)
      if (homeZone) {
        gravity = homeZone.gravity
        chaos = homeZone.chaos
        target = homeZone
      }
    }

    const force = Vector.sub(target, t)
    const dist = Vector.mag(force)

    if (dist > 10) {
      const dir = Vector.normalize(force)
      const strength = t.returning ? 0.05 : 0.1
      t.vx += dir.x * gravity * strength
      t.vy += dir.y * gravity * strength
    }

    // ANTONYM ATTRACTION & SYNONYM REPULSION
    if (!t.breakBond || t.breakBond <= 0) {
      state.thoughts.forEach((other) => {
        if (other === t) return
        if (other.breakBond > 0) return

        const attractionForce = Vector.sub(other, t)
        const attractionDist = Vector.mag(attractionForce)

        // ANTONYM ATTRACTION
        if (areAntonyms(t.text, other.text)) {
          if (attractionDist < 300 && attractionDist > 60) {
            const attractionDir = Vector.normalize(attractionForce)
            const strength = 0.5 * (1 - attractionDist / 300)
            t.vx += attractionDir.x * strength
            t.vy += attractionDir.y * strength

            t.glow = 0.6
            other.glow = 0.6

            // Auto-create connection
            if (!state.connections) state.connections = []
            const tIndex = state.thoughts.indexOf(t)
            const otherIndex = state.thoughts.indexOf(other)
            const connExists = state.connections.some(
              (c) =>
                (c.from === tIndex && c.to === otherIndex) ||
                (c.from === otherIndex && c.to === tIndex),
            )
            if (!connExists && attractionDist < 150) {
              state.connections.push({
                from: tIndex,
                to: otherIndex,
                type: 'antonym',
                strength: 1 - attractionDist / 150,
              })

              // Play attraction sound when connection forms
              soundEffects.attraction()
            }

            if (t.returning) {
              t.vx *= 0.95
              t.vy *= 0.95
            }
          }
        }

        // SYNONYM REPULSION
        if (areSynonyms(t.text, other.text)) {
          if (attractionDist < 200) {
            const repulsionDir = Vector.normalize(attractionForce)
            const strength = 0.3 * (1 - attractionDist / 200)
            t.vx -= repulsionDir.x * strength // Repel (negative force)
            t.vy -= repulsionDir.y * strength

            t.glow = 0.4
            other.glow = 0.4
          }
        }
      })
    } else {
      t.breakBond--
    }

    t.vx += (Math.random() - 0.5) * chaos
    t.vy += (Math.random() - 0.5) * chaos

    const frictionAmount = t.returning ? 0.99 : params.friction
    t.vx *= frictionAmount
    t.vy *= frictionAmount

    t.x += t.vx
    t.y += t.vy

    if (homeZone && t.returning) {
      const distFromZone = Vector.dist(t, homeZone)

      if (distFromZone < homeZone.radius * 0.5) {
        t.returning = false
        t.returnDelay = undefined
        t.returnStartTime = undefined
      }

      if (distFromZone > homeZone.radius - t.size) {
        const dir = Vector.normalize(Vector.sub(homeZone, t))
        t.x = homeZone.x - dir.x * (homeZone.radius - t.size)
        t.y = homeZone.y - dir.y * (homeZone.radius - t.size)
        t.vx *= -0.5
        t.vy *= -0.5
      }
    }

    if (t.glow > 0) {
      t.glow = Math.max(0, t.glow - 0.02)
    }
  })

  // Clean up old connections
  if (state.connections) {
    state.connections = state.connections.filter((conn) => {
      const t1 = state.thoughts[conn.from]
      const t2 = state.thoughts[conn.to]
      if (!t1 || !t2) return false
      // Keep manual connections regardless of distance
      if (conn.type === 'manual') return true
      const dist = Vector.dist(t1, t2)
      return dist < 200
    })
  }

  // Collision detection with SOUND
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

        const bounceAmount = t1.returning || t2.returning ? 0.6 : 0.8
        const tempVx = t1.vx
        const tempVy = t1.vy
        t1.vx = t2.vx * bounceAmount
        t1.vy = t2.vy * bounceAmount
        t2.vx = tempVx * bounceAmount
        t2.vy = tempVy * bounceAmount

        t1.glow = 0.5
        t2.glow = 0.5

        // Calculate collision intensity based on relative velocity
        const relativeSpeed = Math.sqrt(
          Math.pow(tempVx - t2.vx, 2) + Math.pow(tempVy - t2.vy, 2),
        )

        // Play collision sound if impact is significant
        if (relativeSpeed > 1) {
          const intensity = Math.min(relativeSpeed / 8, 1)
          playCollisionSound(intensity)
        }

        const collisionX = (t1.x + t2.x) / 2
        const collisionY = (t1.y + t2.y) / 2
        for (let k = 0; k < 5; k++) {
          state.particles.push(createParticle(collisionX, collisionY, t1.color))
        }
      }
    }
  }

  // Boundary collision with sound
  state.thoughts.forEach((t) => {
    const canvas = { width: window.innerWidth, height: window.innerHeight }
    let hitBoundary = false

    if (t.x - t.size < 0) {
      t.x = t.size
      t.vx *= -0.7
      t.glow = 0.3
      hitBoundary = true
    }
    if (t.x + t.size > canvas.width) {
      t.x = canvas.width - t.size
      t.vx *= -0.7
      t.glow = 0.3
      hitBoundary = true
    }
    if (t.y - t.size < 0) {
      t.y = t.size
      t.vy *= -0.7
      t.glow = 0.3
      hitBoundary = true
    }
    if (t.y + t.size > canvas.height) {
      t.y = canvas.height - t.size
      t.vy *= -0.7
      t.glow = 0.3
      hitBoundary = true
    }

    // Play soft boundary hit sound
    if (hitBoundary) {
      const speed = Math.sqrt(t.vx * t.vx + t.vy * t.vy)
      if (speed > 2) {
        playCollisionSound(Math.min(speed / 10, 0.5))
      }
    }
  })
}
