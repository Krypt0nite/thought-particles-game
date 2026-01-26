// src/hooks/useConnectionMode.js
import { useState, useCallback } from 'react'

export default function useConnectionMode(stateRef, options = {}) {
  const { onConnectionCreated, onSoundEffect } = options

  // State
  const [isActive, setIsActive] = useState(false)
  const [pendingThought, setPendingThought] = useState(null)
  const [pendingThoughtIndex, setPendingThoughtIndex] = useState(null)
  const [showLabelModal, setShowLabelModal] = useState(false)
  const [tempConnection, setTempConnection] = useState(null)
  const [showConnectionList, setShowConnectionList] = useState(false)

  // Toggle connection mode on/off
  const toggleConnectionMode = useCallback(() => {
    setIsActive((prev) => {
      if (prev) {
        // Turning off - clear pending
        setPendingThought(null)
        setPendingThoughtIndex(null)
      }
      return !prev
    })
  }, [])

  // Handle thought click in connection mode
  const handleThoughtClick = useCallback(
    (thought, thoughtIndex) => {
      if (!isActive) return false

      if (pendingThought === null) {
        // First click - select starting thought
        setPendingThought(thought)
        setPendingThoughtIndex(thoughtIndex)

        if (onSoundEffect) onSoundEffect('select')

        return true
      } else {
        // Second click - create connection
        if (thoughtIndex === pendingThoughtIndex) {
          // Same thought clicked - deselect
          setPendingThought(null)
          setPendingThoughtIndex(null)
          return true
        }

        // Check if connection already exists
        const connections = stateRef.current.connections || []
        const exists = connections.some(
          (c) =>
            (c.from === pendingThoughtIndex && c.to === thoughtIndex) ||
            (c.from === thoughtIndex && c.to === pendingThoughtIndex),
        )

        if (exists) {
          // Connection exists - cancel
          setPendingThought(null)
          setPendingThoughtIndex(null)
          return true
        }

        // Store temp connection and show label modal
        setTempConnection({
          from: pendingThoughtIndex,
          to: thoughtIndex,
        })
        setShowLabelModal(true)

        return true
      }
    },
    [isActive, pendingThought, pendingThoughtIndex, stateRef, onSoundEffect],
  )

  // Complete connection with label
  const completeConnection = useCallback(
    (label, color) => {
      if (!tempConnection) return

      const connection = {
        ...tempConnection,
        type: 'manual',
        label: label || '',
        color: color || '#6366f1',
        createdAt: Date.now(),
      }

      // Add to connections
      if (!stateRef.current.connections) {
        stateRef.current.connections = []
      }
      stateRef.current.connections.push(connection)

      // Callback
      if (onConnectionCreated) {
        onConnectionCreated(connection)
      }

      // Sound effect
      if (onSoundEffect) onSoundEffect('connect')

      // Reset state
      setTempConnection(null)
      setShowLabelModal(false)
      setPendingThought(null)
      setPendingThoughtIndex(null)
    },
    [tempConnection, stateRef, onConnectionCreated, onSoundEffect],
  )

  // Cancel label modal
  const cancelLabelModal = useCallback(() => {
    setShowLabelModal(false)
    setTempConnection(null)
    setPendingThought(null)
    setPendingThoughtIndex(null)
  }, [])

  // Delete a connection by index
  const deleteConnection = useCallback(
    (connectionIndex) => {
      if (stateRef.current.connections) {
        stateRef.current.connections.splice(connectionIndex, 1)
        if (onSoundEffect) onSoundEffect('delete')
      }
    },
    [stateRef, onSoundEffect],
  )

  // Check if a thought is the pending thought
  const isThoughtPending = useCallback(
    (thoughtIndex) => {
      return isActive && pendingThoughtIndex === thoughtIndex
    },
    [isActive, pendingThoughtIndex],
  )

  return {
    // State
    isActive,
    pendingThought,
    pendingThoughtIndex,
    showLabelModal,
    tempConnection,
    showConnectionList,

    // Actions
    toggleConnectionMode,
    handleThoughtClick,
    completeConnection,
    cancelLabelModal,
    deleteConnection,
    setShowConnectionList,

    // Helpers
    isThoughtPending,
  }
}
