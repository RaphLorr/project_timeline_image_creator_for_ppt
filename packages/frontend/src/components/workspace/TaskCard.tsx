import type { TimelineItem } from '../../models/project'
import { MaterialIcon } from '../shared/MaterialIcon'

interface TaskCardProps {
  readonly item: TimelineItem
  readonly isSelected: boolean
  readonly onSelect: () => void
  readonly onEdit: () => void
  readonly onDelete: () => void
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TaskCard({ item, isSelected, onSelect, onEdit, onDelete }: TaskCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-xl border bg-white p-3 cursor-pointer transition-all hover:shadow-sm ${
        isSelected
          ? 'border-primary/30 ring-1 ring-primary/20 shadow-sm'
          : 'border-slate-200 hover:border-slate-300'
      }`}
      style={{ borderLeftWidth: 4, borderLeftColor: item.color }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-800 truncate" title={item.content}>{item.content}</h4>
          {item.category && (
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 rounded-full">
              {item.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            className="p-1 text-slate-400 hover:text-primary rounded-md hover:bg-primary/10 transition-colors"
            title="Edit"
          >
            <MaterialIcon name="edit" size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <MaterialIcon name="delete" size={14} />
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
        <MaterialIcon name="calendar_today" size={12} />
        {formatDateShort(item.start)} – {formatDateShort(item.end)}
      </div>
    </div>
  )
}
