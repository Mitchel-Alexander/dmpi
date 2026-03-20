import type { DimensionCode } from './types'
import { DIMENSIONS } from './constants'
import { getCodedOrgs } from './data'
import { renderGrid, renderLegend } from './grid'
import { renderCellDetail } from './detail'
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
  const activeOrgs = orgs.filter(o => state.activeOrgs.has(o.id))
  const activeDims = Array.from(state.activeDimensions) as DimensionCode[]

  filtersEl.innerHTML = renderFilters(orgs, state, update)
  gridEl.innerHTML = renderGrid(activeOrgs, activeDims)
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
  const cell = (e.target as HTMLElement).closest<HTMLElement>('.grid-cell[data-org]')
  if (!cell) return

  const orgId = cell.dataset.org!
  const dim = cell.dataset.dim! as DimensionCode
  const org = orgs.find(o => o.id === orgId)
  if (!org) return

  openPanel(renderCellDetail(orgId, org.name, dim))
})

// Close panel
panelEl.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).classList.contains('panel-close')) {
    closePanel()
  }
})
overlayEl.addEventListener('click', closePanel)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePanel()
})

// Initial render
update()
