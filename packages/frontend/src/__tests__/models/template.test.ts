import { describe, it, expect } from 'vitest'
import {
  BUILTIN_TEMPLATES,
  getTemplateById,
  getDefaultTemplate,
  templateToCSSVars,
  type Template,
  type TemplateStyles,
} from '../../models/template'

const REQUIRED_STYLE_FIELDS: (keyof TemplateStyles)[] = [
  'backgroundColor',
  'textColor',
  'axisColor',
  'gridColor',
  'barRadius',
  'fontFamily',
  'fontSize',
]

describe('BUILTIN_TEMPLATES', () => {
  it('has exactly 3 built-in templates', () => {
    expect(BUILTIN_TEMPLATES).toHaveLength(3)
  })

  it('includes Clean Default, Corporate Blue, and Minimal Dark', () => {
    const names = BUILTIN_TEMPLATES.map((t) => t.name)
    expect(names).toContain('Clean Default')
    expect(names).toContain('Corporate Blue')
    expect(names).toContain('Minimal Dark')
  })

  it.each(BUILTIN_TEMPLATES.map((t) => [t.name, t]))(
    '%s conforms to schema',
    (_name: string, template: Template) => {
      expect(template.id).toBeTruthy()
      expect(template.name).toBeTruthy()
      expect(template.styles).toBeDefined()
      expect(template.palette).toBeDefined()
    }
  )

  it.each(BUILTIN_TEMPLATES.map((t) => [t.name, t]))(
    '%s has all required style fields',
    (_name: string, template: Template) => {
      for (const field of REQUIRED_STYLE_FIELDS) {
        expect(template.styles[field]).toBeDefined()
      }
    }
  )

  it.each(BUILTIN_TEMPLATES.map((t) => [t.name, t]))(
    '%s has at least 5 palette colors',
    (_name: string, template: Template) => {
      expect(template.palette.length).toBeGreaterThanOrEqual(5)
    }
  )

  it.each(BUILTIN_TEMPLATES.map((t) => [t.name, t]))(
    '%s palette contains valid hex colors',
    (_name: string, template: Template) => {
      for (const color of template.palette) {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      }
    }
  )
})

describe('getTemplateById', () => {
  it('returns the correct template', () => {
    const result = getTemplateById('corporate-blue')
    expect(result?.name).toBe('Corporate Blue')
  })

  it('returns undefined for unknown id', () => {
    expect(getTemplateById('nonexistent')).toBeUndefined()
  })
})

describe('getDefaultTemplate', () => {
  it('returns Clean Default', () => {
    const def = getDefaultTemplate()
    expect(def.id).toBe('clean-default')
  })
})

describe('templateToCSSVars', () => {
  it('maps all style fields to CSS variables', () => {
    const template = getDefaultTemplate()
    const vars = templateToCSSVars(template)

    expect(vars['--tl-bg']).toBe(template.styles.backgroundColor)
    expect(vars['--tl-text']).toBe(template.styles.textColor)
    expect(vars['--tl-axis']).toBe(template.styles.axisColor)
    expect(vars['--tl-grid']).toBe(template.styles.gridColor)
    expect(vars['--tl-bar-radius']).toBe(`${template.styles.barRadius}px`)
    expect(vars['--tl-font-family']).toBe(template.styles.fontFamily)
    expect(vars['--tl-font-size']).toBe(`${template.styles.fontSize}px`)
  })

  it('produces different values for different templates', () => {
    const clean = templateToCSSVars(BUILTIN_TEMPLATES[0])
    const dark = templateToCSSVars(BUILTIN_TEMPLATES[2])

    expect(clean['--tl-bg']).not.toBe(dark['--tl-bg'])
    expect(clean['--tl-text']).not.toBe(dark['--tl-text'])
  })
})
