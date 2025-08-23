/**
 * NEW Financial calculation utilities for flexible pricing system
 * Supports dynamic pricing options instead of hardcoded full/half/subscription
 */

export interface PricingOption {
  id: string
  name: string
  price: number
  order: number
  isActive: boolean
}

export interface RegistrationEntry {
  id: string
  pricingOptionId: string
  quantity: number
  pricingOption: PricingOption
}

export interface FlexibleProgram {
  id: string
  name: string
  sessionDuration: number
  isMonthly: boolean
  venueSplitPercent: number
  pricingOptions: PricingOption[]
}

export interface FlexibleRegistration {
  id: string
  programId: string
  seasonId?: string
  month?: number
  entries: RegistrationEntry[]
  program: FlexibleProgram
}

export interface InstructorData {
  hourlyWage: number
  totalHours: number
}

/**
 * Calculate total revenue from flexible registration entries
 */
export function calculateFlexibleRevenue(entries: RegistrationEntry[]): number {
  return entries.reduce((total, entry) => {
    return total + (entry.quantity * entry.pricingOption.price)
  }, 0)
}

/**
 * Calculate venue costs based on revenue and split percentage
 */
export function calculateVenueCosts(
  revenue: number,
  venueSplitPercent: number
): number {
  return Math.round(revenue * (venueSplitPercent / 100))
}

/**
 * Calculate instructor wages (unchanged from original)
 */
export function calculateInstructorWages(
  instructors: InstructorData[]
): number {
  return instructors.reduce((total, instructor) => {
    return total + (instructor.hourlyWage * instructor.totalHours)
  }, 0)
}

/**
 * Calculate net profit/margin
 */
export function calculateNetProfit(
  revenue: number,
  venueCosts: number,
  instructorWages: number
): number {
  return revenue - venueCosts - instructorWages
}

/**
 * Calculate number of sessions based on date range and work days
 */
export function calculateSeasonSessions(
  startDate: Date,
  endDate: Date,
  workDays: string[], // ['MONDAY', 'WEDNESDAY', 'FRIDAY']
  sessionHours: number = 1.5
): { totalSessions: number; totalHours: number } {
  const dayMap: { [key: string]: number } = {
    'SUNDAY': 0,
    'MONDAY': 1,
    'TUESDAY': 2,
    'WEDNESDAY': 3,
    'THURSDAY': 4,
    'FRIDAY': 5,
    'SATURDAY': 6
  }

  const workDayNumbers = workDays.map(day => dayMap[day.toUpperCase()])
  let totalSessions = 0

  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()
    if (workDayNumbers.includes(dayOfWeek)) {
      totalSessions++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return {
    totalSessions,
    totalHours: totalSessions * sessionHours
  }
}

/**
 * Complete financial summary calculation for flexible system
 */
export function calculateFlexibleFinancialSummary(
  registration: FlexibleRegistration,
  instructors: InstructorData[] = []
) {
  const revenue = calculateFlexibleRevenue(registration.entries)
  const venueCosts = calculateVenueCosts(revenue, registration.program.venueSplitPercent)
  const instructorWages = calculateInstructorWages(instructors)
  const netProfit = calculateNetProfit(revenue, venueCosts, instructorWages)

  return {
    revenue,
    venueCosts,
    instructorWages,
    netProfit,
    marginPercent: revenue > 0 ? Math.round((netProfit / revenue) * 100 * 100) / 100 : 0
  }
}

/**
 * Calculate totals for multiple registrations (useful for monthly dashboards)
 */
export function calculateMonthlyTotals(registrations: FlexibleRegistration[]): {
  totalRevenue: number
  totalVenueCosts: number
  totalNetProfit: number
  programBreakdown: Array<{
    programId: string
    programName: string
    revenue: number
    venueCosts: number
    netProfit: number
    entries: Array<{
      pricingOptionName: string
      quantity: number
      subtotal: number
    }>
  }>
} {
  let totalRevenue = 0
  let totalVenueCosts = 0
  const programBreakdown = []

  for (const registration of registrations) {
    const revenue = calculateFlexibleRevenue(registration.entries)
    const venueCosts = calculateVenueCosts(revenue, registration.program.venueSplitPercent)
    const netProfit = revenue - venueCosts

    totalRevenue += revenue
    totalVenueCosts += venueCosts

    programBreakdown.push({
      programId: registration.program.id,
      programName: registration.program.name,
      revenue,
      venueCosts,
      netProfit,
      entries: registration.entries.map(entry => ({
        pricingOptionName: entry.pricingOption.name,
        quantity: entry.quantity,
        subtotal: entry.quantity * entry.pricingOption.price
      }))
    })
  }

  const totalNetProfit = totalRevenue - totalVenueCosts

  return {
    totalRevenue,
    totalVenueCosts,
    totalNetProfit,
    programBreakdown
  }
}

/**
 * Helper function to get current month's programs
 * Returns both seasonal programs (if month falls in season) and monthly programs
 */
export function getProgramsForMonth(
  year: number,
  month: number, // 1-12
  programs: FlexibleProgram[],
  seasons: Array<{
    id: string
    name: string
    startDate: Date
    endDate: Date
  }>
): {
  seasonalPrograms: FlexibleProgram[]
  monthlyPrograms: FlexibleProgram[]
  currentSeason?: { id: string; name: string }
} {
  const monthlyPrograms = programs.filter(p => p.isMonthly)
  const seasonalPrograms = []
  let currentSeason = undefined

  // Find which season this month falls into
  const monthDate = new Date(year, month - 1, 15) // Mid-month date
  
  for (const season of seasons) {
    if (monthDate >= season.startDate && monthDate <= season.endDate) {
      currentSeason = { id: season.id, name: season.name }
      // Get seasonal programs for this season
      seasonalPrograms.push(...programs.filter(p => !p.isMonthly))
      break
    }
  }

  return {
    seasonalPrograms,
    monthlyPrograms,
    currentSeason
  }
}

/**
 * Helper to format Icelandic currency
 */
export function formatISK(amount: number): string {
  return `${amount.toLocaleString('is-IS')} ISK`
}

/**
 * Helper to get month name in English (could be localized later)
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || 'Invalid Month'
}

/**
 * Legacy compatibility functions for existing code
 * These allow gradual migration from old to new system
 */

export interface LegacyRegistrationData {
  fullRegistrations: number
  halfRegistrations: number
  subscriptionRegistrations: number
}

export interface LegacyProgramPricing {
  fullPrice: number
  halfPrice?: number | null
  subscriptionPrice?: number | null
  venueSplitPercent: number
}

/**
 * Convert legacy registration data to new flexible format
 * Used during migration period
 */
export function convertLegacyToFlexible(
  legacyData: LegacyRegistrationData,
  legacyPricing: LegacyProgramPricing
): RegistrationEntry[] {
  const entries: RegistrationEntry[] = []

  if (legacyData.fullRegistrations > 0) {
    entries.push({
      id: 'legacy-full',
      pricingOptionId: 'legacy-full-option',
      quantity: legacyData.fullRegistrations,
      pricingOption: {
        id: 'legacy-full-option',
        name: 'Full Price',
        price: legacyPricing.fullPrice,
        order: 0,
        isActive: true
      }
    })
  }

  if (legacyData.halfRegistrations > 0 && legacyPricing.halfPrice) {
    entries.push({
      id: 'legacy-half',
      pricingOptionId: 'legacy-half-option',
      quantity: legacyData.halfRegistrations,
      pricingOption: {
        id: 'legacy-half-option',
        name: 'Half Price',
        price: legacyPricing.halfPrice,
        order: 1,
        isActive: true
      }
    })
  }

  if (legacyData.subscriptionRegistrations > 0 && legacyPricing.subscriptionPrice) {
    entries.push({
      id: 'legacy-subscription',
      pricingOptionId: 'legacy-subscription-option',
      quantity: legacyData.subscriptionRegistrations,
      pricingOption: {
        id: 'legacy-subscription-option',
        name: 'Subscription',
        price: legacyPricing.subscriptionPrice,
        order: 2,
        isActive: true
      }
    })
  }

  return entries
}

/**
 * Legacy revenue calculation (for backwards compatibility)
 */
export function calculateRevenue(
  registrations: LegacyRegistrationData,
  pricing: LegacyProgramPricing
): number {
  const flexibleEntries = convertLegacyToFlexible(registrations, pricing)
  return calculateFlexibleRevenue(flexibleEntries)
}