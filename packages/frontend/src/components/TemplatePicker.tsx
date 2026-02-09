import { BUILTIN_TEMPLATES } from '../models/template'

interface TemplatePickerProps {
  readonly currentTemplateId: string
  readonly onSelect: (templateId: string) => void
}

export function TemplatePicker({ currentTemplateId, onSelect }: TemplatePickerProps) {
  return (
    <div data-testid="template-picker">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
        Theme
      </span>
      <div className="space-y-1.5">
        {BUILTIN_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => onSelect(tmpl.id)}
            className={`w-full p-2.5 rounded-xl border-2 text-left transition-all ${
              currentTemplateId === tmpl.id
                ? 'border-primary bg-primary-50 shadow-sm'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            data-testid={`template-option-${tmpl.id}`}
          >
            <div
              className="h-4 rounded-lg flex gap-0.5 mb-1.5"
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
            <span className="text-xs font-semibold text-slate-600">{tmpl.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
