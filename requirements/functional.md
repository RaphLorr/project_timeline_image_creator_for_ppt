# Functional Requirements

## FR-1: Project Setup

User creates a new timeline project by filling a simple form:

- **Project name** - text input
- **Granularity** - select: day / week / month
- **Start date** - date picker
- **End date** - date picker

- **Template** - select from available templates (default provided)

On submit, a blank timeline grid is rendered based on the date range, granularity, and selected template's styles.

## FR-2: Interactive Timeline Canvas

The core experience. A horizontal Gantt-like grid where users build the timeline with mouse interactions only.

### Adding Items
- Click an empty cell on the grid to create a new timeline item
- A minimal inline form appears: enter item name, pick a color/category
- Item appears as a colored bar starting at that cell

### Resizing (Duration)
- Drag the **right edge** of an item bar to extend or shorten its duration
- Snap-to-grid based on granularity (day/week/month columns)
- Visual feedback: ghost bar shows target size while dragging

### Moving (Rescheduling)
- Drag an item bar **from its center** to move it left/right on the timeline
- Snap-to-grid on drop
- Visual feedback: ghost bar shows target position while dragging

### Editing
- Double-click an item bar to edit its name, color, or category
- Press Delete/Backspace while an item is selected to remove it

### Rows
- Each item occupies a row (swim lane)
- Drag items **vertically** to reorder rows
- New rows are auto-created when items are added

## FR-3: Templates

A template defines the complete visual style of a timeline. All rendering goes through the active template.

### What a Template Controls
- **Color palette** — background, bar colors, text colors, accent colors
- **Typography** — font family, sizes, weights for headers/labels/axis
- **Bar style** — border radius, height, padding, shadow, opacity
- **Grid style** — gridline color, spacing, header row style
- **Layout** — row height, row gap, axis position, overall padding
- **Today marker** — color, style (solid/dashed), width

### Template Structure (data model)
```
Template {
  id: string
  name: string               // e.g. "Corporate Blue", "Startup Fresh"
  client: string             // which client this was made for (optional)
  thumbnail: string          // preview image path
  styles: {
    background: string
    fontFamily: string
    fontSize: { header, label, axis }
    colors: {
      palette: string[]      // ordered category color palette
      text: string
      gridLine: string
      todayMarker: string
      axisText: string
    }
    bar: { borderRadius, height, padding, shadow, opacity }
    grid: { rowHeight, rowGap, headerHeight }
    layout: { padding, axisPosition }
  }
  source: "builtin" | "manual" | "ai-generated"
}
```

### Built-in Templates (Phase 1)
- Ship 2-3 default templates (e.g. "Clean Default", "Corporate", "Minimal Dark")
- User selects template at project setup or switches anytime
- Template styles are applied to all rendering — canvas, export, everything

### Manual Template Creation (Phase 1)
- User can duplicate an existing template and tweak style values
- Simple form-based editor for template properties

### AI Template Generation from Image (Phase 2 — Later)
- User uploads a screenshot/image of an example timeline style
- Image is sent to **Qwen-VL-Max** (multi-modal model)
- Model analyzes the visual style and extracts: color palette, font style, bar shapes, layout proportions, overall aesthetic
- Model outputs a `Template.styles` JSON matching our schema
- Generated template is saved and immediately usable
- User can fine-tune the generated template afterward

## FR-4: Visual Timeline Rendering

The timeline is rendered as styled HTML/CSS, driven by the active template:

- Horizontal layout with time axis on top
- Color-coded bars per item/category (colors from template palette)
- Item labels displayed inside or beside bars (fonts from template)
- Today marker (vertical line) if date range includes today
- Clean, presentation-ready styling (no UI chrome in the output)
- All visual properties come from the template — switching template re-renders everything

## FR-5: Export

Two export options:

### Image Export
- Export the timeline as a **PNG** image
- High resolution (2x for retina / PPT clarity)
- Transparent or white background option

### HTML Export
- Export the raw HTML/CSS of the rendered timeline
- Self-contained (inline styles, no external dependencies)
- Can be opened in a browser and re-captured later

## FR-6: AI-Powered Categorization & Color Suggestion (Qwen-plus)

When a user creates or edits a timeline item, the LLM assists automatically:

### Auto-Categorization
- On item creation, the task name is sent to Qwen-plus
- LLM infers a category (e.g. "Design", "Development", "Testing", "Deployment", "Meeting", "Research")
- Category is pre-filled but user can override it
- LLM uses the **full project context** (project name + existing items) for better accuracy
- Categories are learned from the project — if prior items established "QA" instead of "Testing", the LLM follows that pattern

### Color Suggestion
- Each category gets a suggested color from the LLM
- Colors are chosen for:
  - Visual distinction between categories
  - Presentation readability (good contrast, not too bright)
  - Consistency — same category always gets the same color
- User can override any color; overrides are remembered for future suggestions
- LLM receives the **active template's color palette** to stay on-brand
- If template has a fixed palette, AI picks from it; if open palette, AI suggests new colors that harmonize

### Interaction Flow
1. User clicks cell → types task name (e.g. "API endpoint design")
2. App sends task name + project context to Qwen-plus
3. LLM responds with `{ category: "Design", color: "#4A90D9" }`
4. Category and color are auto-applied to the item
5. User sees the result instantly and can adjust if needed

### API Integration
- Backend proxy to Qwen-plus API (key stays server-side)
- Non-blocking: item is created immediately, AI suggestion arrives async and updates the item
- Graceful fallback: if LLM is unavailable, user picks category/color manually

## FR-7: Live Preview

- The rendered timeline updates in real-time as user interacts
- Split view or same-canvas: edit and preview are the same thing
- What you see is what you export
