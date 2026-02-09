import { describe, it, expect } from 'vitest'
import {
  createProject,
  createTimelineItem,
  addItem,
  updateItem,
  removeItem,
  type Project,
  type Granularity,
} from '../../models/project'

describe('createProject', () => {
  it('creates a project with required fields', () => {
    const project = createProject({
      name: 'Test Project',
      granularity: 'week',
      startDate: '2026-03-01',
      endDate: '2026-06-01',
      templateId: 'clean-default',
    })

    expect(project.name).toBe('Test Project')
    expect(project.granularity).toBe('week')
    expect(project.startDate).toBe('2026-03-01')
    expect(project.endDate).toBe('2026-06-01')
    expect(project.templateId).toBe('clean-default')
    expect(project.items).toEqual([])
  })

  it('initializes with empty items array', () => {
    const project = createProject({
      name: 'Test',
      granularity: 'day',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      templateId: 'corporate-blue',
    })

    expect(project.items).toHaveLength(0)
  })

  it('accepts all valid granularity values', () => {
    const granularities: Granularity[] = ['day', 'week', 'month']
    for (const granularity of granularities) {
      const project = createProject({
        name: 'Test',
        granularity,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        templateId: 'clean-default',
      })
      expect(project.granularity).toBe(granularity)
    }
  })
})

describe('createTimelineItem', () => {
  it('creates an item with required fields and defaults', () => {
    const item = createTimelineItem({
      content: 'Design Phase',
      start: '2026-03-01',
      end: '2026-03-15',
    })

    expect(item.id).toBeTruthy()
    expect(item.content).toBe('Design Phase')
    expect(item.start).toBe('2026-03-01')
    expect(item.end).toBe('2026-03-15')
    expect(item.category).toBe('')
    expect(item.color).toBe('#6B7280')
  })

  it('creates an item with custom category and color', () => {
    const item = createTimelineItem({
      content: 'Development',
      start: '2026-04-01',
      end: '2026-05-01',
      category: 'Engineering',
      color: '#3B82F6',
    })

    expect(item.category).toBe('Engineering')
    expect(item.color).toBe('#3B82F6')
  })

  it('generates unique IDs for each item', () => {
    const item1 = createTimelineItem({
      content: 'Task 1',
      start: '2026-03-01',
      end: '2026-03-15',
    })
    const item2 = createTimelineItem({
      content: 'Task 2',
      start: '2026-03-01',
      end: '2026-03-15',
    })

    expect(item1.id).not.toBe(item2.id)
  })
})

describe('addItem', () => {
  it('returns a new project with the item added', () => {
    const project = createProject({
      name: 'Test',
      granularity: 'week',
      startDate: '2026-03-01',
      endDate: '2026-06-01',
      templateId: 'clean-default',
    })

    const item = createTimelineItem({
      content: 'Design',
      start: '2026-03-01',
      end: '2026-03-15',
    })

    const updated = addItem(project, item)

    expect(updated.items).toHaveLength(1)
    expect(updated.items[0]).toBe(item)
    // Original unchanged (immutability)
    expect(project.items).toHaveLength(0)
  })
})

describe('updateItem', () => {
  it('updates an existing item by id', () => {
    const item = createTimelineItem({
      content: 'Design',
      start: '2026-03-01',
      end: '2026-03-15',
    })

    const project: Project = {
      name: 'Test',
      granularity: 'week',
      startDate: '2026-03-01',
      endDate: '2026-06-01',
      templateId: 'clean-default',
      items: [item],
    }

    const updated = updateItem(project, item.id, {
      content: 'Design Phase',
      color: '#10B981',
    })

    expect(updated.items[0].content).toBe('Design Phase')
    expect(updated.items[0].color).toBe('#10B981')
    expect(updated.items[0].start).toBe('2026-03-01')
    // Original unchanged
    expect(project.items[0].content).toBe('Design')
  })
})

describe('removeItem', () => {
  it('removes an item by id', () => {
    const item = createTimelineItem({
      content: 'Design',
      start: '2026-03-01',
      end: '2026-03-15',
    })

    const project: Project = {
      name: 'Test',
      granularity: 'week',
      startDate: '2026-03-01',
      endDate: '2026-06-01',
      templateId: 'clean-default',
      items: [item],
    }

    const updated = removeItem(project, item.id)

    expect(updated.items).toHaveLength(0)
    // Original unchanged
    expect(project.items).toHaveLength(1)
  })
})
