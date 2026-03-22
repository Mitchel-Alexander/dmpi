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

/** Scope filters — adjust these to widen the displayed dataset */
const INCLUDED_ORG_TYPES = new Set(['commercial_lab'])
const MAX_TIER = 2

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
  const org = organisations.find(o => o.id === file.organisation_id)
  if (!org || !INCLUDED_ORG_TYPES.has(org.type)) continue
  const docs = (file.documents as Document[]).filter(d => d.tier <= MAX_TIER)
  if (docs.length > 0) {
    orgDocuments.set(file.organisation_id, docs)
  }
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

/** Pick the most significant coding for the grid cell display.
 *  Priority: highest engagement_level, then lowest tier, then most recent. */
export function getRepresentativeCoding(orgId: string, dimension: DimensionCode): { doc: Document; coding: Coding } | null {
  const all = getCodingsForCell(orgId, dimension)
  if (all.length === 0) return null

  all.sort((a, b) => {
    // Higher engagement_level first (substantive > adjacent > proximate > omission > excluded)
    const levelA = a.coding.engagement_level ?? (a.coding.engagement === 'absent' ? -1 : a.coding.engagement === 'implicit' ? 1 : 2)
    const levelB = b.coding.engagement_level ?? (b.coding.engagement === 'absent' ? -1 : b.coding.engagement === 'implicit' ? 1 : 2)
    if (levelA !== levelB) return levelB - levelA

    // Lower tier number (higher priority)
    if (a.doc.tier !== b.doc.tier) return a.doc.tier - b.doc.tier

    // Most recent
    return b.doc.publication_date.localeCompare(a.doc.publication_date)
  })

  return all[0]
}
