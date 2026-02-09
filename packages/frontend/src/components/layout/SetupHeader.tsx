import { MaterialIcon } from '../shared/MaterialIcon'

interface SetupHeaderProps {
  readonly currentStep: 'setup' | 'design' | 'export'
}

const STEPS = [
  { key: 'setup' as const, label: 'Setup', icon: 'tune' },
  { key: 'design' as const, label: 'Design', icon: 'palette' },
  { key: 'export' as const, label: 'Export', icon: 'download' },
]

export function SetupHeader({ currentStep }: SetupHeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6">
      <div className="flex items-center gap-2 mr-8">
        <MaterialIcon name="timeline" size={24} className="text-primary" />
        <span className="text-lg font-bold text-slate-900 tracking-tight">ProjectFlow</span>
      </div>

      <nav className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const isActive = step.key === currentStep
          const isPast = STEPS.findIndex((s) => s.key === currentStep) > i
          return (
            <div key={step.key} className="flex items-center">
              {i > 0 && (
                <div className={`w-8 h-px mx-2 ${isPast ? 'bg-primary' : 'bg-slate-200'}`} />
              )}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : isPast
                      ? 'text-primary/70'
                      : 'text-slate-400'
                }`}
              >
                <MaterialIcon name={step.icon} size={16} />
                {step.label}
              </div>
            </div>
          )
        })}
      </nav>
    </header>
  )
}
