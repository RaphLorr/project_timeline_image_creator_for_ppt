import { useState, useCallback, useRef } from 'react'
import {
  createProject,
  createTimelineItem,
  addItem,
  updateItem,
  removeItem,
  type Project,
  type Granularity,
} from './models/project'
import { getTemplateById, getDefaultTemplate } from './models/template'
import { SetupHeader } from './components/layout/SetupHeader'
import { WorkspaceHeader } from './components/layout/WorkspaceHeader'
import { StatusFooter } from './components/layout/StatusFooter'
import { SetupSidebar, type ProjectSetupData } from './components/setup/SetupSidebar'
import { SetupCanvas } from './components/setup/SetupCanvas'
import { TimelineCanvas } from './components/TimelineCanvas'
import { TaskSidebar } from './components/workspace/TaskSidebar'
import { FloatingItemEditor } from './components/workspace/FloatingItemEditor'

export function App() {
  const [project, setProject] = useState<Project | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  const template = project
    ? (getTemplateById(project.templateId) ?? getDefaultTemplate())
    : getDefaultTemplate()

  const handleSetup = (data: ProjectSetupData) => {
    setProject(createProject(data))
  }

  const handleNewProject = () => {
    setProject(null)
    setSelectedItemId(null)
    setEditingItemId(null)
  }

  const handleItemAdd = useCallback((start: string, end: string) => {
    const item = createTimelineItem({
      content: 'New Task',
      start,
      end,
      color: template.palette[0],
    })
    setProject((prev) => (prev ? addItem(prev, item) : prev))
    setEditingItemId(item.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template])

  const handleItemUpdate = useCallback((id: string, start: string, end: string) => {
    setProject((prev) => (prev ? updateItem(prev, id, { start, end }) : prev))
  }, [])

  const handleItemSelect = useCallback((id: string | null) => {
    setSelectedItemId(id)
  }, [])

  const handleItemRemove = useCallback((id: string) => {
    setProject((prev) => (prev ? removeItem(prev, id) : prev))
    setSelectedItemId(null)
    setEditingItemId(null)
  }, [])

  const handleItemEdit = useCallback(
    (updates: { content?: string; category?: string; color?: string }) => {
      if (!editingItemId) return
      setProject((prev) => (prev ? updateItem(prev, editingItemId, updates) : prev))
    },
    [editingItemId]
  )

  const handleTemplateChange = useCallback((templateId: string) => {
    setProject((prev) => (prev ? { ...prev, templateId } : prev))
  }, [])

  const handleGranularityChange = useCallback((granularity: Granularity) => {
    setProject((prev) => (prev ? { ...prev, granularity } : prev))
  }, [])

  const handleSidebarAddTask = useCallback(() => {
    if (!project) return
    const start = project.startDate
    const [y, m, d] = start.split('-').map(Number)
    const endDate = new Date(y, m - 1, d + 7)
    const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
    const item = createTimelineItem({
      content: 'New Task',
      start,
      end,
      color: template.palette[0],
    })
    setProject((prev) => (prev ? addItem(prev, item) : prev))
    setEditingItemId(item.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, template])

  const handleSidebarItemEdit = useCallback((id: string) => {
    setEditingItemId(id)
  }, [])

  const editingItem = project?.items.find((i) => i.id === editingItemId) ?? null

  // Setup mode
  if (project === null) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <SetupHeader currentStep="setup" />
        <div className="flex-1 flex overflow-hidden">
          <div className="w-[380px] flex-shrink-0">
            <SetupSidebar onSubmit={handleSetup} />
          </div>
          <SetupCanvas />
        </div>
        <StatusFooter mode="setup" />
      </div>
    )
  }

  // Workspace mode
  return (
    <div className="h-screen flex flex-col bg-slate-50" data-testid="timeline-view">
      <WorkspaceHeader
        projectName={project.name}
        granularity={project.granularity}
        onGranularityChange={handleGranularityChange}
        exportRef={exportRef}
        onNewProject={handleNewProject}
      />
      <div className="flex-1 flex overflow-hidden">
        <TaskSidebar
          items={project.items}
          selectedItemId={selectedItemId}
          currentTemplateId={project.templateId}
          onItemSelect={handleItemSelect}
          onItemEdit={handleSidebarItemEdit}
          onItemDelete={handleItemRemove}
          onAddTask={handleSidebarAddTask}
          onTemplateChange={handleTemplateChange}
        />
        <div className="flex-1 p-4">
          <TimelineCanvas
            project={project}
            template={template}
            onItemAdd={handleItemAdd}
            onItemUpdate={handleItemUpdate}
            onItemSelect={handleItemSelect}
            onItemRemove={handleItemRemove}
            selectedItemId={selectedItemId}
            exportRef={exportRef}
          />
        </div>
      </div>
      <StatusFooter
        mode="workspace"
        itemCount={project.items.length}
        granularity={project.granularity}
      />

      {editingItem && (
        <FloatingItemEditor
          item={editingItem}
          palette={template.palette}
          onUpdate={handleItemEdit}
          onClose={() => setEditingItemId(null)}
        />
      )}
    </div>
  )
}
