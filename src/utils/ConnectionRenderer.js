// src/utils/ConnectionRenderer.js
// ============================================
// CONNECTION RENDERING UTILITIES
// Renders connections between thoughts on canvas
// ============================================

/**
 * Render all connections on canvas
 */
export function renderConnections(ctx, connections, thoughts, options = {}) {
  const {
    showLabels = true,
    pendingThoughtIndex = null,
    highlightManual = true,
  } = options

  if (!connections || connections.length === 0) return

  connections.forEach((connection, index) => {
    const t1 = thoughts[connection.from]
    const t2 = thoughts[connection.to]

    if (!t1 || !t2) return

    const isManual = connection.type === 'manual'
    const isHighlighted =
      pendingThoughtIndex === connection.from ||
      pendingThoughtIndex === connection.to

    // Determine line style
    const lineColor = isManual
      ? connection.color || '#6366f1'
      : connection.type === 'antonym'
        ? 'rgba(147, 51, 234, 0.5)'
        : 'rgba(100, 150, 255, 0.5)'

    const lineWidth = isHighlighted ? 3 : isManual ? 2 : 1.5

    ctx.save()

    // Set line style
    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidth

    // Dash pattern for non-manual connections
    if (!isManual) {
      ctx.setLineDash([5, 5])
      ctx.lineDashOffset = (Date.now() * 0.02) % 10
    }

    // Glow effect for manual connections
    if (isManual && highlightManual) {
      ctx.shadowBlur = 8
      ctx.shadowColor = lineColor
    }

    // Draw the line
    ctx.beginPath()
    ctx.moveTo(t1.x, t1.y)
    ctx.lineTo(t2.x, t2.y)
    ctx.stroke()

    // Reset
    ctx.setLineDash([])
    ctx.shadowBlur = 0

    // Draw midpoint dot
    const midX = (t1.x + t2.x) / 2
    const midY = (t1.y + t2.y) / 2

    ctx.fillStyle = lineColor
    ctx.beginPath()
    ctx.arc(midX, midY, isManual ? 5 : 3, 0, Math.PI * 2)
    ctx.fill()

    // Draw label for manual connections
    if (isManual && showLabels && connection.label) {
      drawConnectionLabel(ctx, midX, midY, connection.label, lineColor)
    }

    // Draw connection type icon for manual connections
    if (isManual && connection.label) {
      drawConnectionIcon(ctx, midX, midY - 20, connection.label)
    }

    ctx.restore()
  })
}

/**
 * Draw connection label
 */
function drawConnectionLabel(ctx, x, y, label, color) {
  const labelMap = {
    related: 'Related',
    causes: 'Causes →',
    contradicts: 'Contradicts',
    supports: 'Supports',
    reminds: 'Reminds of',
  }

  const displayLabel = labelMap[label] || label

  ctx.save()

  // Background pill
  ctx.font = '11px Inter, sans-serif'
  const textWidth = ctx.measureText(displayLabel).width
  const padding = 8
  const pillWidth = textWidth + padding * 2
  const pillHeight = 20

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.beginPath()
  ctx.roundRect(x - pillWidth / 2, y + 10, pillWidth, pillHeight, 10)
  ctx.fill()

  // Border
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.stroke()

  // Text
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(displayLabel, x, y + 20)

  ctx.restore()
}

/**
 * Draw connection icon
 */
function drawConnectionIcon(ctx, x, y, label) {
  const iconMap = {
    related: '🔗',
    causes: '➡️',
    contradicts: '⚡',
    supports: '💪',
    reminds: '💭',
  }

  const icon = iconMap[label]
  if (!icon) return

  ctx.save()
  ctx.font = '14px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(icon, x, y)
  ctx.restore()
}

/**
 * Render preview line while in connection mode
 */
export function renderConnectionPreview(ctx, startThought, mousePos) {
  if (!startThought || !mousePos) return

  ctx.save()

  // Animated dashed line
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 8])
  ctx.lineDashOffset = -(Date.now() * 0.05) % 16

  ctx.beginPath()
  ctx.moveTo(startThought.x, startThought.y)
  ctx.lineTo(mousePos.x, mousePos.y)
  ctx.stroke()

  // End point indicator
  ctx.fillStyle = 'rgba(139, 92, 246, 0.4)'
  ctx.beginPath()
  ctx.arc(mousePos.x, mousePos.y, 10, 0, Math.PI * 2)
  ctx.fill()

  // Pulsing ring at start
  const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7
  ctx.strokeStyle = `rgba(139, 92, 246, ${pulse})`
  ctx.lineWidth = 3
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.arc(
    startThought.x,
    startThought.y,
    startThought.size + 10,
    0,
    Math.PI * 2,
  )
  ctx.stroke()

  ctx.restore()
}

/**
 * Render highlighted thought (pending selection)
 */
export function renderThoughtHighlight(ctx, thought, color = '#8b5cf6') {
  if (!thought) return

  ctx.save()

  // Pulsing ring
  const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7

  ctx.strokeStyle = color
  ctx.lineWidth = 4
  ctx.globalAlpha = pulse
  ctx.shadowBlur = 15
  ctx.shadowColor = color

  ctx.beginPath()
  ctx.arc(thought.x, thought.y, thought.size + 8, 0, Math.PI * 2)
  ctx.stroke()

  // Inner glow
  ctx.globalAlpha = pulse * 0.3
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(thought.x, thought.y, thought.size + 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

/**
 * Check if a click is on a connection (for editing/deleting)
 */
export function findConnectionAtPoint(
  x,
  y,
  connections,
  thoughts,
  threshold = 15,
) {
  for (let i = connections.length - 1; i >= 0; i--) {
    const conn = connections[i]
    const t1 = thoughts[conn.from]
    const t2 = thoughts[conn.to]

    if (!t1 || !t2) continue

    // Calculate distance from point to line segment
    const distance = pointToLineDistance(x, y, t1.x, t1.y, t2.x, t2.y)

    if (distance < threshold) {
      return { connection: conn, index: i }
    }
  }

  return null
}

/**
 * Calculate distance from point to line segment
 */
function pointToLineDistance(px, py, x1, y1, x2, y2) {
  const A = px - x1
  const B = py - y1
  const C = x2 - x1
  const D = y2 - y1

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1

  if (lenSq !== 0) {
    param = dot / lenSq
  }

  let xx, yy

  if (param < 0) {
    xx = x1
    yy = y1
  } else if (param > 1) {
    xx = x2
    yy = y2
  } else {
    xx = x1 + param * C
    yy = y1 + param * D
  }

  const dx = px - xx
  const dy = py - yy

  return Math.sqrt(dx * dx + dy * dy)
}
