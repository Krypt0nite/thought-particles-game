// src/ui/AddThought.jsx
import { Plus } from 'lucide-react'

export default function AddThought({
  value,
  onChange,
  onAdd,
  zones = [],
  selectedZone,
  onZoneChange,
}) {
  return (
    <div className="space-y-2">
      <label className="text-gray-300 text-sm block">Add Thought</label>

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAdd()}
          placeholder="Enter thought..."
          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm focus:outline-none focus:border-purple-500"
        />

        <button
          onClick={onAdd}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {zones.length > 0 && (
        <select
          value={selectedZone || ''}
          onChange={(e) => onZoneChange(e.target.value || null)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
        >
          <option value="">Free floating</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.icon} {z.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
