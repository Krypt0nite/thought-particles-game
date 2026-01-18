// src/models/Particle.js
export function createParticle(x, y, color = null) {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
    life: 1,
    maxLife: 1,
    size: Math.random() * 3 + 1,
    color: color || `hsl(${Math.random() * 60 + 200}, 70%, 70%)`,
    glow: Math.random() * 0.5 + 0.5,
  }
}

export function updateParticles(particles) {
  return particles.filter((p) => {
    // Update position
    p.x += p.vx
    p.y += p.vy

    // Apply gravity and friction
    p.vy += 0.05
    p.vx *= 0.98
    p.vy *= 0.98

    // Fade out
    p.life -= 0.02
    p.glow = p.life

    return p.life > 0
  })
}

export function renderParticles(ctx, particles) {
  particles.forEach((p) => {
    ctx.save()

    // Glow effect
    if (p.glow > 0.5) {
      ctx.shadowBlur = 10
      ctx.shadowColor = p.color
    }

    ctx.globalAlpha = p.life
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  })
}

// Create explosion of particles
export function createExplosion(x, y, count = 20, color = null) {
  const particles = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count
    const speed = Math.random() * 4 + 2
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      size: Math.random() * 4 + 2,
      color: color || `hsl(${Math.random() * 360}, 70%, 60%)`,
      glow: 1,
    })
  }
  return particles
}

// Create ambient particles (stars, sparkles)
export function createAmbientParticle(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    life: Math.random() * 0.5 + 0.5,
    maxLife: 1,
    size: Math.random() * 2 + 0.5,
    color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`,
    glow: 0.3,
  }
}
