import { useState, type RefObject } from 'react'
import { MaterialIcon } from '../shared/MaterialIcon'
import { GranularityToggle } from '../workspace/GranularityToggle'
import { exportToPng, exportToHtml } from '../../services/exportService'
import type { Granularity } from '../../models/project'

interface WorkspaceHeaderProps {
  readonly projectName: string
  readonly granularity: Granularity
  readonly onGranularityChange: (g: Granularity) => void
  readonly exportRef: RefObject<HTMLDivElement | null>
  readonly onNewProject: () => void
}

export function WorkspaceHeader({
  projectName,
  granularity,
  onGranularityChange,
  exportRef,
  onNewProject,
}: WorkspaceHeaderProps) {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sanitizedName = projectName.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase()

  const handlePngExport = async () => {
    if (!exportRef.current) return
    setExporting(true)
    setError(null)
    try {
      await exportToPng(exportRef.current, sanitizedName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PNG export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleHtmlExport = () => {
    if (!exportRef.current) return
    setError(null)
    try {
      exportToHtml(exportRef.current, sanitizedName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'HTML export failed')
    }
  }

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <MaterialIcon name="timeline" size={24} className="text-primary" />
          <span className="text-lg font-bold text-slate-900 tracking-tight">ProjectFlow</span>
        </div>
        <div className="h-6 w-px bg-slate-200" />
        <span className="text-sm text-slate-500 font-medium">{projectName}</span>
      </div>

      <div className="flex items-center gap-3">
        <GranularityToggle value={granularity} onChange={onGranularityChange} />

        <div className="h-6 w-px bg-slate-200" />

        <button
          onClick={handleHtmlExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          data-testid="export-html-btn"
        >
          <MaterialIcon name="code" size={16} />
          Download HTML
        </button>

        <button
          onClick={handlePngExport}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg shadow-lg shadow-primary/25 hover:bg-primary-700 disabled:opacity-50 transition-colors"
          data-testid="export-png-btn"
        >
          <MaterialIcon name="image" size={16} />
          {exporting ? 'Exporting...' : 'Copy PNG'}
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <button
          onClick={onNewProject}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="New Project"
        >
          <MaterialIcon name="add_circle" size={20} />
        </button>
      </div>

      {error && (
        <div className="absolute top-14 right-6 mt-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
    </header>
  )
}
