import type { DimensionCode } from './types'
import { DIMENSIONS, STANCE_LABELS, isSubstantive } from './constants'
import { getCodingsForCell, orgDocuments } from './data'

export function renderCellDetail(orgId: string, orgName: string, dimension: DimensionCode): string {
  const dim = DIMENSIONS.find(d => d.code === dimension)
  const codings = getCodingsForCell(orgId, dimension)

  let html = `
    <div class="detail-header">
      <h2>${orgName}</h2>
      <h3>${dim?.code}: ${dim?.label}</h3>
      <p class="detail-desc">${dim?.shortDesc}</p>
    </div>
    <div class="detail-body">
  `

  if (codings.length === 0) {
    html += '<p class="detail-empty">No data available.</p>'
  } else {
    for (const { doc, coding } of codings) {
      const substantive = isSubstantive(coding.engagement)
      const stanceClass = substantive && coding.stance ? `stance--${coding.stance}` : 'stance--silent'

      html += `<div class="detail-coding">
        <div class="detail-doc-title">
          <a href="${doc.url}" target="_blank" rel="noopener">${doc.title}</a>
          <span class="tier-badge">Tier ${doc.tier}</span>
          <span class="date-badge">${doc.publication_date}</span>
        </div>
        <div class="detail-tags">
          <span class="tag tag--engagement">${coding.engagement.replace('_', ' ')}</span>
          ${coding.stance ? `<span class="tag ${stanceClass}">${STANCE_LABELS[coding.stance]}</span>` : ''}
          ${coding.framing ? `<span class="tag tag--framing">${coding.framing}</span>` : ''}
        </div>`

      if (coding.excerpt) {
        html += `<blockquote class="detail-excerpt">${coding.excerpt}</blockquote>`
      }

      if (coding.notes) {
        html += `<p class="detail-notes">${coding.notes}</p>`
      }

      html += '</div>'
    }
  }

  html += '</div>'
  return html
}

export function renderOrgDocumentList(orgId: string, orgName: string): string {
  const docs = orgDocuments.get(orgId) ?? []

  let html = `
    <div class="detail-header">
      <h2>${orgName}</h2>
      <h3>${docs.length} document${docs.length !== 1 ? 's' : ''} coded</h3>
    </div>
    <div class="detail-body">
  `

  if (docs.length === 0) {
    html += '<p class="detail-empty">No documents coded yet.</p>'
  } else {
    // Sort by date descending
    const sorted = [...docs].sort((a, b) => b.publication_date.localeCompare(a.publication_date))
    for (const doc of sorted) {
      const addressedCount = doc.codings.filter(c => isSubstantive(c.engagement)).length
      const totalDims = doc.codings.length

      html += `<div class="detail-doc-card" data-doc-id="${doc.id}" data-org-name="${escapeAttr(orgName)}">
        <div class="detail-doc-title">
          <span class="doc-card-title">${doc.title}</span>
        </div>
        <div class="detail-meta">
          <span class="tier-badge">Tier ${doc.tier}</span>
          <span class="date-badge">${doc.publication_date}</span>
          <span class="tag">${doc.subtype.replace(/_/g, ' ')}</span>
          <span class="tag tag--engagement">${addressedCount}/${totalDims} addressed</span>
        </div>
      </div>`
    }
  }

  html += '</div>'
  return html
}

export function renderDocumentDetail(docId: string, orgName: string): string {
  for (const [, docs] of orgDocuments) {
    const doc = docs.find(d => d.id === docId)
    if (!doc) continue

    let html = `
      <div class="detail-header">
        <h2>${orgName}</h2>
        <h3><a href="${doc.url}" target="_blank" rel="noopener">${doc.title}</a></h3>
        <div class="detail-meta">
          <span class="tier-badge">Tier ${doc.tier}</span>
          <span class="date-badge">${doc.publication_date}</span>
          <span class="tag">${doc.subtype.replace(/_/g, ' ')}</span>
        </div>
        ${doc.notes ? `<p class="detail-doc-notes">${doc.notes}</p>` : ''}
      </div>
      <div class="detail-body">
    `

    for (const coding of doc.codings) {
      const dim = DIMENSIONS.find(d => d.code === coding.dimension)
      const substantive = isSubstantive(coding.engagement)
      const stanceClass = substantive && coding.stance ? `stance--${coding.stance}` : 'stance--silent'

      html += `<div class="detail-coding">
        <div class="detail-dim-header">
          <span class="dim-code">${coding.dimension}</span>
          <span class="dim-label">${dim?.label}</span>
        </div>
        <div class="detail-tags">
          <span class="tag tag--engagement">${coding.engagement.replace('_', ' ')}</span>
          ${coding.stance ? `<span class="tag ${stanceClass}">${STANCE_LABELS[coding.stance]}</span>` : ''}
          ${coding.framing ? `<span class="tag tag--framing">${coding.framing}</span>` : ''}
        </div>`

      if (coding.excerpt) {
        html += `<blockquote class="detail-excerpt">${coding.excerpt}</blockquote>`
      }

      if (coding.notes) {
        html += `<p class="detail-notes">${coding.notes}</p>`
      }

      html += '</div>'
    }

    html += '</div>'
    return html
  }

  return '<p>Document not found.</p>'
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
