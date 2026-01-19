// src/ui/ControlPanel.jsx - SIMPLIFIED (NO DRAGGING)
import {
  Brain,
  Pause,
  Play,
  Trash2,
  ZoomIn,
  ZoomOut,
  Save,
  Download,
  Link,
  Sparkles,
  Minimize2,
} from 'lucide-react'
import { useState } from 'react'
import AddThought from './AddThought'

export default function ControlPanel({
  show,
  onToggle,
  isRunning,
  onToggleRunning,
  onClear,
  thoughtText,
  setThoughtText,
  onAddThought,
  zones,
  selectedZone,
  setSelectedZone,
  onSave,
  onLoad,
  onExport,
  onToggleConnections,
  zoom,
  onZoomIn,
  onZoomOut,
}) {
  const [isMinimized, setIsMinimized] = useState(false)

  // Minimized state
  if (isMinimized) {
    return (
      <div className="absolute top-4 left-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full shadow-2xl border-2 border-purple-400/50 z-50 w-[60px] h-[60px]">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full h-full flex items-center justify-center text-white hover:scale-110 transition-transform"
        >
          <Brain className="w-7 h-7" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="absolute top-4 left-4 bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden backdrop-blur-lg z-50"
      style={{
        width: show ? '340px' : '60px',
        maxHeight: '90vh',
      }}
    >
      <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              {show && (
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold text-lg">
                  Mind Palace
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {show && (
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onToggle}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded"
                title={show ? 'Collapse' : 'Expand'}
              >
                {show ? '←' : '→'}
              </button>
            </div>
          </div>
        </div>

        {show && (
          <div className="p-4">
            {/* Add Thought Section */}
            <AddThought
              value={thoughtText}
              onChange={setThoughtText}
              onAdd={onAddThought}
              zones={zones}
              selectedZone={selectedZone}
              onZoneChange={setSelectedZone}
            />

            {/* Playback Controls */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={onToggleRunning}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {isRunning ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isRunning ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={onClear}
                className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all shadow-lg"
                title="Clear All"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="mt-4">
              <label className="text-gray-300 text-sm block mb-2">
                Zoom Level
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={onZoomOut}
                  className="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="flex-1 bg-gray-700/30 rounded-lg px-3 py-2 text-center">
                  <span className="text-white text-sm font-medium">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <button
                  onClick={onZoomIn}
                  className="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="mt-4">
              <label className="text-gray-300 text-sm block mb-2">Tools</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onToggleConnections}
                  className="px-3 py-2.5 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                  title="Toggle Connection Lines"
                >
                  <Link className="w-4 h-4" />
                  <span className="text-sm">Links</span>
                </button>

                <button
                  onClick={onExport}
                  className="px-3 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                  title="Export as Image"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Export</span>
                </button>

                <button
                  onClick={onSave}
                  className="px-3 py-2.5 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                  title="Save State"
                >
                  <Save className="w-4 h-4" />
                  <span className="text-sm">Save</span>
                </button>

                <button
                  onClick={onLoad}
                  className="px-3 py-2.5 bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/30 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                  title="Load State"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">Load</span>
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <h3 className="text-xs font-semibold text-purple-400 mb-2">
                ⌨️ Shortcuts
              </h3>
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Add thought</span>
                  <code className="text-gray-300">Enter</code>
                </div>
                <div className="flex justify-between">
                  <span>Pause/Play</span>
                  <code className="text-gray-300">Space</code>
                </div>
                <div className="flex justify-between">
                  <span>Save state</span>
                  <code className="text-gray-300">Ctrl+S</code>
                </div>
                <div className="flex justify-between">
                  <span>Zoom</span>
                  <code className="text-gray-300">Ctrl+Scroll</code>
                </div>
                <div className="flex justify-between">
                  <span>Pan canvas</span>
                  <code className="text-gray-300">Drag</code>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
              <h3 className="text-xs font-semibold text-blue-400 mb-2">
                💡 Tips
              </h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Drag thoughts to move them</li>
                <li>• Ctrl+Scroll to zoom</li>
                <li>• Use scrollbars to pan</li>
                <li>• Zones have unique physics</li>
                <li>• Thoughts bounce off each other</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
