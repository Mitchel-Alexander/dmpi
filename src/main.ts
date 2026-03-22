import type { DimensionCode } from './types'
import { DIMENSIONS } from './constants'
import { getCodedOrgs, getCodedOrgsByType } from './data'
import { renderGrid, renderLegend } from './grid'
import { renderCellDetail, renderDocumentDetail, renderOrgDocumentList } from './detail'
import { createFilterState, renderFilters } from './filters'
import './style.css'

const orgs = getCodedOrgs()
const state = createFilterState(orgs)

const filtersEl = document.getElementById('filters')!
const gridEl = document.getElementById('grid')!
const legendEl = document.getElementById('legend')!
const panelEl = document.getElementById('detail-panel')!
const overlayEl = document.getElementById('detail-overlay')!

function update() {
  const allGroups = getCodedOrgsByType()
  const activeGroups = allGroups.map(g => ({
    ...g,
    orgs: g.orgs.filter(o => state.activeOrgs.has(o.id)),
  })).filter(g => g.orgs.length > 0)
  const activeDims = Array.from(state.activeDimensions) as DimensionCode[]

  filtersEl.innerHTML = renderFilters(orgs, state, update)
  gridEl.innerHTML = renderGrid(activeGroups, activeDims)
  legendEl.innerHTML = renderLegend()
}

function openPanel(html: string) {
  panelEl.innerHTML = `<button class="panel-close" aria-label="Close">&times;</button>` + html
  panelEl.classList.add('open')
  overlayEl.classList.add('open')
}

function closePanel() {
  panelEl.classList.remove('open')
  overlayEl.classList.remove('open')
}

// Grid cell clicks
gridEl.addEventListener('click', (e) => {
  // Org header click → document list
  const orgHeader = (e.target as HTMLElement).closest<HTMLElement>('.grid-org-header[data-org]')
  if (orgHeader) {
    const orgId = orgHeader.dataset.org!
    const org = orgs.find(o => o.id === orgId)
    if (org) openPanel(renderOrgDocumentList(orgId, org.name))
    return
  }

  // Cell click → dimension detail
  const cell = (e.target as HTMLElement).closest<HTMLElement>('.grid-cell[data-org]')
  if (!cell) return

  const orgId = cell.dataset.org!
  const dim = cell.dataset.dim! as DimensionCode
  const org = orgs.find(o => o.id === orgId)
  if (!org) return

  openPanel(renderCellDetail(orgId, org.name, dim))
})

// Panel clicks — close button and document cards
panelEl.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).classList.contains('panel-close')) {
    closePanel()
    return
  }

  // Document card click → document detail
  const docCard = (e.target as HTMLElement).closest<HTMLElement>('.detail-doc-card[data-doc-id]')
  if (docCard) {
    const docId = docCard.dataset.docId!
    const orgName = docCard.dataset.orgName!
    panelEl.innerHTML = `<button class="panel-close" aria-label="Close">&times;</button>` + renderDocumentDetail(docId, orgName)
  }
})
overlayEl.addEventListener('click', closePanel)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePanel()
})

// Initial render
update()
