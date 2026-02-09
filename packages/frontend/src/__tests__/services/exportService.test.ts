import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toPng: vi.fn(),
}))

import { toPng } from 'html-to-image'
import { exportToPng, exportToHtml } from '../../services/exportService'

describe('exportToPng', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls toPng with pixelRatio 2', async () => {
    const mockElement = document.createElement('div')
    const mockDataUrl = 'data:image/png;base64,test'
    vi.mocked(toPng).mockResolvedValue(mockDataUrl)

    // Mock link click
    const mockClick = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValueOnce({
      click: mockClick,
      download: '',
      href: '',
    } as unknown as HTMLAnchorElement)

    await exportToPng(mockElement, 'test-export')

    expect(toPng).toHaveBeenCalledWith(mockElement, expect.objectContaining({
      pixelRatio: 2,
    }))
  })

  it('creates a download link with .png extension', async () => {
    const mockElement = document.createElement('div')
    vi.mocked(toPng).mockResolvedValue('data:image/png;base64,test')

    const linkProps: Record<string, string> = {}
    const mockClick = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValueOnce({
      click: mockClick,
      set download(v: string) { linkProps['download'] = v },
      get download() { return linkProps['download'] ?? '' },
      set href(v: string) { linkProps['href'] = v },
      get href() { return linkProps['href'] ?? '' },
    } as unknown as HTMLAnchorElement)

    await exportToPng(mockElement, 'my-project')

    expect(linkProps['download']).toBe('my-project.png')
    expect(mockClick).toHaveBeenCalled()
  })
})

describe('exportToHtml', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    URL.createObjectURL = vi.fn().mockReturnValue('blob:test')
    URL.revokeObjectURL = vi.fn()
  })

  it('produces an HTML document', () => {
    const mockElement = document.createElement('div')
    mockElement.innerHTML = '<span>Timeline</span>'

    let blobContent = ''

    // Capture the blob content
    const OriginalBlob = globalThis.Blob
    globalThis.Blob = class extends OriginalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        if (parts) {
          blobContent = parts.join('')
        }
      }
    } as typeof Blob

    const linkProps: Record<string, string> = {}
    const mockClick = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValueOnce({
      click: mockClick,
      set download(v: string) { linkProps['download'] = v },
      get download() { return linkProps['download'] ?? '' },
      set href(v: string) { linkProps['href'] = v },
      get href() { return linkProps['href'] ?? '' },
    } as unknown as HTMLAnchorElement)

    exportToHtml(mockElement, 'my-project')

    expect(linkProps['download']).toBe('my-project.html')
    expect(blobContent).toContain('<!DOCTYPE html>')
    expect(blobContent).toContain('<span>Timeline</span>')
    expect(mockClick).toHaveBeenCalled()
  })
})
