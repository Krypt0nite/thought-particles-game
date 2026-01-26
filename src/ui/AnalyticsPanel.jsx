// src/ui/AnalyticsPanel.jsx
// ============================================
// ANALYTICS PANEL
// Displays thought pattern analytics
// ============================================

import {
  X,
  TrendingUp,
  PieChart,
  Lightbulb,
  BarChart3,
  Heart,
} from 'lucide-react'

export default function AnalyticsPanel({ analytics, onClose }) {
  if (!analytics) return null

  const {
    totalThoughts,
    avgThoughtsPerSession,
    categoryBreakdown,
    moodTrend,
    averageMood,
    moodDistribution,
    zoneDistribution,
    topThemes,
    insights,
  } = analytics

  // Get mood color based on score
  const getMoodColor = (score) => {
    if (score >= 70) return '#10b981' // Green
    if (score >= 50) return '#f59e0b' // Yellow
    return '#ef4444' // Red
  }

  // Get mood emoji
  const getMoodEmoji = (score) => {
    if (score >= 70) return '😊'
    if (score >= 50) return '😐'
    return '😔'
  }

  return (
    <div className="absolute top-20 right-4 w-80 max-h-[calc(100vh-100px)] bg-gradient-to-br from-gray-900/98 to-gray-800/98 rounded-2xl shadow-2xl border border-blue-500/30 overflow-hidden backdrop-blur-lg z-40">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-b border-blue-500/30 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600/50 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-300" />
          </div>
          <span className="text-blue-200 font-semibold">Analytics</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-900/30 rounded-xl border border-blue-500/20 text-center">
            <div className="text-2xl font-bold text-blue-300">
              {totalThoughts}
            </div>
            <div className="text-blue-400 text-xs">Total Thoughts</div>
          </div>
          <div className="p-3 bg-green-900/30 rounded-xl border border-green-500/20 text-center">
            <div className="text-2xl font-bold text-green-300">
              {avgThoughtsPerSession}
            </div>
            <div className="text-green-400 text-xs">Avg/Session</div>
          </div>
        </div>

        {/* Mood Overview */}
        <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-300 font-semibold text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              Mood Overview
            </h3>
            <span className="text-2xl">{getMoodEmoji(averageMood)}</span>
          </div>

          {/* Mood Score Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Average Mood</span>
              <span style={{ color: getMoodColor(averageMood) }}>
                {averageMood}%
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${averageMood}%`,
                  background: getMoodColor(averageMood),
                }}
              />
            </div>
          </div>

          {/* Mood Distribution */}
          {moodDistribution && (
            <div className="flex gap-2 text-xs">
              <div className="flex-1 text-center p-2 bg-green-900/30 rounded-lg">
                <div className="text-green-400 font-medium">
                  {moodDistribution.positive}%
                </div>
                <div className="text-gray-500">Positive</div>
              </div>
              <div className="flex-1 text-center p-2 bg-yellow-900/30 rounded-lg">
                <div className="text-yellow-400 font-medium">
                  {moodDistribution.neutral}%
                </div>
                <div className="text-gray-500">Neutral</div>
              </div>
              <div className="flex-1 text-center p-2 bg-red-900/30 rounded-lg">
                <div className="text-red-400 font-medium">
                  {moodDistribution.negative}%
                </div>
                <div className="text-gray-500">Negative</div>
              </div>
            </div>
          )}
        </div>

        {/* Mood Trend */}
        {moodTrend && moodTrend.length > 0 && (
          <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <h3 className="text-gray-300 font-semibold text-sm flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Mood Trend
            </h3>
            <div className="flex items-end gap-1 h-16">
              {moodTrend.map((mood, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all hover:opacity-80"
                  style={{
                    height: `${mood}%`,
                    background: getMoodColor(mood),
                    minHeight: '4px',
                  }}
                  title={`Mood: ${mood}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Older</span>
              <span>Recent</span>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <h3 className="text-gray-300 font-semibold text-sm flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-purple-400" />
              Categories
            </h3>
            <div className="space-y-2">
              {Object.entries(categoryBreakdown)
                .filter(([cat]) => cat !== 'general')
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (count / totalThoughts) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-400 text-xs capitalize w-20 truncate">
                      {category}
                    </span>
                    <span className="text-gray-300 text-xs font-medium w-6 text-right">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Zone Distribution */}
        {zoneDistribution && (
          <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <h3 className="text-gray-300 font-semibold text-sm mb-3">
              Zone Distribution
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 bg-pink-900/20 rounded-lg">
                <span>🎨</span>
                <span className="text-gray-400">Creative</span>
                <span className="ml-auto text-pink-300 font-medium">
                  {zoneDistribution.creative || 0}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-cyan-900/20 rounded-lg">
                <span>🎯</span>
                <span className="text-gray-400">Focus</span>
                <span className="ml-auto text-cyan-300 font-medium">
                  {zoneDistribution.focus || 0}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded-lg">
                <span>📊</span>
                <span className="text-gray-400">Organize</span>
                <span className="ml-auto text-green-300 font-medium">
                  {zoneDistribution.organize || 0}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-orange-900/20 rounded-lg">
                <span>🌙</span>
                <span className="text-gray-400">Relax</span>
                <span className="ml-auto text-orange-300 font-medium">
                  {zoneDistribution.relax || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Top Themes */}
        {topThemes && topThemes.length > 0 && (
          <div className="p-3 bg-purple-900/20 rounded-xl border border-purple-500/20">
            <h3 className="text-purple-300 font-semibold text-sm mb-2">
              🔥 Top Themes
            </h3>
            <div className="flex flex-wrap gap-2">
              {topThemes.map((theme, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-xs capitalize"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {insights && insights.length > 0 && (
          <div className="p-3 bg-amber-900/20 rounded-xl border border-amber-500/20">
            <h3 className="text-amber-300 font-semibold text-sm flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4" />
              Insights
            </h3>
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li
                  key={i}
                  className="text-amber-200/80 text-xs leading-relaxed"
                >
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
