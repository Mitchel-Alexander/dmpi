import type { DimensionCode, SubDimensionCode, Stance, EngagementLevel, EngagementCode } from './types'

export interface DimensionMeta {
  code: DimensionCode
  label: string
  shortDesc: string
}

export const DIMENSIONS: DimensionMeta[] = [
  { code: 'ONT', label: 'Ontological Framing', shortDesc: 'What the model fundamentally is' },
  { code: 'CON', label: 'Consciousness / Sentience', shortDesc: 'Whether models are or could be conscious' },
  { code: 'WEL', label: 'Model Welfare', shortDesc: 'AI wellbeing, welfare, suffering, interests' },
  { code: 'MOR', label: 'Moral Status / Personhood', shortDesc: 'Whether AI could have moral status or rights' },
  { code: 'SRE', label: 'Self-Representation', shortDesc: 'How the model represents its own nature' },
  { code: 'ANT', label: 'Anthropomorphism', shortDesc: 'Anthropomorphic framing and parasocial dynamics' },
  { code: 'UNC', label: 'Uncertainty / Precaution', shortDesc: 'Uncertainty about AI mentality' },
  { code: 'GOV', label: 'Governance Commitments', shortDesc: 'Concrete governance commitments' },
]

export interface EngagementLevelMeta {
  level: EngagementLevel
  code: EngagementCode
  label: string
  shortDesc: string
}

export const ENGAGEMENT_LEVELS: EngagementLevelMeta[] = [
  { level: 0, code: 'structurally_excluded', label: 'Excluded', shortDesc: 'Document scope precludes dimension' },
  { level: 1, code: 'omission', label: 'Omission', shortDesc: 'Detailed framework, dimension absent' },
  { level: 2, code: 'proximate', label: 'Proximate', shortDesc: 'Adjacent infrastructure without engagement' },
  { level: 3, code: 'adjacent', label: 'Adjacent', shortDesc: 'Concept named without substance' },
  { level: 4, code: 'substantive', label: 'Substantive', shortDesc: 'Direct engagement with codeable stance' },
]

export const ENGAGEMENT_LEVEL_LABELS: Record<EngagementCode, string> = {
  structurally_excluded: 'Excluded',
  omission: 'Omission',
  proximate: 'Proximate',
  adjacent: 'Adjacent',
  substantive: 'Substantive',
}

export const STANCE_COLOURS: Record<Stance, string> = {
  denies: 'var(--stance-denies)',
  cautious: 'var(--stance-cautious)',
  precautionary: 'var(--stance-precautionary)',
  investigative: 'var(--stance-investigative)',
  affirms: 'var(--stance-affirms)',
  descriptive: 'var(--stance-descriptive)',
  ambiguous: 'var(--stance-ambiguous)',
}

export const STANCE_LABELS: Record<Stance, string> = {
  denies: 'Denies',
  cautious: 'Cautious',
  precautionary: 'Precautionary',
  investigative: 'Investigative',
  affirms: 'Affirms',
  descriptive: 'Descriptive',
  ambiguous: 'Ambiguous',
}

export interface SubDimensionMeta {
  code: SubDimensionCode
  parent: DimensionCode
  label: string
  shortDesc: string
}

export const SUB_DIMENSIONS: SubDimensionMeta[] = [
  { code: 'WEL.VAL', parent: 'WEL', label: 'Valenced Experience', shortDesc: 'Whether the model has preferences or positive/negative states' },
  { code: 'WEL.MON', parent: 'WEL', label: 'Welfare Monitoring', shortDesc: 'Monitoring for welfare-relevant signals' },
  { code: 'WEL.RES', parent: 'WEL', label: 'Welfare Response', shortDesc: 'Policies for responding to welfare indicators' },
]

/** Get sub-indicators for a parent dimension */
export function getSubDimensions(parent: DimensionCode): SubDimensionMeta[] {
  return SUB_DIMENSIONS.filter(s => s.parent === parent)
}

/** Whether a dimension has sub-indicators */
export function hasSubDimensions(code: DimensionCode): boolean {
  return SUB_DIMENSIONS.some(s => s.parent === code)
}

/** Whether a code is a sub-indicator code */
export function isSubDimension(code: string): boolean {
  return SUB_DIMENSIONS.some(s => s.code === code)
}

/** Get the parent dimension for a sub-indicator */
export function getParentDimension(code: SubDimensionCode): DimensionCode {
  const meta = SUB_DIMENSIONS.find(s => s.code === code)
  return meta!.parent
}

/** Check whether a coding represents substantive engagement (level 4 or ONT explicit/implicit) */
export function isSubstantive(engagement: string, engagementLevel?: number | null): boolean {
  // For core dimensions with engagement_level
  if (engagementLevel !== undefined && engagementLevel !== null) {
    return engagementLevel === 4
  }
  // For ONT (uses its own system)
  return engagement === 'explicit' || engagement === 'implicit'
}

/** Get engagement level metadata by code */
export function getEngagementMeta(code: EngagementCode): EngagementLevelMeta | undefined {
  return ENGAGEMENT_LEVELS.find(e => e.code === code)
}
