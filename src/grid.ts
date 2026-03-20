import type { DimensionCode, Organisation, Stance } from './types'
import { DIMENSIONS, STANCE_LABELS, isSubstantive } from './constants'
import { getRepresentativeCoding, getCodingsForCell } from './data'

export function renderGrid(orgs: Organisation[], dimensions: DimensionCode[]): string {
  const dims = DIMENSIONS.filter(d => dimensions.includes(d.code))

  let html = '<table class="grid">'

  // Header row
  html += '<thead><tr><th class="grid-corner"></th>'
  for (const org of orgs) {
    html += `<th class="grid-org-header">${org.name}</th>`
  }
  html += '</tr></thead>'

  // Body: one row per dimension
  html += '<tbody>'
  for (const dim of dims) {
    html += '<tr>'
    html += `<th class="grid-dim-header">
      <span class="dim-code">${dim.code}</span>
      <span class="dim-label">${dim.label}</span>
      <span class="dim-desc">${dim.shortDesc}</span>
    </th>`

    for (const org of orgs) {
      const rep = getRepresentativeCoding(org.id, dim.code)
      const allCodings = getCodingsForCell(org.id, dim.code)
      const docCount = allCodings.length

      if (!rep) {
        html += `<td class="grid-cell grid-cell--empty">—</td>`
        continue
      }

      const { coding } = rep
      const substantive = isSubstantive(coding.engagement)
      const stanceClass = substantive && coding.stance ? `stance--${coding.stance}` : 'stance--silent'
      const stanceText = substantive && coding.stance ? STANCE_LABELS[coding.stance] : 'Not addressed'

      // For ONT, show framing as formatted pills
      let displayText: string
      if (dim.code === 'ONT' && coding.framing) {
        const framings = coding.framing.split(', ').map(f => {
          const label = f.replace(/_/g, ' ')
          return `<span class="cell-framing-pill">${label}</span>`
        })
        displayText = framings.join('')
      } else if (dim.code === 'CWG' && substantive && coding.framing) {
        displayText = `<span class="cell-framing-pill">${coding.framing}</span>`
      } else {
        displayText = stanceText
      }

      const badge = docCount > 1 ? `<span class="doc-count" title="${docCount} documents coded">${docCount}</span>` : ''

      // Build hover tooltip with excerpt preview
      const excerptPreview = coding.excerpt
        ? coding.excerpt.length > 120 ? coding.excerpt.slice(0, 120) + '...' : coding.excerpt
        : ''
      const tooltipParts: string[] = []
      if (coding.engagement) tooltipParts.push(coding.engagement.replace('_', ' '))
      if (coding.stance) tooltipParts.push(coding.stance)
      if (excerptPreview) tooltipParts.push(`\n"${excerptPreview}"`)
      if (docCount > 1) tooltipParts.push(`\n${docCount} documents — click for detail`)
      else tooltipParts.push('\nClick for detail')

      html += `<td class="grid-cell ${stanceClass}"
                   data-org="${org.id}"
                   data-dim="${dim.code}"
                   title="${escapeAttr(tooltipParts.join(' / '))}">
        <span class="cell-text">${displayText}</span>
        ${badge}
      </td>`
    }

    html += '</tr>'
  }
  html += '</tbody></table>'

  return html
}

export function renderLegend(): string {
  const stances: { key: Stance; desc: string }[] = [
    { key: 'investigative', desc: 'Actively investigating' },
    { key: 'precautionary', desc: 'Taking precautionary action' },
    { key: 'cautious', desc: 'Acknowledges but no action' },
    { key: 'descriptive', desc: 'Reports without normative stance' },
    { key: 'affirms', desc: 'Positively affirms' },
    { key: 'denies', desc: 'Explicitly denies' },
    { key: 'ambiguous', desc: 'Unclear or contradictory' },
  ]

  let html = '<div class="legend"><span class="legend-title">Stances</span><div class="legend-items">'
  for (const s of stances) {
    html += `<div class="legend-item">
      <span class="legend-swatch stance--${s.key}"></span>
      <span class="legend-label">${STANCE_LABELS[s.key]}</span>
      <span class="legend-desc">${s.desc}</span>
    </div>`
  }
  html += `<div class="legend-item">
    <span class="legend-swatch stance--silent"></span>
    <span class="legend-label">Not addressed</span>
    <span class="legend-desc">Dimension not discussed</span>
  </div>`
  html += '</div></div>'
  return html
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
