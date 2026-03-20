import type { DimensionCode, Stance } from './types'

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
  { code: 'CWG', label: 'Capability-Welfare Gap', shortDesc: 'Welfare-adjacent claims without welfare connection' },
]

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

export function isSubstantive(engagement: string): boolean {
  return engagement === 'addressed' || engagement === 'explicit' || engagement === 'implicit'
}
