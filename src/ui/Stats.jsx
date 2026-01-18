// src/ui/Stats.jsx - TOP RIGHT POSITION
export default function Stats({
  thoughtsCount = 0,
  particlesCount = 0,
  zoom = 1,
}) {
  return (
    <div className="absolute top-4 right-4 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-purple-500/20 shadow-lg">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💭</span>
          <div>
            <div className="text-gray-400 text-xs">Thoughts</div>
            <div className="text-white font-bold">{thoughtsCount}</div>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-700"></div>

        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <div>
            <div className="text-gray-400 text-xs">Particles</div>
            <div className="text-white font-bold">{particlesCount}</div>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-700"></div>

        <div className="flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          <div>
            <div className="text-gray-400 text-xs">Zoom</div>
            <div className="text-white font-bold">
              {Math.round(zoom * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
