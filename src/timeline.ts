import firstAppearances from '../data/processed/first-appearances.json'

interface Appearance {
  date: string
  document_id: string
  document_title: string
  dimension: string
  org_label: string
}

interface TermEntry {
  term: string
  group: string
  appearances: Record<string, Appearance>
}

const data = firstAppearances as Record<string, TermEntry>

// Org colours for dots
const ORG_COLOURS: Record<string, string> = {
  anthropic: 'hsl(175, 40%, 42%)',
  openai: 'hsl(210, 45%, 50%)',
  'google-deepmind': 'hsl(40, 55%, 52%)',
  meta: 'hsl(220, 45%, 55%)',
  xai: 'hsl(0, 45%, 55%)',
}

// All commercial orgs for the "absent" display
const ALL_ORGS = ['anthropic', 'openai', 'google-deepmind', 'meta', 'xai']
const ORG_LABELS: Record<string, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  'google-deepmind': 'Google DeepMind',
  meta: 'Meta',
  xai: 'xAI',
}

// Date range for the timeline axis
const MIN_DATE = new Date('2017-01-01')
const MAX_DATE = new Date('2026-06-01')
const RANGE_MS = MAX_DATE.getTime() - MIN_DATE.getTime()

function dateToPercent(dateStr: string): number {
  const d = new Date(dateStr)
  return ((d.getTime() - MIN_DATE.getTime()) / RANGE_MS) * 100
}

export function renderTimeline(): string {
  // Group terms by their group
  const groups = new Map<string, TermEntry[]>()
  for (const entry of Object.values(data)) {
    const list = groups.get(entry.group) ?? []
    list.push(entry)
    groups.set(entry.group, list)
  }

  let html = ''

  // Axis labels
  const years = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]

  for (const [groupName, terms] of groups) {
    html += `<div class="tl-group">`
    html += `<h3 class="tl-group-label">${groupName}</h3>`

    for (const entry of terms) {
      const appearances = Object.entries(entry.appearances) as [string, Appearance][]

      html += `<div class="tl-row">`
      html += `<span class="tl-term">${entry.term}</span>`
      html += `<div class="tl-track">`

      // Year markers
      for (const y of years) {
        const pct = dateToPercent(`${y}-01-01`)
        html += `<span class="tl-year-mark" style="left:${pct}%">${y}</span>`
      }

      // Dots for appearances
      for (const [orgId, app] of appearances) {
        const pct = dateToPercent(app.date)
        const colour = ORG_COLOURS[orgId] ?? '#666'
        html += `<span class="tl-dot" style="left:${pct}%;background:${colour}" title="${app.org_label}: ${app.document_title} (${app.date})"></span>`
      }

      html += `</div>`

      // Right side: show which orgs have it
      const labels = appearances.map(([, a]) => `${a.org_label} (${a.date.slice(0, 7)})`).join(', ')
      html += `<span class="tl-present">${labels}</span>`

      html += `</div>`
    }

    html += `</div>`
  }

  // Org legend
  html += `<div class="tl-org-legend">`
  for (const orgId of ALL_ORGS) {
    const colour = ORG_COLOURS[orgId] ?? '#666'
    html += `<span class="tl-org-swatch" style="background:${colour}"></span>`
    html += `<span class="tl-org-name">${ORG_LABELS[orgId]}</span>`
  }
  html += `</div>`

  return html
}
