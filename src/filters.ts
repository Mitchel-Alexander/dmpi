import type { DimensionCode, Organisation } from './types'
import { DIMENSIONS } from './constants'
import { ORG_TYPE_LABELS } from './data'

export interface FilterState {
  activeOrgs: Set<string>
  activeDimensions: Set<DimensionCode>
}

export function createFilterState(orgs: Organisation[]): FilterState {
  return {
    activeOrgs: new Set(orgs.map(o => o.id)),
    activeDimensions: new Set(DIMENSIONS.map(d => d.code)),
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
  }, 0)

  return html
}
