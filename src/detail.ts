import type { DimensionCode, SubDimensionCode, EngagementCode } from './types'
import { DIMENSIONS, SUB_DIMENSIONS, STANCE_LABELS, ENGAGEMENT_LEVEL_LABELS, isSubstantive, hasSubDimensions, getSubDimensions } from './constants'
import { getCodingsForCell, getSubCodingsForCell, orgDocuments } from './data'

export function renderCellDetail(orgId: string, orgName: string, dimension: DimensionCode, subDimension?: string | null): string {
  // If viewing a specific sub-dimension, show only those codings
  if (subDimension) {
    const subMeta = SUB_DIMENSIONS.find(s => s.code === subDimension)
    const codings = getSubCodingsForCell(orgId, subDimension as SubDimensionCode)

    let html = `
      <div class="detail-header">
        <h2>${orgName}</h2>
        <h3>${subMeta?.code}: ${subMeta?.label}</h3>
        <p class="detail-desc">${subMeta?.shortDesc}</p>
      </div>
      <div class="detail-body">
    `

    if (codings.length === 0) {
      html += '<p class="detail-empty">No data available.</p>'
    } else {
      for (const { doc, coding } of codings) {
        html += renderCodingBlock(doc, coding)
      }
    }

    html += '</div>'
    return html
  }

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
      html += renderCodingBlock(doc, coding)
    }
  }

  // Show sub-indicator codings if this dimension has them
  if (hasSubDimensions(dimension)) {
    for (const sub of getSubDimensions(dimension)) {
      const subCodings = getSubCodingsForCell(orgId, sub.code)
      if (subCodings.length === 0) continue

      html += `<div class="detail-sub-section">
        <h4 class="detail-sub-header">${sub.code}: ${sub.label}</h4>
        <p class="detail-desc">${sub.shortDesc}</p>`

      for (const { doc, coding } of subCodings) {
        html += renderCodingBlock(doc, coding)
      }

      html += '</div>'
    }
  }

  html += '</div>'
  return html
}

function renderCodingBlock(doc: { title: string; url: string; tier: number; publication_date: string }, coding: { engagement: string; engagement_level: number | null; stance: string | null; framing: string | null; excerpt: string; notes: string }): string {
  const substantive = isSubstantive(coding.engagement, coding.engagement_level)
  const stanceClass = substantive && coding.stance ? `stance--${coding.stance}` : 'stance--silent'

  let engagementTag: string
  if (coding.engagement_level !== null && coding.engagement_level !== undefined) {
    const engCode = coding.engagement as EngagementCode
    const label = ENGAGEMENT_LEVEL_LABELS[engCode] ?? coding.engagement.replace(/_/g, ' ')
    engagementTag = `<span class="tag tag--engagement-${coding.engagement_level}">${label} (${coding.engagement_level})</span>`
  } else {
    engagementTag = `<span class="tag tag--engagement">${coding.engagement.replace('_', ' ')}</span>`
  }

  let html = `<div class="detail-coding">
    <div class="detail-doc-title">
      <a href="${doc.url}" target="_blank" rel="noopener">${doc.title}</a>
      <span class="tier-badge">Tier ${doc.tier}</span>
      <span class="date-badge">${doc.publication_date}</span>
    </div>
    <div class="detail-tags">
      ${engagementTag}
      ${coding.stance ? `<span class="tag ${stanceClass}">${STANCE_LABELS[coding.stance as keyof typeof STANCE_LABELS]}</span>` : ''}
      ${coding.framing ? `<span class="tag tag--framing">${coding.framing}</span>` : ''}
    </div>`

  if (coding.excerpt) {
    html += `<blockquote class="detail-excerpt">${coding.excerpt}</blockquote>`
  }

  if (coding.notes) {
    html += `<p class="detail-notes">${coding.notes}</p>`
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
      const substantiveCount = doc.codings.filter(c => isSubstantive(c.engagement, c.engagement_level)).length
      const totalDims = doc.codings.length

      html += `<div class="detail-doc-card" data-doc-id="${doc.id}" data-org-name="${escapeAttr(orgName)}">
        <div class="detail-doc-title">
          <span class="doc-card-title">${doc.title}</span>
        </div>
        <div class="detail-meta">
          <span class="tier-badge">Tier ${doc.tier}</span>
          <span class="date-badge">${doc.publication_date}</span>
          <span class="tag">${doc.subtype.replace(/_/g, ' ')}</span>
          <span class="tag tag--engagement">${substantiveCount}/${totalDims} substantive</span>
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

    // Render parent codings first, then sub-indicator codings grouped under parent
    const parentCodings = doc.codings.filter(c => !c.sub_dimension)
    const subCodings = doc.codings.filter(c => c.sub_dimension)

    for (const coding of parentCodings) {
      const dim = DIMENSIONS.find(d => d.code === coding.dimension)

      html += `<div class="detail-coding">
        <div class="detail-dim-header">
          <span class="dim-code">${coding.dimension}</span>
          <span class="dim-label">${dim?.label}</span>
        </div>`
      html += renderCodingTags(coding)
      html += '</div>'

      // Render any sub-indicator codings for this dimension
      const dimSubs = subCodings.filter(c => c.dimension === coding.dimension)
      for (const subCoding of dimSubs) {
        const subMeta = SUB_DIMENSIONS.find(s => s.code === subCoding.sub_dimension)

        html += `<div class="detail-coding detail-coding--sub">
          <div class="detail-dim-header">
            <span class="dim-code">${subCoding.sub_dimension}</span>
            <span class="dim-label">${subMeta?.label}</span>
          </div>`
        html += renderCodingTags(subCoding)
        html += '</div>'
      }
    }

    html += '</div>'
    return html
  }

  return '<p>Document not found.</p>'
}

function renderCodingTags(coding: { engagement: string; engagement_level: number | null; stance: string | null; framing: string | null; excerpt: string; notes: string }): string {
  const substantive = isSubstantive(coding.engagement, coding.engagement_level)
  const stanceClass = substantive && coding.stance ? `stance--${coding.stance}` : 'stance--silent'

  let engagementTag: string
  if (coding.engagement_level !== null && coding.engagement_level !== undefined) {
    const engCode = coding.engagement as EngagementCode
    const label = ENGAGEMENT_LEVEL_LABELS[engCode] ?? coding.engagement.replace(/_/g, ' ')
    engagementTag = `<span class="tag tag--engagement-${coding.engagement_level}">${label} (${coding.engagement_level})</span>`
  } else {
    engagementTag = `<span class="tag tag--engagement">${coding.engagement.replace('_', ' ')}</span>`
  }

  let html = `<div class="detail-tags">
    ${engagementTag}
    ${coding.stance ? `<span class="tag ${stanceClass}">${STANCE_LABELS[coding.stance as keyof typeof STANCE_LABELS]}</span>` : ''}
    ${coding.framing ? `<span class="tag tag--framing">${coding.framing}</span>` : ''}
  </div>`

  if (coding.excerpt) {
    html += `<blockquote class="detail-excerpt">${coding.excerpt}</blockquote>`
  }

  if (coding.notes) {
    html += `<p class="detail-notes">${coding.notes}</p>`
  }

  return html
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
