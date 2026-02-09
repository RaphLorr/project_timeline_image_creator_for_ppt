import { useState } from 'react'
import type { Granularity } from '../../models/project'
import { BUILTIN_TEMPLATES } from '../../models/template'
import { MaterialIcon } from '../shared/MaterialIcon'

export interface ProjectSetupData {
  readonly name: string
  readonly granularity: Granularity
  readonly startDate: string
  readonly endDate: string
  readonly templateId: string
}

interface SetupSidebarProps {
  readonly onSubmit: (data: ProjectSetupData) => void
}

const GRANULARITY_OPTIONS: readonly { value: Granularity; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

export function SetupSidebar({ onSubmit }: SetupSidebarProps) {
  const [name, setName] = useState('')
  const [granularity, setGranularity] = useState<Granularity>('week')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [templateId, setTemplateId] = useState(BUILTIN_TEMPLATES[0].id)

  const isValid = name.trim() !== '' && startDate !== '' && endDate !== '' && startDate < endDate

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    onSubmit({ name: name.trim(), granularity, startDate, endDate, templateId })
  }

  return (
    <div className="w-full h-full bg-white border-r border-slate-200 overflow-y-auto">
      <form onSubmit={handleSubmit} className="p-6 space-y-6" data-testid="setup-form">
        {/* Project Name */}
        <div>
          <label
            htmlFor="project-name"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
          >
            Project Name
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Website Redesign"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        {/* Granularity */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Time Scale
          </label>
          <div className="flex bg-slate-100 rounded-xl p-1">
            {GRANULARITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGranularity(opt.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  granularity === opt.value
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                data-testid={`granularity-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="start-date" className="block text-[10px] text-slate-400 mb-1">
                Start
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-[10px] text-slate-400 mb-1">
                End
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Template */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Template
          </label>
          <div className="space-y-2">
            {BUILTIN_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setTemplateId(tmpl.id)}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                  templateId === tmpl.id
                    ? 'border-primary bg-primary-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                data-testid={`template-${tmpl.id}`}
              >
                <div
                  className="h-6 rounded-lg flex gap-0.5 p-0.5 mb-2"
                  style={{ backgroundColor: tmpl.styles.backgroundColor }}
                >
                  {tmpl.palette.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-700">{tmpl.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          data-testid="create-btn"
        >
          <MaterialIcon name="rocket_launch" size={18} />
          Create Timeline
        </button>
      </form>
    </div>
  )
}
