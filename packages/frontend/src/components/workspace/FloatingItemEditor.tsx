import { useState, useEffect, useRef } from 'react'
import type { TimelineItem } from '../../models/project'
import { useAISuggestion } from '../../hooks/useAISuggestion'
import { MaterialIcon } from '../shared/MaterialIcon'

interface FloatingItemEditorProps {
  readonly item: TimelineItem
  readonly palette: readonly string[]
  readonly onUpdate: (updates: { content?: string; category?: string; color?: string }) => void
  readonly onClose: () => void
}

export function FloatingItemEditor({ item, palette, onUpdate, onClose }: FloatingItemEditorProps) {
  const [content, setContent] = useState(item.content)
  const [category, setCategory] = useState(item.category)
  const [color, setColor] = useState(item.color)
  const userEditedCategory = useRef(false)
  const userEditedColor = useRef(false)

  const { suggestion, loading: aiLoading, requestSuggestion } = useAISuggestion()

  useEffect(() => {
    setContent(item.content)
    setCategory(item.category)
    setColor(item.color)
    userEditedCategory.current = false
    userEditedColor.current = false
  }, [item])

  // Debounced AI suggestion request when content changes
  useEffect(() => {
    const trimmed = content.trim()
    if (!trimmed || trimmed === 'New Task') return

    const timer = setTimeout(() => {
      requestSuggestion(trimmed, palette)
    }, 600)

    return () => clearTimeout(timer)
  }, [content, palette, requestSuggestion])

  // Apply AI suggestion if user hasn't manually edited
  useEffect(() => {
    if (!suggestion) return
    if (!userEditedCategory.current && suggestion.category) {
      setCategory(suggestion.category)
    }
    if (!userEditedColor.current && suggestion.color) {
      setColor(suggestion.color)
    }
  }, [suggestion])

  const handleSave = () => {
    onUpdate({ content, category, color })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Editor card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-96 animate-fadeIn"
        data-testid="item-editor"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <MaterialIcon name="edit_note" size={20} className="text-primary" />
            Edit Task
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close editor"
          >
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="item-name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Task Name
            </label>
            <input
              id="item-name"
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              data-testid="item-name-input"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="item-category"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Category
              {aiLoading && (
                <span className="text-primary text-[10px] font-medium normal-case tracking-normal ml-2">
                  AI suggesting...
                </span>
              )}
            </label>
            <input
              id="item-category"
              type="text"
              value={category}
              onChange={(e) => { userEditedCategory.current = true; setCategory(e.target.value) }}
              placeholder="e.g. Development, Design"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              data-testid="item-category-input"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {palette.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { userEditedColor.current = true; setColor(c) }}
                  className={`w-7 h-7 rounded-lg border-2 transition-all ${
                    color === c
                      ? 'border-slate-800 scale-110 shadow-sm'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => { userEditedColor.current = true; setColor(e.target.value) }}
                className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200"
                title="Custom color"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-5 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          data-testid="item-save-btn"
        >
          <MaterialIcon name="check" size={18} />
          Save Changes
        </button>
      </div>
    </div>
  )
}
