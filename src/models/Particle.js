// src/models/Particle.js - UPDATED
export function createParticle(x, y, color = null) {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    life: 1,
    maxLife: 1,
    size: Math.random() * 6 + 3, // Bigger particles (was 3+1, now 6+3)
    color: color || `hsl(${Math.random() * 60 + 200}, 80%, 65%)`,
    glow: Math.random() * 0.8 + 0.5,
  }
}

export function updateParticles(particles) {
  return particles.filter((p) => {
    p.x += p.vx
    p.y += p.vy

    p.vy += 0.03 // Less gravity
    p.vx *= 0.99
    p.vy *= 0.99

    p.life -= 0.015 // Slower fade
    p.glow = p.life

    return p.life > 0
  })
}

export function renderParticles(ctx, particles) {
  particles.forEach((p) => {
    ctx.save()

    // Stronger glow
    if (p.glow > 0.3) {
      ctx.shadowBlur = 15
      ctx.shadowColor = p.color
    }

    ctx.globalAlpha = p.life * 0.9
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()

    // Add bright center
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  })
}

export function createExplosion(x, y, count = 20, color = null) {
  const particles = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count
    const speed = Math.random() * 5 + 3
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      size: Math.random() * 6 + 3,
      color: color || `hsl(${Math.random() * 360}, 80%, 65%)`,
      glow: 1,
    })
  }
  return particles
}

export function createAmbientParticle(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    life: Math.random() * 0.8 + 0.4,
    maxLife: 1,
    size: Math.random() * 4 + 2, // Bigger ambient particles
    color: `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`,
    glow: 0.5,
  }
}

// NEW: Energy wave system
export function createEnergyWave(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 10,
    maxRadius: Math.random() * 200 + 150,
    speed: Math.random() * 2 + 1,
    alpha: 0.6,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
  }
}

export function updateEnergyWaves(waves) {
  return waves.filter((w) => {
    w.radius += w.speed
    w.alpha = 1 - w.radius / w.maxRadius
    return w.radius < w.maxRadius
  })
}

export function renderEnergyWaves(ctx, waves) {
  waves.forEach((w) => {
    ctx.save()

    // Multiple rings for visibility
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = w.color
      ctx.lineWidth = 4 - i
      ctx.globalAlpha = w.alpha * (0.6 - i * 0.15)
      ctx.shadowBlur = 20
      ctx.shadowColor = w.color
      ctx.beginPath()
      ctx.arc(w.x, w.y, w.radius + i * 5, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.restore()
  })
}
