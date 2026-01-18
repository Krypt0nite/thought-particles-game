// src/engine/Renderer.js - FIXED COLOR FORMATS
import { renderParticles, renderEnergyWaves } from '../models/Particle'

export function render(ctx, canvas, state) {
  const camera = state.camera || { x: 0, y: 0, zoom: 1 }

  // Cosmic background
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2,
  )
  gradient.addColorStop(0, '#0f1729')
  gradient.addColorStop(1, '#0a0e1a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Animated starfield
  const time = Date.now() * 0.0001
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  for (let i = 0; i < 150; i++) {
    const x = (i * 157.3) % canvas.width
    const y = (i * 211.7) % canvas.height
    const size = (i % 3) * 0.5 + 0.5
    const twinkle = Math.sin(time + i * 0.5) * 0.3 + 0.7
    ctx.globalAlpha = twinkle
    ctx.fillRect(x, y, size, size)
  }
  ctx.globalAlpha = 1

  ctx.save()

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  ctx.translate(centerX, centerY)
  ctx.scale(camera.zoom, camera.zoom)
  ctx.translate(-centerX + camera.x, -centerY + camera.y)

  // Energy waves
  if (state.energyWaves && state.energyWaves.length > 0) {
    renderEnergyWaves(ctx, state.energyWaves)
  }

  // ENHANCED ZONE RENDERING
  state.zones.forEach((z) => {
    // Stronger zone glow
    const zoneGradient = ctx.createRadialGradient(
      z.x,
      z.y,
      0,
      z.x,
      z.y,
      z.radius * 1.5,
    )

    // Convert HSL to rgba for gradient stops
    const baseColor = z.color
    zoneGradient.addColorStop(0, `${baseColor}40`)
    zoneGradient.addColorStop(0.5, `${baseColor}20`)
    zoneGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = zoneGradient
    ctx.beginPath()
    ctx.arc(z.x, z.y, z.radius * 1.3, 0, Math.PI * 2)
    ctx.fill()

    // TRIPLE RING EFFECT
    const pulsePhase = Date.now() * 0.001
    const pulse = Math.sin(pulsePhase + z.x) * 0.3 + 0.7

    // Outer ring (glow)
    ctx.strokeStyle = z.color
    ctx.lineWidth = 6
    ctx.shadowBlur = 25
    ctx.shadowColor = z.color
    ctx.globalAlpha = pulse * 0.8
    ctx.beginPath()
    ctx.arc(z.x, z.y, z.radius + 8, 0, Math.PI * 2)
    ctx.stroke()

    // Middle ring (main)
    ctx.lineWidth = 5
    ctx.shadowBlur = 20
    ctx.globalAlpha = pulse
    ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // Inner ring (bright)
    ctx.lineWidth = 4
    ctx.shadowBlur = 15
    ctx.globalAlpha = pulse * 0.9
    ctx.beginPath()
    ctx.arc(z.x, z.y, z.radius - 8, 0, Math.PI * 2)
    ctx.stroke()

    ctx.shadowBlur = 0
    ctx.globalAlpha = 1

    // Zone icon with strong glow
    ctx.shadowBlur = 20
    ctx.shadowColor = z.color
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = z.color
    ctx.globalAlpha = 0.9
    ctx.fillText(z.icon, z.x, z.y)
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1

    // Zone name
    ctx.font = 'bold 18px Inter, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.shadowBlur = 8
    ctx.shadowColor = z.color
    ctx.globalAlpha = 0.9
    ctx.fillText(z.name, z.x, z.y + z.radius + 30)
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1
  })

  // Connections
  if (state.showConnections && state.connections) {
    state.connections.forEach((conn) => {
      const t1 = state.thoughts[conn.from]
      const t2 = state.thoughts[conn.to]
      if (t1 && t2) {
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(t1.x, t1.y)
        ctx.lineTo(t2.x, t2.y)
        ctx.stroke()
      }
    })
  }

  // Particles
  if (state.particles && state.particles.length > 0) {
    renderParticles(ctx, state.particles)
  }

  // Thoughts with FIXED color handling
  state.thoughts.forEach((t) => {
    const speed = Math.sqrt(t.vx * t.vx + t.vy * t.vy)

    // Convert HSL color to hex or rgba for proper usage
    const baseColor = t.color

    // Motion blur
    if (speed > 1) {
      ctx.globalAlpha = 0.2
      for (let i = 1; i <= 5; i++) {
        ctx.fillStyle = baseColor
        ctx.beginPath()
        ctx.arc(
          t.x - t.vx * i * 3,
          t.y - t.vy * i * 3,
          t.size * 0.85,
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    // Outer glow
    if (t.glow > 0 || speed > 1) {
      const glowGradient = ctx.createRadialGradient(
        t.x,
        t.y,
        0,
        t.x,
        t.y,
        t.size * 2,
      )

      // Use rgba instead of appending opacity to HSL
      const glowAlpha = Math.max(t.glow || 0, Math.min(speed * 0.4, 0.7))
      glowGradient.addColorStop(0, baseColor)
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = glowGradient
      ctx.globalAlpha = glowAlpha
      ctx.beginPath()
      ctx.arc(t.x, t.y, t.size * 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // Main bubble gradient
    const bubbleGradient = ctx.createRadialGradient(
      t.x - t.size * 0.3,
      t.y - t.size * 0.3,
      0,
      t.x,
      t.y,
      t.size,
    )

    // Create proper color stops
    bubbleGradient.addColorStop(0, baseColor)
    bubbleGradient.addColorStop(0.7, baseColor)
    bubbleGradient.addColorStop(1, baseColor)

    ctx.fillStyle = bubbleGradient
    ctx.globalAlpha = 0.95
    ctx.beginPath()
    ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1

    // Highlight shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.beginPath()
    ctx.arc(
      t.x - t.size * 0.3,
      t.y - t.size * 0.3,
      t.size * 0.35,
      0,
      Math.PI * 2,
    )
    ctx.fill()

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2)
    ctx.stroke()

    // Text
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${Math.max(14, t.size / 3)}px Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 2

    const maxLength = Math.floor(t.size / 5)
    const displayText =
      t.text.length > maxLength
        ? t.text.substring(0, maxLength) + '...'
        : t.text
    ctx.fillText(displayText, t.x, t.y)

    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
  })

  ctx.restore()
}
