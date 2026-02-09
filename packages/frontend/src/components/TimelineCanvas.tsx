import { useTimeline } from '../hooks/useTimeline'
import type { Project, TimelineItem } from '../models/project'
import type { Template } from '../models/template'

interface TimelineCanvasProps {
  readonly project: Project
  readonly template: Template
  readonly onItemAdd: (start: string, end: string) => void
  readonly onItemUpdate: (id: string, start: string, end: string) => void
  readonly onItemSelect: (id: string | null) => void
  readonly onItemRemove: (id: string) => void
  readonly selectedItemId: string | null
  readonly exportRef: React.RefObject<HTMLDivElement>
}

export function TimelineCanvas({
  project,
  template,
  onItemAdd,
  onItemUpdate,
  onItemSelect,
  onItemRemove,
  exportRef,
}: TimelineCanvasProps) {
  const { containerRef } = useTimeline({
    items: project.items as TimelineItem[],
    startDate: project.startDate,
    endDate: project.endDate,
    granularity: project.granularity,
    template,
    onItemAdd,
    onItemUpdate,
    onItemSelect,
    onItemRemove,
  })

  return (
    <div className="flex-1 h-full relative">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #64748B 1px, transparent 1px),
            linear-gradient(to bottom, #64748B 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div
        ref={exportRef}
        className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm h-full"
        style={{ backgroundColor: template.styles.backgroundColor }}
      >
        <div
          ref={containerRef}
          data-testid="timeline-container"
          className="h-full min-h-[300px]"
        />
      </div>
    </div>
  )
}
