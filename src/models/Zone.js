export function createZone(zone, canvas) {
  return {
    ...zone,
    x: canvas.width * zone.position.x,
    y: canvas.height * zone.position.y,
    radius: 120,
  }
}
