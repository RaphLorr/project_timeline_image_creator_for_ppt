import { MaterialIcon } from '../shared/MaterialIcon'

interface StatusFooterProps {
  readonly mode: 'setup' | 'workspace'
  readonly itemCount?: number
  readonly granularity?: string
}

export function StatusFooter({ mode, itemCount = 0, granularity }: StatusFooterProps) {
  return (
    <footer className="h-9 bg-white border-t border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {mode === 'workspace' ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Workspace Live
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <MaterialIcon name="view_list" size={14} />
              {itemCount} {itemCount === 1 ? 'task' : 'tasks'}
            </div>
          </>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Configure your project
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {granularity && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Grid: {granularity}
          </span>
        )}
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <MaterialIcon name="check_circle" size={14} className="text-emerald-500 align-middle mr-1" />
          Export Ready
        </span>
      </div>
    </footer>
  )
}
