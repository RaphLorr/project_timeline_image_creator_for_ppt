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

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

// Expand start/end dates to include the full granularity period.
// e.g. if project starts Wed and granularity is 'week', expand start to Monday of that week.
function expandToFullPeriod(
  startDate: string,
  endDate: string,
  granularity: Granularity
): { expandedStart: Date; expandedEnd: Date } {
  const start = parseLocalDate(startDate)
  const end = parseLocalDate(endDate)

  switch (granularity) {
    case 'day':
      return { expandedStart: start, expandedEnd: end }
    case 'week': {
      // Expand start to Monday of that week (ISO week starts Monday)
      const startDay = start.getDay() // 0=Sun,1=Mon,...6=Sat
      const mondayOffset = startDay === 0 ? -6 : 1 - startDay
      const expandedStart = new Date(start)
      expandedStart.setDate(expandedStart.getDate() + mondayOffset)
      // Expand end to Sunday of that week
      const endDay = end.getDay()
      const sundayOffset = endDay === 0 ? 0 : 7 - endDay
      const expandedEnd = new Date(end)
      expandedEnd.setDate(expandedEnd.getDate() + sundayOffset)
      return { expandedStart, expandedEnd }
    }
    case 'month': {
      // Expand start to 1st of that month
      const expandedStart = new Date(start.getFullYear(), start.getMonth(), 1)
      // Expand end to last day of that month
      const expandedEnd = new Date(end.getFullYear(), end.getMonth() + 1, 0)
      return { expandedStart, expandedEnd }
    }
  }
}

function getRelativeTimeLabel(date: Date, startDate: string, granularity: Granularity): string {
  const start = parseLocalDate(startDate)
  const diffMs = date.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  switch (granularity) {
    case 'day':
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
    const { expandedStart, expandedEnd } = expandToFullPeriod(startDate, endDate, granularity)

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
      start: expandedStart,
      end: expandedEnd,
      min: expandedStart,
      max: expandedEnd,
      zoomMin: 1000 * 60 * 60 * 24,
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 2,
      orientation: 'top',
      stack: true,
      margin: { item: 10 },
      showCurrentTime: false,
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

    // Add project start and end marker lines with date labels
    timeline.addCustomTime(parseLocalDate(startDate), 'project-start')
    timeline.addCustomTime(parseLocalDate(endDate), 'project-end')

    // Add date labels to marker lines after DOM renders
    setTimeout(() => {
      if (!containerRef.current) return
      const markers = containerRef.current.querySelectorAll('.vis-custom-time')
      markers.forEach((el, idx) => {
        const bar = el as HTMLElement
        bar.style.pointerEvents = 'none'
        bar.style.cursor = 'default'

        const label = document.createElement('div')
        label.className = 'project-marker-label'
        label.textContent = idx === 0 ? startDate : endDate

        label.style.cssText = `
          position: absolute;
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #2563EB;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
          z-index: 200;
        `
        bar.appendChild(label)
      })
    }, 100)

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

      const labels = containerRef.current.querySelectorAll('.vis-text.vis-minor')
      const start = parseLocalDate(callbacksRef.current.startDate)
      const gran = callbacksRef.current.granularity
      const startISOWeek = getISOWeekNumber(start)

      // Build a map of week numbers to their label elements for split detection
      const weekLabelsMap = new Map<number, Element[]>()
      if (gran === 'week') {
        labels.forEach((label) => {
          if (label.classList.contains('vis-measure')) return
          const m = label.className.match(/vis-week(\d+)/)
          if (m) {
            const wk = parseInt(m[1])
            const arr = weekLabelsMap.get(wk) ?? []
            arr.push(label)
            weekLabelsMap.set(wk, arr)
          }
        })
      }

      labels.forEach((label) => {
        if (label.classList.contains('vis-measure')) return
        const text = label.textContent?.trim() ?? ''
        // Skip already converted labels
        if (text.includes('DAY') || text.includes('WEEK') || text.includes('MONTH')) return
        // Skip already styled continuation labels
        if (label.classList.contains('tl-granularity-label-bg')) return

        let relativeLabel: string | null = null

        switch (gran) {
          case 'week': {
            const weekClassMatch = label.className.match(/vis-week(\d+)/)
            if (weekClassMatch) {
              const isoWeek = parseInt(weekClassMatch[1])
              let relWeek = isoWeek - startISOWeek + 1
              if (relWeek <= 0) relWeek += 52
              const siblings = weekLabelsMap.get(isoWeek) ?? []
              const isSplit = siblings.length > 1

              if (text === '') {
                // Continuation half — arrow shape, bg only, no text
                label.classList.add('tl-granularity-label-bg')
              } else if (isSplit) {
                // First half of split week — flat right edge (no arrow)
                relativeLabel = `WEEK${relWeek}`
                label.classList.add('tl-granularity-label-flat')
              } else {
                relativeLabel = `WEEK${relWeek}`
              }
            }
            break
          }
          case 'month': {
            if (!text) break
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const monthIndex = monthNames.findIndex(m => text.includes(m))
            if (monthIndex >= 0) {
              const date = new Date(start.getFullYear(), monthIndex, 1)
              relativeLabel = getRelativeTimeLabel(date, callbacksRef.current.startDate, gran)
            }
            break
          }
          case 'day': {
            if (!text) break
            const num = parseInt(text)
            if (!isNaN(num)) {
              const date = new Date(start.getFullYear(), start.getMonth(), num)
              relativeLabel = getRelativeTimeLabel(date, callbacksRef.current.startDate, gran)
            }
            break
          }
        }

        if (relativeLabel) {
          label.textContent = relativeLabel
          // Don't add arrow class if flat variant is already set (split week first-half)
          if (!label.classList.contains('tl-granularity-label-flat')) {
            label.classList.add('tl-granularity-label')
          }
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
