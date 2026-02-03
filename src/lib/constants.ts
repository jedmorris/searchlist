// US States for filtering
export const US_STATES = [
  { value: 'alabama', label: 'Alabama', abbr: 'AL' },
  { value: 'alaska', label: 'Alaska', abbr: 'AK' },
  { value: 'arizona', label: 'Arizona', abbr: 'AZ' },
  { value: 'arkansas', label: 'Arkansas', abbr: 'AR' },
  { value: 'california', label: 'California', abbr: 'CA' },
  { value: 'colorado', label: 'Colorado', abbr: 'CO' },
  { value: 'connecticut', label: 'Connecticut', abbr: 'CT' },
  { value: 'delaware', label: 'Delaware', abbr: 'DE' },
  { value: 'florida', label: 'Florida', abbr: 'FL' },
  { value: 'georgia', label: 'Georgia', abbr: 'GA' },
  { value: 'hawaii', label: 'Hawaii', abbr: 'HI' },
  { value: 'idaho', label: 'Idaho', abbr: 'ID' },
  { value: 'illinois', label: 'Illinois', abbr: 'IL' },
  { value: 'indiana', label: 'Indiana', abbr: 'IN' },
  { value: 'iowa', label: 'Iowa', abbr: 'IA' },
  { value: 'kansas', label: 'Kansas', abbr: 'KS' },
  { value: 'kentucky', label: 'Kentucky', abbr: 'KY' },
  { value: 'louisiana', label: 'Louisiana', abbr: 'LA' },
  { value: 'maine', label: 'Maine', abbr: 'ME' },
  { value: 'maryland', label: 'Maryland', abbr: 'MD' },
  { value: 'massachusetts', label: 'Massachusetts', abbr: 'MA' },
  { value: 'michigan', label: 'Michigan', abbr: 'MI' },
  { value: 'minnesota', label: 'Minnesota', abbr: 'MN' },
  { value: 'mississippi', label: 'Mississippi', abbr: 'MS' },
  { value: 'missouri', label: 'Missouri', abbr: 'MO' },
  { value: 'montana', label: 'Montana', abbr: 'MT' },
  { value: 'nebraska', label: 'Nebraska', abbr: 'NE' },
  { value: 'nevada', label: 'Nevada', abbr: 'NV' },
  { value: 'new-hampshire', label: 'New Hampshire', abbr: 'NH' },
  { value: 'new-jersey', label: 'New Jersey', abbr: 'NJ' },
  { value: 'new-mexico', label: 'New Mexico', abbr: 'NM' },
  { value: 'new-york', label: 'New York', abbr: 'NY' },
  { value: 'north-carolina', label: 'North Carolina', abbr: 'NC' },
  { value: 'north-dakota', label: 'North Dakota', abbr: 'ND' },
  { value: 'ohio', label: 'Ohio', abbr: 'OH' },
  { value: 'oklahoma', label: 'Oklahoma', abbr: 'OK' },
  { value: 'oregon', label: 'Oregon', abbr: 'OR' },
  { value: 'pennsylvania', label: 'Pennsylvania', abbr: 'PA' },
  { value: 'rhode-island', label: 'Rhode Island', abbr: 'RI' },
  { value: 'south-carolina', label: 'South Carolina', abbr: 'SC' },
  { value: 'south-dakota', label: 'South Dakota', abbr: 'SD' },
  { value: 'tennessee', label: 'Tennessee', abbr: 'TN' },
  { value: 'texas', label: 'Texas', abbr: 'TX' },
  { value: 'utah', label: 'Utah', abbr: 'UT' },
  { value: 'vermont', label: 'Vermont', abbr: 'VT' },
  { value: 'virginia', label: 'Virginia', abbr: 'VA' },
  { value: 'washington', label: 'Washington', abbr: 'WA' },
  { value: 'west-virginia', label: 'West Virginia', abbr: 'WV' },
  { value: 'wisconsin', label: 'Wisconsin', abbr: 'WI' },
  { value: 'wyoming', label: 'Wyoming', abbr: 'WY' },
] as const

export type USState = (typeof US_STATES)[number]

// Deal context options for inquiry form
export const DEAL_CONTEXTS = [
  { value: 'buying', label: 'Buying a business' },
  { value: 'selling', label: 'Selling a business' },
  { value: 'both', label: 'Both buying and selling' },
  { value: 'general', label: 'General inquiry' },
] as const

// Deal size ranges for filtering (in thousands)
export const DEAL_SIZE_RANGES = [
  { min: 0, max: 500, label: 'Under $500K' },
  { min: 500, max: 1000, label: '$500K - $1M' },
  { min: 1000, max: 2500, label: '$1M - $2.5M' },
  { min: 2500, max: 5000, label: '$2.5M - $5M' },
  { min: 5000, max: 10000, label: '$5M - $10M' },
  { min: 10000, max: 25000, label: '$10M - $25M' },
  { min: 25000, max: null, label: '$25M+' },
] as const

// Format deal size for display
export function formatDealSize(sizeInThousands: number | null): string {
  if (sizeInThousands === null) return 'N/A'
  if (sizeInThousands >= 1000) {
    return `$${(sizeInThousands / 1000).toFixed(sizeInThousands % 1000 === 0 ? 0 : 1)}M`
  }
  return `$${sizeInThousands}K`
}

// Format deal size range
export function formatDealSizeRange(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Any deal size'
  if (min === null) return `Up to ${formatDealSize(max)}`
  if (max === null) return `${formatDealSize(min)}+`
  return `${formatDealSize(min)} - ${formatDealSize(max)}`
}

// Site metadata
export const SITE_CONFIG = {
  name: 'ETA Services Directory',
  description: 'Find trusted service providers for your business acquisition journey. Connect with M&A attorneys, QoE providers, SBA lenders, and more.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://etadirectory.com',
} as const
