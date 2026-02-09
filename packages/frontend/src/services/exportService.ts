import { toPng } from 'html-to-image'

export async function exportToPng(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: getComputedStyle(element).backgroundColor || '#ffffff',
  })

  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = dataUrl
  link.click()
}

export function exportToHtml(
  element: HTMLElement,
  filename: string
): void {
  const clone = element.cloneNode(true) as HTMLElement
  const computedStyles = getComputedStyle(element)

  // Inline key CSS variables
  const cssVarNames = [
    '--tl-bg', '--tl-text', '--tl-axis', '--tl-grid',
    '--tl-bar-radius', '--tl-font-family', '--tl-font-size',
  ]
  for (const varName of cssVarNames) {
    const value = computedStyles.getPropertyValue(varName)
    if (value) {
      clone.style.setProperty(varName, value)
    }
  }

  // Collect all stylesheets as inline styles
  const styleSheets = Array.from(document.styleSheets)
  let cssText = ''
  for (const sheet of styleSheets) {
    try {
      const rules = Array.from(sheet.cssRules)
      for (const rule of rules) {
        cssText += rule.cssText + '\n'
      }
    } catch {
      // Cross-origin stylesheets can't be read — skip
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>${cssText}</style>
</head>
<body style="margin:0;padding:20px;background:#f9fafb;">
  ${clone.outerHTML}
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `${filename}.html`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}
