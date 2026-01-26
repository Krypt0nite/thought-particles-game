// src/ui/ConnectionMode.jsx
import { Link2, X, Check, Tag } from 'lucide-react'

export default function ConnectionMode({
  isActive,
  onToggle,
  pendingConnection,
  connections = [],
}) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="flex flex-col items-center gap-2">
        {/* Active Mode Indicator */}
        {isActive && (
          <div className="bg-gradient-to-r from-purple-900/95 to-indigo-900/95 backdrop-blur-lg rounded-xl border border-purple-500/40 p-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
              <span className="text-purple-200 text-sm font-medium">
                {pendingConnection
                  ? 'Now click second thought to connect'
                  : 'Click a thought to start connecting'}
              </span>
              {pendingConnection && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-600/30 rounded-lg">
                  <span className="text-purple-300 text-xs">From:</span>
                  <span className="text-white text-xs font-medium truncate max-w-20">
                    {pendingConnection.text}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Control Bar */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-lg rounded-full border border-gray-700/50 p-2 shadow-2xl">
          {/* Toggle Connection Mode */}
          <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all ${
              isActive
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isActive ? 'Connecting...' : 'Connect Thoughts'}
            </span>
          </button>

          {/* Cancel Button (when active) */}
          {isActive && (
            <button
              onClick={onToggle}
              className="p-2.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-full transition-all"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Connection Count */}
          {connections.length > 0 && (
            <div className="flex items-center gap-1 px-3 py-2 bg-gray-700/30 rounded-full">
              <span className="text-gray-400 text-xs">Links:</span>
              <span className="text-white text-sm font-bold">
                {connections.length}
              </span>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!isActive && connections.length === 0 && (
          <p className="text-gray-500 text-xs">
            Connect related thoughts with visual links
          </p>
        )}
      </div>
    </div>
  )
}

// Connection Label Modal
export function ConnectionLabelModal({
  isOpen,
  onClose,
  onSave,
  connection,
  thoughts,
}) {
  if (!isOpen || !connection) return null

  const thought1 = thoughts[connection.from]
  const thought2 = thoughts[connection.to]

  const labelOptions = [
    { value: 'related', label: 'Related', color: '#6366f1' },
    { value: 'causes', label: 'Causes →', color: '#22c55e' },
    { value: 'contradicts', label: 'Contradicts', color: '#ef4444' },
    { value: 'supports', label: 'Supports', color: '#3b82f6' },
    { value: 'reminds', label: 'Reminds of', color: '#f59e0b' },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-purple-500/30 p-6 w-96 shadow-2xl">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-purple-400" />
          Label Connection
        </h3>

        {/* Show connected thoughts */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-800/50 rounded-xl">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: thought1?.color || '#6366f1' }}
          />
          <span className="text-gray-300 text-sm truncate flex-1">
            {thought1?.text || 'Thought 1'}
          </span>
          <span className="text-gray-500">↔</span>
          <span className="text-gray-300 text-sm truncate flex-1">
            {thought2?.text || 'Thought 2'}
          </span>
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: thought2?.color || '#6366f1' }}
          />
        </div>

        {/* Label Options */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {labelOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSave(option.value, option.color)}
              className="flex items-center gap-2 p-3 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 rounded-xl transition-all hover:scale-[1.02]"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: option.color }}
              />
              <span className="text-gray-200 text-sm">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(null, '#6366f1')}
            className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}
