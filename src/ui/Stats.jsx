// src/ui/Stats.jsx - UPDATED WITH MULTIPLAYER INDICATOR
import { ConnectionStatus } from '../hooks/UseMultiplayer'

export default function Stats({
  thoughtsCount = 0,
  particlesCount = 0,
  zoom = 1,
  // NEW PROPS
  multiplayerEnabled = false,
  userCount = 1,
  connectionStatus = ConnectionStatus.DISCONNECTED,
}) {
  return (
    <div className="absolute top-4 right-4 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-purple-500/20 shadow-lg">
      <div className="flex items-center gap-4 text-sm">
        {/* Thoughts Count */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">💭</span>
          <div>
            <div className="text-gray-400 text-xs">Thoughts</div>
            <div className="text-white font-bold">{thoughtsCount}</div>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-700"></div>

        {/* Particles Count */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <div>
            <div className="text-gray-400 text-xs">Particles</div>
            <div className="text-white font-bold">{particlesCount}</div>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-700"></div>

        {/* Zoom Level */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          <div>
            <div className="text-gray-400 text-xs">Zoom</div>
            <div className="text-white font-bold">
              {Math.round(zoom * 100)}%
            </div>
          </div>
        </div>

        {/* Multiplayer Indicator (NEW) */}
        {multiplayerEnabled && (
          <>
            <div className="w-px h-8 bg-gray-700"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <div>
                <div className="text-gray-400 text-xs">Online</div>
                <div className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      connectionStatus === ConnectionStatus.CONNECTED
                        ? 'bg-green-400 animate-pulse'
                        : connectionStatus === ConnectionStatus.CONNECTING
                          ? 'bg-yellow-400 animate-pulse'
                          : 'bg-red-400'
                    }`}
                  ></span>
                  <span
                    className={`font-bold ${
                      connectionStatus === ConnectionStatus.CONNECTED
                        ? 'text-green-400'
                        : connectionStatus === ConnectionStatus.CONNECTING
                          ? 'text-yellow-400'
                          : 'text-red-400'
                    }`}
                  >
                    {userCount}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
