import { useState } from 'react'
import type { TimelineItem } from '../../models/project'
import { MaterialIcon } from '../shared/MaterialIcon'
import { TaskCard } from './TaskCard'
import { TemplatePicker } from '../TemplatePicker'

interface TaskSidebarProps {
  readonly items: readonly TimelineItem[]
  readonly selectedItemId: string | null
  readonly currentTemplateId: string
  readonly onItemSelect: (id: string | null) => void
  readonly onItemEdit: (id: string) => void
  readonly onItemDelete: (id: string) => void
  readonly onAddTask: () => void
  readonly onTemplateChange: (templateId: string) => void
}

export function TaskSidebar({
  items,
  selectedItemId,
  currentTemplateId,
  onItemSelect,
  onItemEdit,
  onItemDelete,
  onAddTask,
  onTemplateChange,
}: TaskSidebarProps) {
  const [search, setSearch] = useState('')

  const filteredItems = search.trim()
    ? items.filter((item) =>
        item.content.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      )
    : items

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <MaterialIcon
            name="search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tasks ({items.length})
          </span>
        </div>

        {filteredItems.map((item) => (
          <TaskCard
            key={item.id}
            item={item}
            isSelected={item.id === selectedItemId}
            onSelect={() => onItemSelect(item.id)}
            onEdit={() => onItemEdit(item.id)}
            onDelete={() => onItemDelete(item.id)}
          />
        ))}

        {filteredItems.length === 0 && search.trim() && (
          <p className="text-xs text-slate-400 text-center py-4">No matching tasks</p>
        )}

        {/* Add task button */}
        <button
          onClick={onAddTask}
          className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-400 hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center gap-1.5"
        >
          <MaterialIcon name="add" size={18} />
          Add New Task
        </button>
      </div>

      {/* Template picker section */}
      <div className="border-t border-slate-100 p-4">
        <TemplatePicker
          currentTemplateId={currentTemplateId}
          onSelect={onTemplateChange}
        />
      </div>
    </div>
  )
}
