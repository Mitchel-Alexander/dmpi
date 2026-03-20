export type DimensionCode = 'CON' | 'WEL' | 'MOR' | 'SRE' | 'ANT' | 'UNC' | 'GOV' | 'ONT' | 'CWG'

export type Engagement = 'addressed' | 'not_addressed' | 'explicit' | 'implicit' | 'absent'

export type Stance = 'denies' | 'cautious' | 'precautionary' | 'investigative' | 'affirms' | 'descriptive' | 'ambiguous'

export interface Coding {
  dimension: DimensionCode
  engagement: Engagement
  stance: Stance | null
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
