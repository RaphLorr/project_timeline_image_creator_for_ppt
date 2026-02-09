export interface TemplateStyles {
  readonly backgroundColor: string
  readonly textColor: string
  readonly axisColor: string
  readonly gridColor: string
  readonly barRadius: number
  readonly fontFamily: string
  readonly fontSize: number
}

export interface Template {
  readonly id: string
  readonly name: string
  readonly styles: TemplateStyles
  readonly palette: readonly string[]
}

export const BUILTIN_TEMPLATES: readonly Template[] = [
  {
    id: 'clean-default',
    name: 'Clean Default',
    styles: {
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      axisColor: '#6B7280',
      gridColor: '#E5E7EB',
      barRadius: 4,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 13,
    },
    palette: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'],
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    styles: {
      backgroundColor: '#F0F4F8',
      textColor: '#1E3A5F',
      axisColor: '#4A6FA5',
      gridColor: '#CBD5E1',
      barRadius: 2,
      fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: 12,
    },
    palette: ['#1E3A5F', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#1D4ED8', '#1E40AF'],
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    styles: {
      backgroundColor: '#1A1A2E',
      textColor: '#E0E0E0',
      axisColor: '#888888',
      gridColor: '#2D2D44',
      barRadius: 6,
      fontFamily: '"Inter", "SF Pro Display", -apple-system, sans-serif',
      fontSize: 13,
    },
    palette: ['#00D9FF', '#FF6B6B', '#FFE66D', '#4ECB71', '#A78BFA', '#FB923C', '#F472B6'],
  },
]

export function getTemplateById(id: string): Template | undefined {
  return BUILTIN_TEMPLATES.find((t) => t.id === id)
}

export function getDefaultTemplate(): Template {
  return BUILTIN_TEMPLATES[0]
}

export function templateToCSSVars(template: Template): Record<string, string> {
  const { styles } = template
  return {
    '--tl-bg': styles.backgroundColor,
    '--tl-text': styles.textColor,
    '--tl-axis': styles.axisColor,
    '--tl-grid': styles.gridColor,
    '--tl-bar-radius': `${styles.barRadius}px`,
    '--tl-font-family': styles.fontFamily,
    '--tl-font-size': `${styles.fontSize}px`,
  }
}
