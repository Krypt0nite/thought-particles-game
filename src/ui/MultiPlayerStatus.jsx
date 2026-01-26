// src/ui/MultiplayerStatus.jsx
// ============================================
// MULTIPLAYER STATUS PANEL
// Shows connected users and connection status
// ============================================

import { Users, Wifi, WifiOff, Loader2 } from 'lucide-react'

export default function MultiPlayerStatus({
  isConnected,
  connectionStatus,
  users = [],
  userCount = 1,
}) {
  // Get status icon and color
  const getStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi className="w-3.5 h-3.5" />,
          color: 'text-green-400',
          bgColor: 'bg-green-900/30',
          borderColor: 'border-green-500/30',
          text: 'Connected',
        }
      case 'connecting':
        return {
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/30',
          borderColor: 'border-yellow-500/30',
          text: 'Connecting...',
        }
      case 'error':
        return {
          icon: <WifiOff className="w-3.5 h-3.5" />,
          color: 'text-red-400',
          bgColor: 'bg-red-900/30',
          borderColor: 'border-red-500/30',
          text: 'Error',
        }
      default:
        return {
          icon: <WifiOff className="w-3.5 h-3.5" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/30',
          borderColor: 'border-gray-500/30',
          text: 'Disconnected',
        }
    }
  }

  const status = getStatusDisplay()

  return (
    <div className="absolute bottom-4 right-4 z-40">
      <div
        className={`${status.bgColor} ${status.borderColor} border backdrop-blur-lg rounded-xl p-3 shadow-lg`}
      >
        {/* Connection Status */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`${status.color} flex items-center gap-1.5`}>
            {status.icon}
            <span className="text-xs font-medium">{status.text}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-300 text-xs font-medium">
              {userCount}
            </span>
          </div>
        </div>

        {/* User List */}
        {isConnected && users.length > 0 && (
          <div className="border-t border-gray-700/50 pt-2 mt-2">
            <div className="text-gray-400 text-xs mb-1.5">Online Users</div>
            <div className="flex flex-col gap-1.5">
              {/* Current user */}
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-purple-400/50"
                  style={{ background: '#9b59b6' }}
                />
                <span className="text-gray-300 text-xs">You</span>
                <span className="text-green-400 text-xs ml-auto">●</span>
              </div>

              {/* Other users */}
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: user.color }}
                  />
                  <span className="text-gray-300 text-xs">{user.name}</span>
                  <span className="text-green-400 text-xs ml-auto animate-pulse">
                    ●
                  </span>
                </div>
              ))}

              {/* Overflow indicator */}
              {users.length > 5 && (
                <div className="text-gray-500 text-xs">
                  +{users.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Room info */}
        {isConnected && (
          <div className="text-gray-500 text-xs mt-2 pt-2 border-t border-gray-700/50">
            Room: <span className="text-gray-400">mind-palace-room</span>
          </div>
        )}
      </div>
    </div>
  )
}
