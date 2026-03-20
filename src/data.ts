import type { OrgFile, Organisation, Document, Coding, DimensionCode } from './types'
import orgsJson from '../data/organisations.json'
import anthropicData from '../data/documents/anthropic.json'
import openaiData from '../data/documents/openai.json'
import metaData from '../data/documents/meta.json'
import deepmindData from '../data/documents/google-deepmind.json'
import xaiData from '../data/documents/xai.json'

export const organisations: Organisation[] = orgsJson as Organisation[]

const orgFiles: OrgFile[] = [
  anthropicData as unknown as OrgFile,
  openaiData as unknown as OrgFile,
  metaData as unknown as OrgFile,
  deepmindData as unknown as OrgFile,
  xaiData as unknown as OrgFile,
]

export const orgDocuments = new Map<string, Document[]>()
for (const file of orgFiles) {
  orgDocuments.set(file.organisation_id, file.documents as Document[])
}

/** Orgs that have coded data */
export function getCodedOrgs(): Organisation[] {
  return organisations.filter(o => orgDocuments.has(o.id))
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
