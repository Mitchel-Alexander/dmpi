export type DimensionCode = 'CON' | 'WEL' | 'MOR' | 'SRE' | 'ANT' | 'UNC' | 'GOV' | 'ONT'

export type SubDimensionCode = 'WEL.VAL' | 'WEL.MON' | 'WEL.RES'

/** Graduated engagement scale for core dimensions (CON, WEL, MOR, SRE, ANT, UNC, GOV) */
export type EngagementLevel = 0 | 1 | 2 | 3 | 4

export type EngagementCode =
  | 'structurally_excluded'  // Level 0: document scope makes dimension impossible
  | 'omission'               // Level 1: detailed framework, dimension absent
  | 'proximate'              // Level 2: evaluates/monitors neighbouring properties
  | 'adjacent'               // Level 3: concept named without substantive engagement
  | 'substantive'            // Level 4: directly engaged with codeable stance

/** ONT retains its own engagement system */
export type OntEngagement = 'explicit' | 'implicit' | 'absent'

export type Engagement = EngagementCode | OntEngagement

export type Stance = 'denies' | 'cautious' | 'precautionary' | 'investigative' | 'affirms' | 'descriptive' | 'ambiguous'

export interface Coding {
  dimension: DimensionCode
  sub_dimension?: SubDimensionCode | null   // null/undefined for parent-level codings
  engagement: Engagement
  engagement_level: EngagementLevel | null  // null for ONT (uses its own system)
  stance: Stance | null                     // only coded at level 4 (substantive)
  framing: string | null
  excerpt: string
  notes: string
  date_updated: string
}

export interface Document {
  id: string
  title: string
  tier: number
  subtype: string
  publication_date: string
  url: string
  archived_url: string | null
  supersedes_id: string | null
  date_coded: string
  coder: string
  notes: string
  codings: Coding[]
}

export interface OrgFile {
  organisation_id: string
  documents: Document[]
}

export interface Organisation {
  id: string
  name: string
  headquarters_country: string
  type: string
  url: string
  notes: string
}
