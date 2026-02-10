# Technical Requirements

## TR-1: Tech Stack

- **Language:** TypeScript (frontend + backend)
- **Frontend:** React 18 + Vite
- **Timeline engine:** vis-timeline (MIT license, built-in drag-create/resize/move)
- **Styling:** CSS Modules or Tailwind CSS (template styles applied via CSS variables)
- **HTML-to-image:** html2canvas (captures DOM-rendered timeline as PNG)
- **Backend:** Node.js + Express (lightweight API proxy for AI calls)
- **Package manager:** pnpm

## TR-2: AI Integration

- LLM: **Qwen-plus** (via Alibaba Cloud / DashScope API)
- API call is proxied through the backend (API key never exposed to browser)
- Async / non-blocking — UI never waits on LLM response
- Prompt includes: task name, project name, existing categories, current color palette
- Response format: JSON `{ category: string, color: string }`
- Fallback: manual selection if LLM is down or slow (>3s timeout)

### Phase 2: Multi-modal Template Generation
- Model: **Qwen-VL-Max** (via DashScope API)
- Input: user-uploaded image (PNG/JPG of example timeline)
- Output: `Template.styles` JSON matching the app's template schema
- Same backend proxy pattern (API key server-side)
- Image is sent as base64 in the API request

## TR-3: Platform

- Web app (browser-based)
- Monorepo structure: `packages/frontend` + `packages/backend`

## TR-4: Performance

- Max timeline items supported: 100+ (vis-timeline handles thousands)
- Image generation time target: < 2s for PNG export

## TR-5: Compatibility

- Browser support: Chrome (primary)
