import type { DimensionCode, Organisation, Stance, EngagementCode } from './types'
import { DIMENSIONS, STANCE_LABELS, ENGAGEMENT_LEVEL_LABELS, isSubstantive, hasSubDimensions, getSubDimensions } from './constants'
import { getRepresentativeCoding, getCodingsForCell, getRepresentativeSubCoding, getSubCodingsForCell } from './data'

export interface OrgGroup {
  type: string
  label: string
  orgs: Organisation[]
}

export function renderGrid(orgGroups: OrgGroup[], dimensions: DimensionCode[], activeSubtypes?: Set<string>): string {
  const dims = DIMENSIONS.filter(d => dimensions.includes(d.code))
  const allOrgs = orgGroups.flatMap(g => g.orgs)
  const hasMultipleGroups = orgGroups.length > 1

  let html = '<table class="grid">'

  // Header row
  html += '<thead>'
  if (hasMultipleGroups) {
    html += '<tr><th class="grid-corner"></th>'
    for (const group of orgGroups) {
      html += `<th colspan="${group.orgs.length}" class="grid-type-header">${group.label}</th>`
    }
    html += '</tr>'
  }
  html += '<tr><th class="grid-corner"></th>'
  for (const org of allOrgs) {
    html += `<th class="grid-org-header" data-org="${org.id}" title="View all documents for ${org.name}">${org.name}</th>`
  }
  html += '</tr></thead>'

  // Body: one row per dimension
  html += '<tbody>'
  for (const dim of dims) {
    const hasSubs = hasSubDimensions(dim.code)
    html += '<tr>'
    html += `<th class="grid-dim-header${hasSubs ? ' grid-dim-header--expandable' : ''}">
      ${hasSubs ? `<button class="dim-expand-toggle" data-dim="${dim.code}" aria-label="Expand sub-indicators">&#9656;</button>` : ''}
      <span class="dim-code">${dim.code}</span>
      <span class="dim-label">${dim.label}</span>
      <span class="dim-desc">${dim.shortDesc}</span>
    </th>`

    for (const org of allOrgs) {
      const rep = getRepresentativeCoding(org.id, dim.code, activeSubtypes)
      const allCodings = getCodingsForCell(org.id, dim.code, activeSubtypes)
      const docCount = allCodings.length

      if (!rep) {
        html += `<td class="grid-cell grid-cell--empty">—</td>`
        continue
      }

      const { coding } = rep
      const substantive = isSubstantive(coding.engagement, coding.engagement_level)

      // Determine cell class and display text
      let cellClass: string
      let displayText: string

      if (dim.code === 'ONT' && coding.framing) {
        // ONT: show framing as pills
        const framings = coding.framing.split(', ').map(f => {
          const label = f.replace(/_/g, ' ')
          return `<span class="cell-framing-pill">${label}</span>`
        })
        displayText = framings.join('')
        cellClass = substantive ? '' : 'stance--silent'
      } else if (substantive && coding.stance) {
        // Level 4 with stance
        cellClass = `stance--${coding.stance}`
        displayText = STANCE_LABELS[coding.stance]
      } else if (coding.engagement_level !== null && coding.engagement_level !== undefined && coding.engagement_level < 4) {
        // Graduated engagement levels 0-3
        cellClass = `engagement--${coding.engagement_level}`
        const engCode = coding.engagement as EngagementCode
        displayText = ENGAGEMENT_LEVEL_LABELS[engCode] ?? coding.engagement.replace(/_/g, ' ')
      } else {
        // Fallback (ONT absent, etc.)
        cellClass = 'stance--silent'
        displayText = 'Not addressed'
      }

      const badge = docCount > 1 ? `<span class="doc-count" title="${docCount} documents coded">${docCount}</span>` : ''

      // Build hover tooltip
      const excerptPreview = coding.excerpt
        ? coding.excerpt.length > 120 ? coding.excerpt.slice(0, 120) + '...' : coding.excerpt
        : ''
      const tooltipParts: string[] = []

      if (coding.engagement_level !== null && coding.engagement_level !== undefined) {
        const engCode = coding.engagement as EngagementCode
        const label = ENGAGEMENT_LEVEL_LABELS[engCode] ?? coding.engagement
        tooltipParts.push(`Level ${coding.engagement_level}: ${label}`)
      } else {
        tooltipParts.push(coding.engagement.replace('_', ' '))
      }
      if (coding.stance) tooltipParts.push(coding.stance)
      if (excerptPreview) tooltipParts.push(`\n"${excerptPreview}"`)
      if (docCount > 1) tooltipParts.push(`\n${docCount} documents — click for detail`)
      else tooltipParts.push('\nClick for detail')

      html += `<td class="grid-cell ${cellClass}"
                   data-org="${org.id}"
                   data-dim="${dim.code}"
                   title="${escapeAttr(tooltipParts.join(' / '))}">
        <span class="cell-text">${displayText}</span>
        ${badge}
      </td>`
    }

    html += '</tr>'

    // Render sub-indicator rows if this dimension has them
    if (hasSubs) {
      for (const sub of getSubDimensions(dim.code)) {
        html += `<tr class="grid-sub-row" data-parent-dim="${dim.code}">`
        html += `<th class="grid-dim-header grid-dim-header--sub">
          <span class="dim-code">${sub.code}</span>
          <span class="dim-label">${sub.label}</span>
          <span class="dim-desc">${sub.shortDesc}</span>
        </th>`

        for (const org of allOrgs) {
          const rep = getRepresentativeSubCoding(org.id, sub.code, activeSubtypes)
          const allCodings = getSubCodingsForCell(org.id, sub.code, activeSubtypes)
          const docCount = allCodings.length

          if (!rep) {
            html += `<td class="grid-cell grid-cell--empty">—</td>`
            continue
          }

          const { coding } = rep
          const substantive = isSubstantive(coding.engagement, coding.engagement_level)

          let cellClass: string
          let displayText: string

          if (substantive && coding.stance) {
            cellClass = `stance--${coding.stance}`
            displayText = STANCE_LABELS[coding.stance]
          } else if (coding.engagement_level !== null && coding.engagement_level !== undefined && coding.engagement_level < 4) {
            cellClass = `engagement--${coding.engagement_level}`
            const engCode = coding.engagement as EngagementCode
            displayText = ENGAGEMENT_LEVEL_LABELS[engCode] ?? coding.engagement.replace(/_/g, ' ')
          } else {
            cellClass = 'stance--silent'
            displayText = 'Not addressed'
          }

          const badge = docCount > 1 ? `<span class="doc-count" title="${docCount} documents coded">${docCount}</span>` : ''

          const tooltipParts: string[] = []
          if (coding.engagement_level !== null && coding.engagement_level !== undefined) {
            const engCode = coding.engagement as EngagementCode
            const label = ENGAGEMENT_LEVEL_LABELS[engCode] ?? coding.engagement
            tooltipParts.push(`Level ${coding.engagement_level}: ${label}`)
          }
          if (coding.stance) tooltipParts.push(coding.stance)
          if (docCount > 1) tooltipParts.push(`\n${docCount} documents`)
          else tooltipParts.push('\nClick for detail')

          html += `<td class="grid-cell ${cellClass}"
                       data-org="${org.id}"
                       data-dim="${dim.code}"
                       data-sub-dim="${sub.code}"
                       title="${escapeAttr(tooltipParts.join(' / '))}">
            <span class="cell-text">${displayText}</span>
            ${badge}
          </td>`
        }

        html += '</tr>'
      }
    }
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

  let html = '<div class="legend">'

  // Stances section
  html += '<span class="legend-title">Stances (Level 4 — Substantive)</span><div class="legend-items">'
  for (const s of stances) {
    html += `<div class="legend-item">
      <span class="legend-swatch stance--${s.key}"></span>
      <span class="legend-label">${STANCE_LABELS[s.key]}</span>
      <span class="legend-desc">${s.desc}</span>
    </div>`
  }
  html += '</div>'

  // Engagement levels section
  const levels: { level: number; label: string; desc: string }[] = [
    { level: 3, label: 'Adjacent', desc: 'Concept named without substance' },
    { level: 2, label: 'Proximate', desc: 'Neighbouring properties evaluated' },
    { level: 1, label: 'Omission', desc: 'Detailed framework, dimension absent' },
    { level: 0, label: 'Excluded', desc: 'Document scope precludes dimension' },
  ]

  html += '<div class="legend-section"><span class="legend-title">Engagement Levels (0–3)</span><div class="legend-items">'
  for (const l of levels) {
    html += `<div class="legend-item">
      <span class="legend-swatch engagement--${l.level}"></span>
      <span class="legend-label">${l.label} (${l.level})</span>
      <span class="legend-desc">${l.desc}</span>
    </div>`
  }
  html += '</div></div>'

  html += '</div>'
  return html
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
