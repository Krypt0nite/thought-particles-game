// src/utils/ConnectionDrawer.js
// ============================================
// MANUAL CONNECTION DRAWING SYSTEM
// Allows users to draw custom connections between thoughts
// ============================================

/**
 * Connection types with visual styles
 */
export const CONNECTION_TYPES = {
  custom: {
    id: 'custom',
    name: 'Custom',
    color: 'rgba(100, 150, 255, 0.6)',
    icon: '🔗',
    dashPattern: [],
  },
  causeEffect: {
    id: 'causeEffect',
    name: 'Cause → Effect',
    color: 'rgba(255, 165, 0, 0.6)',
    icon: '➡️',
    dashPattern: [],
  },
  related: {
    id: 'related',
    name: 'Related',
    color: 'rgba(147, 51, 234, 0.6)',
    icon: '🔄',
    dashPattern: [5, 5],
  },
  opposite: {
    id: 'opposite',
    name: 'Opposite',
    color: 'rgba(239, 68, 68, 0.6)',
    icon: '⚡',
    dashPattern: [10, 5],
  },
  sequence: {
    id: 'sequence',
    name: 'Sequence',
    color: 'rgba(16, 185, 129, 0.6)',
    icon: '📝',
    dashPattern: [2, 2],
  },
  question: {
    id: 'question',
    name: 'Question',
    color: 'rgba(236, 72, 153, 0.6)',
    icon: '❓',
    dashPattern: [8, 4],
  },
}

/**
 * ConnectionDrawer class - manages the drawing state
 */
export class ConnectionDrawer {
  constructor() {
    this.isDrawing = false
    this.startThought = null
    this.startPoint = null
    this.currentPoint = null
    this.selectedType = 'custom'
    this.onConnectionCreated = null
    this.onDrawingStateChange = null
  }

  /**
   * Set the connection type before drawing
   */
  setConnectionType(typeId) {
    if (CONNECTION_TYPES[typeId]) {
      this.selectedType = typeId
    }
  }

  /**
   * Start drawing mode
   */
  enableDrawMode() {
    this.isDrawing = true
    this.startThought = null
    this.startPoint = null
    this.currentPoint = null
    if (this.onDrawingStateChange) {
      this.onDrawingStateChange({ isDrawing: true, stage: 'ready' })
    }
  }

  /**
   * Exit drawing mode
   */
  disableDrawMode() {
    this.isDrawing = false
    this.startThought = null
    this.startPoint = null
    this.currentPoint = null
    if (this.onDrawingStateChange) {
      this.onDrawingStateChange({ isDrawing: false, stage: 'idle' })
    }
  }

  /**
   * Handle click on a thought
   * @param {Object} thought - The clicked thought
   * @param {number} thoughtIndex - Index in thoughts array
   * @returns {Object|null} - Returns connection if completed, null otherwise
   */
  handleThoughtClick(thought, thoughtIndex) {
    if (!this.isDrawing) return null

    if (!this.startThought) {
      // First click - set start point
      this.startThought = { thought, index: thoughtIndex }
      this.startPoint = { x: thought.x, y: thought.y }

      if (this.onDrawingStateChange) {
        this.onDrawingStateChange({
          isDrawing: true,
          stage: 'connecting',
          startThought: thought,
        })
      }
      return null
    } else {
      // Second click - complete connection
      if (thoughtIndex === this.startThought.index) {
        // Clicked same thought, cancel
        this.startThought = null
        this.startPoint = null
        if (this.onDrawingStateChange) {
          this.onDrawingStateChange({ isDrawing: true, stage: 'ready' })
        }
        return null
      }

      // Create the connection
      const connection = {
        from: this.startThought.index,
        to: thoughtIndex,
        type: this.selectedType,
        typeData: CONNECTION_TYPES[this.selectedType],
        label: '',
        createdAt: Date.now(),
        isManual: true,
      }

      // Reset for next connection
      this.startThought = null
      this.startPoint = null
      this.currentPoint = null

      if (this.onDrawingStateChange) {
        this.onDrawingStateChange({ isDrawing: true, stage: 'ready' })
      }

      if (this.onConnectionCreated) {
        this.onConnectionCreated(connection)
      }

      return connection
    }
  }

  /**
   * Update current mouse position for preview line
   */
  updateCurrentPoint(x, y) {
    if (this.isDrawing && this.startThought) {
      this.currentPoint = { x, y }
    }
  }

  /**
   * Get preview line data for rendering
   */
  getPreviewLine() {
    if (!this.isDrawing || !this.startPoint || !this.currentPoint) {
      return null
    }

    return {
      start: this.startPoint,
      end: this.currentPoint,
      type: CONNECTION_TYPES[this.selectedType],
    }
  }

  /**
   * Cancel current drawing operation
   */
  cancel() {
    this.startThought = null
    this.startPoint = null
    this.currentPoint = null
    if (this.onDrawingStateChange) {
      this.onDrawingStateChange({ isDrawing: this.isDrawing, stage: 'ready' })
    }
  }
}

/**
 * Render a connection line on canvas
 */
export function renderConnection(
  ctx,
  connection,
  thoughts,
  isSelected = false,
) {
  const t1 = thoughts[connection.from]
  const t2 = thoughts[connection.to]

  if (!t1 || !t2) return

  const typeData =
    connection.typeData ||
    CONNECTION_TYPES[connection.type] ||
    CONNECTION_TYPES.custom

  ctx.save()

  // Set line style
  ctx.strokeStyle = typeData.color
  ctx.lineWidth = isSelected ? 4 : 2

  if (typeData.dashPattern && typeData.dashPattern.length > 0) {
    ctx.setLineDash(typeData.dashPattern)
  }

  // Add glow effect for selected
  if (isSelected) {
    ctx.shadowBlur = 10
    ctx.shadowColor = typeData.color
  }

  // Draw the line
  ctx.beginPath()
  ctx.moveTo(t1.x, t1.y)
  ctx.lineTo(t2.x, t2.y)
  ctx.stroke()

  // Reset dash pattern
  ctx.setLineDash([])

  // Draw direction arrow for certain types
  if (connection.type === 'causeEffect' || connection.type === 'sequence') {
    drawArrow(ctx, t1, t2, typeData.color)
  }

  // Draw midpoint indicator
  const midX = (t1.x + t2.x) / 2
  const midY = (t1.y + t2.y) / 2

  ctx.fillStyle = typeData.color
  ctx.beginPath()
  ctx.arc(midX, midY, isSelected ? 6 : 4, 0, Math.PI * 2)
  ctx.fill()

  // Draw label if exists
  if (connection.label) {
    ctx.font = '12px Inter, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowBlur = 4
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    ctx.fillText(connection.label, midX, midY - 15)
  }

  ctx.restore()
}

/**
 * Draw an arrow head
 */
function drawArrow(ctx, from, to, color) {
  const headLength = 15
  const angle = Math.atan2(to.y - from.y, to.x - from.x)

  // Calculate arrow position (closer to target)
  const arrowX = to.x - Math.cos(angle) * (to.size || 40)
  const arrowY = to.y - Math.sin(angle) * (to.size || 40)

  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(arrowX, arrowY)
  ctx.lineTo(
    arrowX - headLength * Math.cos(angle - Math.PI / 6),
    arrowY - headLength * Math.sin(angle - Math.PI / 6),
  )
  ctx.lineTo(
    arrowX - headLength * Math.cos(angle + Math.PI / 6),
    arrowY - headLength * Math.sin(angle + Math.PI / 6),
  )
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/**
 * Render preview line while drawing
 */
export function renderPreviewLine(ctx, previewLine) {
  if (!previewLine) return

  ctx.save()

  ctx.strokeStyle = previewLine.type.color
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.6

  if (previewLine.type.dashPattern && previewLine.type.dashPattern.length > 0) {
    ctx.setLineDash(previewLine.type.dashPattern)
  } else {
    ctx.setLineDash([5, 5])
  }

  // Animated dash offset
  ctx.lineDashOffset = (Date.now() * 0.05) % 20

  ctx.beginPath()
  ctx.moveTo(previewLine.start.x, previewLine.start.y)
  ctx.lineTo(previewLine.end.x, previewLine.end.y)
  ctx.stroke()

  // Draw endpoint circle
  ctx.fillStyle = previewLine.type.color
  ctx.globalAlpha = 0.4
  ctx.beginPath()
  ctx.arc(previewLine.end.x, previewLine.end.y, 8, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

/**
 * Check if a point is near a connection line (for selection)
 */
export function isPointNearConnection(
  point,
  connection,
  thoughts,
  threshold = 10,
) {
  const t1 = thoughts[connection.from]
  const t2 = thoughts[connection.to]

  if (!t1 || !t2) return false

  // Calculate distance from point to line segment
  const A = point.x - t1.x
  const B = point.y - t1.y
  const C = t2.x - t1.x
  const D = t2.y - t1.y

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1

  if (lenSq !== 0) {
    param = dot / lenSq
  }

  let xx, yy

  if (param < 0) {
    xx = t1.x
    yy = t1.y
  } else if (param > 1) {
    xx = t2.x
    yy = t2.y
  } else {
    xx = t1.x + param * C
    yy = t1.y + param * D
  }

  const dx = point.x - xx
  const dy = point.y - yy
  const distance = Math.sqrt(dx * dx + dy * dy)

  return distance < threshold
}

/**
 * Find connection at point
 */
export function findConnectionAtPoint(point, connections, thoughts) {
  for (let i = connections.length - 1; i >= 0; i--) {
    if (isPointNearConnection(point, connections[i], thoughts)) {
      return { connection: connections[i], index: i }
    }
  }
  return null
}

export default ConnectionDrawer
