export const Vector = {
  add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
  sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
  mult: (v, s) => ({ x: v.x * s, y: v.y * s }),
  mag: (v) => Math.sqrt(v.x * v.x + v.y * v.y),
  normalize: (v) => {
    const m = Vector.mag(v)
    return m > 0 ? { x: v.x / m, y: v.y / m } : { x: 0, y: 0 }
  },
  dist: (a, b) => Vector.mag(Vector.sub(a, b)),
}
