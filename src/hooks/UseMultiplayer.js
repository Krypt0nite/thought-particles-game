// src/hooks/UseMultiplayer.js
// ============================================
// MULTIPLAYER HOOK - ESLint Clean Version
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react'

const DEMO_MODE_FAKE_USERS = false

const MOCK_USERS = [
  { id: 'user1', name: 'Alex', color: '#ff6b9d', avatar: '👤' },
  { id: 'user2', name: 'Jordan', color: '#4ecdc4', avatar: '👤' },
  { id: 'user3', name: 'Sam', color: '#f7dc6f', avatar: '👤' },
]

export const ConnectionStatus = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
}

export function useMultiplayer(enabled, options = {}) {
  // Only destructure what we actually use
  const {
    userName = 'You',
    userColor = '#9b59b6',
    onUserJoined = () => {},
    onUserLeft = () => {},
  } = options

  const [connectionStatus, setConnectionStatus] = useState(
    ConnectionStatus.DISCONNECTED,
  )
  const [users, setUsers] = useState([])
  const [sharedThoughts, setSharedThoughts] = useState([])
  const [cursors, setCursors] = useState({})
  const [error] = useState(null) // Removed setError - not used in demo

  const wsRef = useRef(null)

  useEffect(() => {
    if (!enabled) {
      setConnectionStatus(ConnectionStatus.DISCONNECTED)
      setUsers([])
      setCursors({})
      return
    }

    setConnectionStatus(ConnectionStatus.CONNECTING)

    const connectTimeout = setTimeout(() => {
      setConnectionStatus(ConnectionStatus.CONNECTED)

      if (DEMO_MODE_FAKE_USERS) {
        const initialUsers = MOCK_USERS.slice(
          0,
          Math.floor(Math.random() * 3) + 1,
        )
        setUsers(initialUsers)

        const initialCursors = {}
        initialUsers.forEach((user) => {
          initialCursors[user.id] = {
            x: 300 + Math.random() * 400,
            y: 200 + Math.random() * 300,
          }
        })
        setCursors(initialCursors)
      } else {
        setUsers([])
        setCursors({})
      }
    }, 500)

    let cursorInterval = null
    let userInterval = null

    if (DEMO_MODE_FAKE_USERS) {
      cursorInterval = setInterval(() => {
        setCursors((prev) => {
          const updated = { ...prev }
          Object.keys(updated).forEach((odUserId) => {
            updated[odUserId] = {
              x: updated[odUserId].x + (Math.random() - 0.5) * 20,
              y: updated[odUserId].y + (Math.random() - 0.5) * 20,
            }
          })
          return updated
        })
      }, 100)

      userInterval = setInterval(() => {
        setUsers((prev) => {
          const shouldChange = Math.random() < 0.1
          if (!shouldChange) return prev

          if (prev.length < 4 && Math.random() > 0.5) {
            const availableUsers = MOCK_USERS.filter(
              (u) => !prev.find((p) => p.id === u.id),
            )
            if (availableUsers.length > 0) {
              const newUser =
                availableUsers[
                  Math.floor(Math.random() * availableUsers.length)
                ]
              onUserJoined(newUser)

              setCursors((c) => ({
                ...c,
                [newUser.id]: {
                  x: 300 + Math.random() * 400,
                  y: 200 + Math.random() * 300,
                },
              }))

              return [...prev, newUser]
            }
          } else if (prev.length > 1) {
            const userToRemove = prev[Math.floor(Math.random() * prev.length)]
            onUserLeft(userToRemove)

            setCursors((c) => {
              const updated = { ...c }
              delete updated[userToRemove.id]
              return updated
            })

            return prev.filter((u) => u.id !== userToRemove.id)
          }
          return prev
        })
      }, 5000)
    }

    return () => {
      clearTimeout(connectTimeout)
      if (cursorInterval) clearInterval(cursorInterval)
      if (userInterval) clearInterval(userInterval)
      setConnectionStatus(ConnectionStatus.DISCONNECTED)
    }
  }, [enabled, onUserJoined, onUserLeft])

  const broadcastThought = useCallback(
    (thought) => {
      if (!enabled || connectionStatus !== ConnectionStatus.CONNECTED) return

      const sharedThought = {
        ...thought,
        sharedBy: userName,
        sharedAt: Date.now(),
      }

      setSharedThoughts((prev) => [...prev, sharedThought])
      return sharedThought
    },
    [enabled, connectionStatus, userName],
  )

  const broadcastCursor = useCallback(() => {
    if (!enabled || connectionStatus !== ConnectionStatus.CONNECTED) return
  }, [enabled, connectionStatus])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    setConnectionStatus(ConnectionStatus.DISCONNECTED)
    setUsers([])
    setCursors({})
  }, [])

  const getUsersWithCursors = useCallback(() => {
    return users.map((user) => ({
      ...user,
      cursor: cursors[user.id] || { x: 0, y: 0 },
    }))
  }, [users, cursors])

  return {
    connectionStatus,
    isConnected: connectionStatus === ConnectionStatus.CONNECTED,
    users,
    sharedThoughts,
    cursors,
    error,
    userCount: users.length + 1,
    broadcastThought,
    broadcastCursor,
    disconnect,
    getUsersWithCursors,
    currentUser: {
      id: 'current-user',
      name: userName,
      color: userColor,
    },
  }
}

export default useMultiplayer
