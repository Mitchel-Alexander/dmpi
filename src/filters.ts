import type { DimensionCode, Organisation } from './types'
import { DIMENSIONS } from './constants'
import { ORG_TYPE_LABELS, getAllSubtypes } from './data'

/** Subtype display categories — groups the 13 raw subtypes into user-facing categories */
export const SUBTYPE_CATEGORIES: { label: string; subtypes: string[] }[] = [
  { label: 'Model Cards', subtypes: ['model_card'] },
  { label: 'System Cards', subtypes: ['system_card'] },
  { label: 'Safety Frameworks', subtypes: ['safety_framework'] },
  { label: 'Constitutions', subtypes: ['constitution'] },
  { label: 'Charters & Principles', subtypes: ['charter', 'safety_philosophy'] },
  { label: 'Research & Analysis', subtypes: ['research_paper', 'threat_model', 'policy_analysis', 'governance_framework'] },
  { label: 'Other', subtypes: ['blog_post', 'leadership_statement', 'system_prompt'] },
]

export interface FilterState {
  activeOrgs: Set<string>
  activeDimensions: Set<DimensionCode>
  activeSubtypes: Set<string>
}

export function createFilterState(orgs: Organisation[]): FilterState {
  return {
    activeOrgs: new Set(orgs.map(o => o.id)),
    activeDimensions: new Set(DIMENSIONS.map(d => d.code)),
    activeSubtypes: new Set(getAllSubtypes()),
  }
}

export function renderFilters(
  orgs: Organisation[],
  state: FilterState,
  onChange: () => void
): string {
  // Group orgs by type for display
  const typeOrder = ['commercial_lab', 'technical_safety_nonprofit']
  const orgsByType = new Map<string, Organisation[]>()
  for (const org of orgs) {
    const list = orgsByType.get(org.type) ?? []
    list.push(org)
    orgsByType.set(org.type, list)
  }

  let html = '<div class="filter-group"><span class="filter-label">Organisations</span><div class="filter-pills">'

  for (const t of typeOrder) {
    const typeOrgs = orgsByType.get(t)
    if (!typeOrgs) continue

    const label = ORG_TYPE_LABELS[t] ?? t
    const allActive = typeOrgs.every(o => state.activeOrgs.has(o.id))
    html += `<button class="filter-pill filter-pill--type ${allActive ? 'filter-pill--active' : ''}" data-filter-type="${t}" title="Toggle all ${label.toLowerCase()}">${label}</button>`

    for (const org of typeOrgs) {
      const active = state.activeOrgs.has(org.id)
      html += `<button class="filter-pill ${active ? 'filter-pill--active' : ''}" data-filter-org="${org.id}">${org.name}</button>`
    }
  }

  html += '</div></div>'

  // Document type filter
  const allSubtypes = getAllSubtypes()
  if (allSubtypes.length > 0) {
    html += '<div class="filter-group"><span class="filter-label">Document Type</span><div class="filter-pills">'

    for (const cat of SUBTYPE_CATEGORIES) {
      // Only show categories that have matching documents in the dataset
      const present = cat.subtypes.filter(s => allSubtypes.includes(s))
      if (present.length === 0) continue

      const allActive = present.every(s => state.activeSubtypes.has(s))
      html += `<button class="filter-pill ${allActive ? 'filter-pill--active' : ''}" data-filter-subtype-cat="${cat.label}">${cat.label}</button>`
    }

    html += '</div></div>'
  }

  // Attach listeners after render
  setTimeout(() => {
    document.querySelectorAll<HTMLButtonElement>('[data-filter-org]').forEach(btn => {
      btn.addEventListener('click', () => {
        const orgId = btn.dataset.filterOrg!
        if (state.activeOrgs.has(orgId)) {
          if (state.activeOrgs.size > 1) {
            state.activeOrgs.delete(orgId)
          }
        } else {
          state.activeOrgs.add(orgId)
        }
        onChange()
      })
    })

    document.querySelectorAll<HTMLButtonElement>('[data-filter-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.filterType!
        const typeOrgs = orgsByType.get(type) ?? []
        const allActive = typeOrgs.every(o => state.activeOrgs.has(o.id))

        if (allActive) {
          // Deactivate all of this type (unless they're the only active ones)
          const otherActive = [...state.activeOrgs].filter(id => !typeOrgs.some(o => o.id === id))
          if (otherActive.length > 0) {
            for (const o of typeOrgs) {
              state.activeOrgs.delete(o.id)
            }
          }
        } else {
          // Activate all of this type
          for (const o of typeOrgs) {
            state.activeOrgs.add(o.id)
          }
        }
        onChange()
      })
    })

    document.querySelectorAll<HTMLButtonElement>('[data-filter-subtype-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const catLabel = btn.dataset.filterSubtypeCat!
        const cat = SUBTYPE_CATEGORIES.find(c => c.label === catLabel)
        if (!cat) return

        const present = cat.subtypes.filter(s => allSubtypes.includes(s))
        const allActive = present.every(s => state.activeSubtypes.has(s))

        if (allActive) {
          // Deactivate this category (unless it would leave nothing active)
          const remaining = [...state.activeSubtypes].filter(s => !present.includes(s))
          if (remaining.length > 0) {
            for (const s of present) {
              state.activeSubtypes.delete(s)
            }
          }
        } else {
          for (const s of present) {
            state.activeSubtypes.add(s)
          }
        }
        onChange()
      })
    })
  }, 0)

  return html
}
