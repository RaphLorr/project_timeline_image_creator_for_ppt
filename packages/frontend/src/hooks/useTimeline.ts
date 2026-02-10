import { useRef, useEffect, useState } from 'react'
import {
  Timeline,
  type TimelineOptions,
  type TimelineItem as VisTimelineItem,
  type TimelineOptionsItemCallbackFunction,
} from 'vis-timeline/standalone'
import { DataSet } from 'vis-data'
import type { Granularity, TimelineItem } from '../models/project'
import type { Template } from '../models/template'
import { templateToCSSVars } from '../models/template'

interface VisItem {
  readonly id: string
  readonly content: string
  readonly title: string
  readonly start: Date
  readonly end: Date
  readonly group: number
  readonly style: string
  readonly className: string
}

interface VisGroup {
  readonly id: number
  readonly content: string
}

interface UseTimelineParams {
  readonly items: readonly TimelineItem[]
  readonly startDate: string
  readonly endDate: string
  readonly granularity: Granularity
  readonly template: Template
  readonly onItemAdd: (start: string, end: string) => void
  readonly onItemUpdate: (id: string, start: string, end: string) => void
  readonly onItemSelect: (id: string | null) => void
  readonly onItemRemove: (id: string) => void
}

function snapToDay(date: Date): Date {
  const snapped = new Date(date)
  snapped.setHours(0, 0, 0, 0)
  return snapped
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function clampToStart(date: Date, startDate: string): Date {
  const min = parseLocalDate(startDate)
  return date < min ? min : date
}

function getDefaultDuration(granularity: Granularity): number {
  switch (granularity) {
    case 'day': return 1
    case 'week': return 7
    case 'month': return 30
  }
}

function getTimeAxisScale(granularity: Granularity): { scale: string; step: number } {
  switch (granularity) {
    case 'day': return { scale: 'day', step: 1 }
    case 'week': return { scale: 'week', step: 1 }
    case 'month': return { scale: 'month', step: 1 }
  }
}

const LONG_CONTENT_THRESHOLD = 20

function toVisItem(item: TimelineItem, group: number): VisItem {
  const isLong = item.content.length > LONG_CONTENT_THRESHOLD
  return {
    id: item.id,
    content: item.content,
    title: item.content,
    start: parseLocalDate(item.start),
    end: parseLocalDate(item.end),
    group,
    style: `background-color: ${item.color}; border-color: ${item.color}; color: white; border-radius: var(--tl-bar-radius, 4px);`,
    className: isLong ? 'timeline-item timeline-item-long' : 'timeline-item',
  }
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getRelativeTimeLabel(date: Date, startDate: string, granularity: Granularity): string {
  const start = parseLocalDate(startDate)
  const diffMs = date.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  switch (granularity) {
    case 'day':
      // Ensure minimum of 1
      return `DAY${Math.max(1, diffDays + 1)}`
    case 'week':
      const weekNum = Math.max(1, Math.floor(diffDays / 7) + 1)
      return `WEEK${weekNum}`
    case 'month':
      const monthNum = Math.max(1, Math.floor(diffDays / 30) + 1)
      return `MONTH${monthNum}`
  }
}

export function useTimeline({
  items,
  startDate,
  endDate,
  granularity,
  template,
  onItemAdd,
  onItemUpdate,
  onItemSelect,
  onItemRemove,
}: UseTimelineParams) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<Timeline | null>(null)
  const datasetRef = useRef<DataSet<VisItem>>(new DataSet())
  const groupsRef = useRef<DataSet<VisGroup>>(new DataSet([{ id: 0, content: '' }]))
  const groupMapRef = useRef<Map<string, number>>(new Map())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Use refs for callbacks to avoid stale closures in vis-timeline event handlers
  const callbacksRef = useRef({ onItemAdd, onItemUpdate, onItemSelect, onItemRemove, granularity, startDate })
  callbacksRef.current = { onItemAdd, onItemUpdate, onItemSelect, onItemRemove, granularity, startDate }

  // Initialize timeline
  useEffect(() => {
    if (!containerRef.current) return

    const { scale, step } = getTimeAxisScale(granularity)

    const options: TimelineOptions = {
      height: '300px',
      minHeight: '200px',
      editable: {
        add: true,
        updateTime: true,
        updateGroup: true,
        remove: true,
      },
      snap: (date: Date) => clampToStart(snapToDay(date), callbacksRef.current.startDate),
      start: parseLocalDate(startDate),
      end: parseLocalDate(endDate),
      min: parseLocalDate(startDate),
      max: parseLocalDate(endDate),
      zoomMin: 1000 * 60 * 60 * 24,
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 2,
      orientation: 'top',
      stack: true,
      margin: { item: 10 },
      showCurrentTime: true,
      timeAxis: {
        scale: scale as 'day' | 'week' | 'month',
        step,
      },
      onAdd: ((item: VisTimelineItem, callback: (item: VisTimelineItem | null) => void) => {
        const g = callbacksRef.current.granularity
        const snappedStart = clampToStart(snapToDay(item.start as Date), callbacksRef.current.startDate)
        const end = new Date(snappedStart)
        end.setDate(end.getDate() + getDefaultDuration(g))
        callbacksRef.current.onItemAdd(formatDate(snappedStart), formatDate(end))
        // Cancel vis-timeline's internal add — we manage items via React state
        callback(null)
      }) as TimelineOptionsItemCallbackFunction,
      onMove: ((item: VisTimelineItem, callback: (item: VisTimelineItem | null) => void) => {
        const snappedStart = clampToStart(snapToDay(item.start as Date), callbacksRef.current.startDate)
        const snappedEnd = item.end ? snapToDay(item.end as Date) : undefined
        // Persist group (row) assignment
        if (item.group !== undefined && item.group !== null) {
          groupMapRef.current.set(String(item.id), Number(item.group))
        }
        callbacksRef.current.onItemUpdate(
          String(item.id),
          formatDate(snappedStart),
          snappedEnd ? formatDate(snappedEnd) : formatDate(snappedStart)
        )
        callback({ ...item, start: snappedStart, end: snappedEnd })
      }) as TimelineOptionsItemCallbackFunction,
      onRemove: ((item: VisTimelineItem, callback: (item: VisTimelineItem | null) => void) => {
        callbacksRef.current.onItemRemove(String(item.id))
        callback(null)
      }) as TimelineOptionsItemCallbackFunction,
    }

    const timeline = new Timeline(
      containerRef.current,
      datasetRef.current,
      groupsRef.current,
      options as TimelineOptions
    )

    timeline.on('select', (props: { items: string[] }) => {
      const id = props.items.length > 0 ? props.items[0] : null
      setSelectedId(id)
      callbacksRef.current.onItemSelect(id)
    })

    // Auto-select on hover for direct drag/resize without clicking
    timeline.on('itemover', (props: { item: string | number }) => {
      timeline.setSelection([props.item])
    })

    // Update time labels to show relative format (WEEK1, DAY1, etc.)
    const updateTimeLabels = () => {
      if (!containerRef.current) return

      const labels = containerRef.current.querySelectorAll('.vis-text')
      const start = parseLocalDate(callbacksRef.current.startDate)
      const gran = callbacksRef.current.granularity

      labels.forEach((label) => {
        const text = label.textContent?.trim()
        // Skip year labels and already converted labels
        if (!text || text.includes('2026') || text.includes('DAY') || text.includes('WEEK') || text.includes('MONTH')) return

        let date: Date | null = null

        // For month granularity, handle month names (Jan, Feb, Mar, etc.)
        if (gran === 'month') {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          const monthIndex = monthNames.findIndex(m => text.includes(m))
          if (monthIndex >= 0) {
            date = new Date(start.getFullYear(), monthIndex, 1)
          }
        } else {
          // For day and week granularity, parse the number
          const num = parseInt(text)
          if (!isNaN(num)) {
            switch (gran) {
              case 'day':
                // num is the day of month, create date for that day
                date = new Date(start.getFullYear(), start.getMonth(), num)
                break
              case 'week':
                // For week view, labels show the first day of each week
                date = new Date(start.getFullYear(), start.getMonth(), num)
                break
            }
          }
        }

        if (date && !isNaN(date.getTime())) {
          const relativeLabel = getRelativeTimeLabel(date, callbacksRef.current.startDate, gran)
          label.textContent = relativeLabel
          // Add class for styling
          label.classList.add('tl-granularity-label')
        }
      })
    }

    // Continuously update labels as vis-timeline may re-render them
    const intervalId = setInterval(updateTimeLabels, 100)

    // Also update on timeline events
    timeline.on('rangechanged', updateTimeLabels)
    timeline.on('changed', updateTimeLabels)

    timelineRef.current = timeline

    return () => {
      clearInterval(intervalId)
      timeline.destroy()
      timelineRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, granularity])

  // Sync items to dataset + manage groups
  useEffect(() => {
    const currentItemIds = new Set(items.map(i => i.id))

    // Remove stale entries from group map
    for (const [id] of groupMapRef.current) {
      if (!currentItemIds.has(id)) {
        groupMapRef.current.delete(id)
      }
    }

    // Assign new items to their own row
    for (const item of items) {
      if (!groupMapRef.current.has(item.id)) {
        const usedGroups = new Set(groupMapRef.current.values())
        let nextGroup = 0
        while (usedGroups.has(nextGroup)) nextGroup++
        groupMapRef.current.set(item.id, nextGroup)
      }
    }

    // Ensure enough groups exist (used rows + 1 extra for drag targets)
    const groupValues = Array.from(groupMapRef.current.values())
    const maxGroup = groupValues.length > 0 ? Math.max(...groupValues) : 0
    const groupCount = maxGroup + 2
    const groupsDataset = groupsRef.current
    const existingGroupIds = new Set(groupsDataset.getIds() as number[])

    for (let i = 0; i < groupCount; i++) {
      if (!existingGroupIds.has(i)) {
        groupsDataset.add({ id: i, content: '' })
      }
    }
    for (const gid of existingGroupIds) {
      if ((gid as number) >= groupCount) {
        groupsDataset.remove(gid)
      }
    }

    // Sync items to DataSet
    const dataset = datasetRef.current
    const visItems = items.map(i => toVisItem(i, groupMapRef.current.get(i.id) ?? 0))
    const existingIds = new Set(dataset.getIds() as string[])
    const newIds = new Set(visItems.map((i) => i.id))

    for (const id of existingIds) {
      if (!newIds.has(id)) {
        dataset.remove(id)
      }
    }

    for (const item of visItems) {
      if (existingIds.has(item.id)) {
        dataset.update(item)
      } else {
        dataset.add(item)
      }
    }
  }, [items])

  // Apply template CSS variables
  useEffect(() => {
    if (!containerRef.current) return
    const vars = templateToCSSVars(template)
    for (const [key, value] of Object.entries(vars)) {
      containerRef.current.style.setProperty(key, value)
    }
  }, [template])

  return {
    containerRef,
    selectedId,
  }
}
