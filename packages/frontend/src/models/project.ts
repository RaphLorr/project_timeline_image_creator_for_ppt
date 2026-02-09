export type Granularity = 'day' | 'week' | 'month'

export interface TimelineItem {
  readonly id: string
  readonly content: string
  readonly start: string
  readonly end: string
  readonly category: string
  readonly color: string
}

export interface Project {
  readonly name: string
  readonly granularity: Granularity
  readonly startDate: string
  readonly endDate: string
  readonly templateId: string
  readonly items: readonly TimelineItem[]
}

export function createProject(params: {
  name: string
  granularity: Granularity
  startDate: string
  endDate: string
  templateId: string
}): Project {
  return {
    ...params,
    items: [],
  }
}

export function createTimelineItem(params: {
  content: string
  start: string
  end: string
  category?: string
  color?: string
}): TimelineItem {
  return {
    id: crypto.randomUUID(),
    content: params.content,
    start: params.start,
    end: params.end,
    category: params.category ?? '',
    color: params.color ?? '#6B7280',
  }
}

export function addItem(project: Project, item: TimelineItem): Project {
  return {
    ...project,
    items: [...project.items, item],
  }
}

export function updateItem(
  project: Project,
  itemId: string,
  updates: Partial<Omit<TimelineItem, 'id'>>
): Project {
  return {
    ...project,
    items: project.items.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    ),
  }
}

export function removeItem(project: Project, itemId: string): Project {
  return {
    ...project,
    items: project.items.filter((item) => item.id !== itemId),
  }
}
