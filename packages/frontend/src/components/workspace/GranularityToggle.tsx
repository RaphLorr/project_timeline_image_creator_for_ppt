import type { Granularity } from '../../models/project'

interface GranularityToggleProps {
  readonly value: Granularity
  readonly onChange: (g: Granularity) => void
}

const OPTIONS: readonly { value: Granularity; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

export function GranularityToggle({ value, onChange }: GranularityToggleProps) {
  return (
    <div className="flex bg-slate-100 rounded-lg p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
            value === opt.value
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
