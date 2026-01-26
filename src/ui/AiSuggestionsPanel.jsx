// src/ui/AISuggestionsPanel.jsx
// ============================================
// AI SUGGESTIONS PANEL
// Displays AI-powered thought suggestions
// ============================================

import { Sparkles, X, Plus, Brain } from 'lucide-react'

export default function AiSuggestionsPanel({
  suggestions = [],
  onAddSuggestion,
  onClose,
}) {
  if (suggestions.length === 0) return null

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-gradient-to-br from-purple-900/95 to-indigo-900/95 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden backdrop-blur-lg z-40">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-purple-800/50 to-pink-800/50 border-b border-purple-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600/50 flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-300" />
          </div>
          <div>
            <span className="text-purple-200 font-semibold text-sm">
              AI Suggestions
            </span>
            <p className="text-purple-400 text-xs">Based on your thoughts</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-purple-400 hover:text-white transition-colors p-1 hover:bg-purple-700/50 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggestions */}
      <div className="p-3">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onAddSuggestion(suggestion)}
              className="group flex items-center gap-1.5 px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 hover:border-purple-400/50 text-purple-200 hover:text-white rounded-full text-sm transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="capitalize">{suggestion}</span>
            </button>
          ))}
        </div>

        {/* Hint */}
        <div className="mt-3 flex items-center gap-2 text-purple-400/70 text-xs">
          <Sparkles className="w-3 h-3" />
          <span>Click to add a suggested thought</span>
        </div>
      </div>
    </div>
  )
}
