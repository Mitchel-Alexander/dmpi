import type { DimensionCode, Stance, EngagementLevel, EngagementCode } from './types'

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
