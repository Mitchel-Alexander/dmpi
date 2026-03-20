import type { DimensionCode, Organisation } from './types'
import { DIMENSIONS } from './constants'

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
  let html = '<div class="filter-group"><span class="filter-label">Organisations</span><div class="filter-pills">'

  for (const org of orgs) {
    const active = state.activeOrgs.has(org.id)
    html += `<button class="filter-pill ${active ? 'filter-pill--active' : ''}" data-filter-org="${org.id}">${org.name}</button>`
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
  }, 0)

  return html
}
