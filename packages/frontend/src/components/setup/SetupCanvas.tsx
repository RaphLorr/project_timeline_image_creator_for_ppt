import { MaterialIcon } from '../shared/MaterialIcon'

export function SetupCanvas() {
  return (
    <div className="flex-1 h-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Ghost grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #64748B 1px, transparent 1px),
            linear-gradient(to bottom, #64748B 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Centered placeholder card */}
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-sm">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MaterialIcon name="pending_actions" size={28} className="text-primary" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Configure Your Project</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Fill in the details on the left to generate your interactive project timeline.
        </p>
      </div>
    </div>
  )
}
