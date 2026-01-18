export function createThought({ x, y, text, zone }) {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    text,
    size: 40 + Math.random() * 30,
    color: zone?.color || `hsl(${Math.random() * 360},70%,60%)`,
    zone: zone?.id || null,
    glow: 0,
  }
}
