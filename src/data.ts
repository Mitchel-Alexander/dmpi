import type { OrgFile, Organisation, Document, Coding, DimensionCode } from './types'
import orgsJson from '../data/organisations.json'
import anthropicData from '../data/documents/anthropic.json'
import openaiData from '../data/documents/openai.json'
import metaData from '../data/documents/meta.json'
import deepmindData from '../data/documents/google-deepmind.json'
import xaiData from '../data/documents/xai.json'
import apolloData from '../data/documents/apollo-research.json'
import metrData from '../data/documents/metr.json'
import redwoodData from '../data/documents/redwood-research.json'

export const organisations: Organisation[] = orgsJson as Organisation[]

const orgFiles: OrgFile[] = [
  anthropicData as unknown as OrgFile,
  openaiData as unknown as OrgFile,
  metaData as unknown as OrgFile,
  deepmindData as unknown as OrgFile,
  xaiData as unknown as OrgFile,
  apolloData as unknown as OrgFile,
  metrData as unknown as OrgFile,
  redwoodData as unknown as OrgFile,
]

export const orgDocuments = new Map<string, Document[]>()
for (const file of orgFiles) {
  orgDocuments.set(file.organisation_id, file.documents as Document[])
}

/** Orgs that have coded data */
export function getCodedOrgs(): Organisation[] {
  return organisations.filter(o => orgDocuments.has(o.id))
}

/** Human-readable labels for org types */
export const ORG_TYPE_LABELS: Record<string, string> = {
  commercial_lab: 'Commercial Labs',
  technical_safety_nonprofit: 'Technical Safety Non-profits',
}

/** Get coded orgs grouped by type, in display order */
export function getCodedOrgsByType(): { type: string; label: string; orgs: Organisation[] }[] {
  const coded = getCodedOrgs()
  const typeOrder = ['commercial_lab', 'technical_safety_nonprofit']
  const groups: { type: string; label: string; orgs: Organisation[] }[] = []

  for (const t of typeOrder) {
    const orgs = coded.filter(o => o.type === t)
    if (orgs.length > 0) {
      groups.push({ type: t, label: ORG_TYPE_LABELS[t] ?? t, orgs })
    }
  }

  // Catch any orgs with types not in typeOrder
  const covered = new Set(typeOrder)
  const other = coded.filter(o => !covered.has(o.type))
  if (other.length > 0) {
    groups.push({ type: 'other', label: 'Other', orgs: other })
  }

  return groups
}

/** Get all codings for an org+dimension across all documents */
export function getCodingsForCell(orgId: string, dimension: DimensionCode): { doc: Document; coding: Coding }[] {
  const docs = orgDocuments.get(orgId) ?? []
  const results: { doc: Document; coding: Coding }[] = []
  for (const doc of docs) {
    const coding = doc.codings.find(c => c.dimension === dimension)
    if (coding) {
      results.push({ doc, coding })
    }
  }
  return results
}

/** Pick the most significant coding for the grid cell display */
export function getRepresentativeCoding(orgId: string, dimension: DimensionCode): { doc: Document; coding: Coding } | null {
  const all = getCodingsForCell(orgId, dimension)
  if (all.length === 0) return null

  // Prefer addressed/explicit/implicit over not_addressed/absent
  const substantive = all.filter(c =>
    c.coding.engagement === 'addressed' ||
    c.coding.engagement === 'explicit' ||
    c.coding.engagement === 'implicit'
  )

  if (substantive.length > 0) {
    // Prefer lowest tier number (highest priority), then most recent
    substantive.sort((a, b) => {
      if (a.doc.tier !== b.doc.tier) return a.doc.tier - b.doc.tier
      return b.doc.publication_date.localeCompare(a.doc.publication_date)
    })
    return substantive[0]
  }

  // All not_addressed — return the first
  return all[0]
}
