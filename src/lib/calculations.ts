/**
 * Financial calculation utilities for archery club bookkeeping
 */

export interface RegistrationData {
  fullRegistrations: number
  halfRegistrations: number
  subscriptionRegistrations: number
}

export interface ProgramPricing {
  fullPrice: number
  halfPrice?: number | null
  subscriptionPrice?: number | null
  venueSplitPercent: number
}

export interface InstructorData {
  hourlyWage: number
  totalHours: number
}

/**
 * Calculate total revenue from registrations
 */
export function calculateRevenue(
  registrations: RegistrationData,
  pricing: ProgramPricing
): number {
  const fullRevenue = registrations.fullRegistrations * pricing.fullPrice
  const halfRevenue = registrations.halfRegistrations * (pricing.halfPrice || 0)
  const subscriptionRevenue = registrations.subscriptionRegistrations * (pricing.subscriptionPrice || pricing.fullPrice)
  
  return fullRevenue + halfRevenue + subscriptionRevenue
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
 * Calculate instructor wages
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
 * Complete financial summary calculation
 */
export function calculateFinancialSummary(
  registrations: RegistrationData,
  pricing: ProgramPricing,
  instructors: InstructorData[]
) {
  const revenue = calculateRevenue(registrations, pricing)
  const venueCosts = calculateVenueCosts(revenue, pricing.venueSplitPercent)
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