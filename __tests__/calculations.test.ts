import { describe, it, expect } from '@jest/globals'
import {
  calculateRevenue,
  calculateVenueCosts,
  calculateInstructorWages,
  calculateNetProfit,
  calculateSeasonSessions,
  calculateFinancialSummary,
  type RegistrationData,
  type ProgramPricing,
  type InstructorData
} from '../src/lib/calculations'

describe('Financial Calculations', () => {
  describe('calculateRevenue', () => {
    it('should calculate revenue correctly with full registrations only', () => {
      const registrations: RegistrationData = {
        fullRegistrations: 10,
        halfRegistrations: 0,
        subscriptionRegistrations: 0
      }
      const pricing: ProgramPricing = {
        fullPrice: 50000,
        venueSplitPercent: 50
      }

      const result = calculateRevenue(registrations, pricing)
      expect(result).toBe(500000)
    })

    it('should calculate revenue with mixed registration types', () => {
      const registrations: RegistrationData = {
        fullRegistrations: 13,
        halfRegistrations: 1,
        subscriptionRegistrations: 3
      }
      const pricing: ProgramPricing = {
        fullPrice: 50000,
        halfPrice: 25000,
        subscriptionPrice: 61500,
        venueSplitPercent: 50
      }

      const result = calculateRevenue(registrations, pricing)
      // 13 * 50000 + 1 * 25000 + 3 * 61500 = 650000 + 25000 + 184500 = 859500
      expect(result).toBe(859500)
    })

    it('should handle subscription registrations without explicit subscription price', () => {
      const registrations: RegistrationData = {
        fullRegistrations: 5,
        halfRegistrations: 0,
        subscriptionRegistrations: 2
      }
      const pricing: ProgramPricing = {
        fullPrice: 45000,
        venueSplitPercent: 50
      }

      const result = calculateRevenue(registrations, pricing)
      // Should use full price for subscription when no subscription price set
      // 5 * 45000 + 2 * 45000 = 315000
      expect(result).toBe(315000)
    })
  })

  describe('calculateVenueCosts', () => {
    it('should calculate 50% venue split correctly', () => {
      const revenue = 500000
      const venueSplitPercent = 50

      const result = calculateVenueCosts(revenue, venueSplitPercent)
      expect(result).toBe(250000)
    })

    it('should handle different venue split percentages', () => {
      const revenue = 300000
      const venueSplitPercent = 60

      const result = calculateVenueCosts(revenue, venueSplitPercent)
      expect(result).toBe(180000)
    })

    it('should round venue costs to nearest whole number', () => {
      const revenue = 333333
      const venueSplitPercent = 50

      const result = calculateVenueCosts(revenue, venueSplitPercent)
      expect(result).toBe(166667) // Rounded from 166666.5
    })
  })

  describe('calculateInstructorWages', () => {
    it('should calculate wages for single instructor', () => {
      const instructors: InstructorData[] = [
        { hourlyWage: 3000, totalHours: 60 }
      ]

      const result = calculateInstructorWages(instructors)
      expect(result).toBe(180000)
    })

    it('should calculate wages for multiple instructors', () => {
      const instructors: InstructorData[] = [
        { hourlyWage: 3000, totalHours: 40 },
        { hourlyWage: 2500, totalHours: 30 }
      ]

      const result = calculateInstructorWages(instructors)
      // 3000 * 40 + 2500 * 30 = 120000 + 75000 = 195000
      expect(result).toBe(195000)
    })

    it('should handle empty instructor list', () => {
      const instructors: InstructorData[] = []

      const result = calculateInstructorWages(instructors)
      expect(result).toBe(0)
    })
  })

  describe('calculateNetProfit', () => {
    it('should calculate positive profit correctly', () => {
      const revenue = 500000
      const venueCosts = 250000
      const instructorWages = 150000

      const result = calculateNetProfit(revenue, venueCosts, instructorWages)
      expect(result).toBe(100000)
    })

    it('should calculate negative profit (loss)', () => {
      const revenue = 300000
      const venueCosts = 150000
      const instructorWages = 200000

      const result = calculateNetProfit(revenue, venueCosts, instructorWages)
      expect(result).toBe(-50000)
    })
  })

  describe('calculateSeasonSessions', () => {
    it('should calculate sessions for spring season (3 days per week)', () => {
      // January 1, 2024 to April 30, 2024 (Monday, Wednesday, Friday)
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-04-30')
      const workDays = ['MONDAY', 'WEDNESDAY', 'FRIDAY']
      const sessionHours = 1.5

      const result = calculateSeasonSessions(startDate, endDate, workDays, sessionHours)
      
      // Should be approximately 52 sessions (4 months * 3 days/week * 4.3 weeks/month)
      expect(result.totalSessions).toBeGreaterThan(45)
      expect(result.totalSessions).toBeLessThan(60)
      expect(result.totalHours).toBe(result.totalSessions * 1.5)
    })

    it('should handle different session hours', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-07') // One week
      const workDays = ['MONDAY', 'WEDNESDAY', 'FRIDAY']
      const sessionHours = 2.0

      const result = calculateSeasonSessions(startDate, endDate, workDays, sessionHours)
      
      expect(result.totalSessions).toBe(3) // Mon 1st, Wed 3rd, Fri 5th
      expect(result.totalHours).toBe(6) // 3 sessions * 2 hours
    })
  })

  describe('calculateFinancialSummary', () => {
    it('should calculate complete financial summary correctly', () => {
      const registrations: RegistrationData = {
        fullRegistrations: 13,
        halfRegistrations: 1,
        subscriptionRegistrations: 0
      }
      const pricing: ProgramPricing = {
        fullPrice: 50000,
        halfPrice: 25000,
        venueSplitPercent: 50
      }
      const instructors: InstructorData[] = [
        { hourlyWage: 3250, totalHours: 52 }
      ]

      const result = calculateFinancialSummary(registrations, pricing, instructors)

      expect(result.revenue).toBe(675000) // 13 * 50000 + 1 * 25000
      expect(result.venueCosts).toBe(337500) // 675000 * 0.5
      expect(result.instructorWages).toBe(169000) // 3250 * 52
      expect(result.netProfit).toBe(168500) // 675000 - 337500 - 169000
      expect(result.marginPercent).toBeCloseTo(24.96, 1) // (168500 / 675000) * 100
    })

    it('should handle zero revenue scenario', () => {
      const registrations: RegistrationData = {
        fullRegistrations: 0,
        halfRegistrations: 0,
        subscriptionRegistrations: 0
      }
      const pricing: ProgramPricing = {
        fullPrice: 50000,
        venueSplitPercent: 50
      }
      const instructors: InstructorData[] = []

      const result = calculateFinancialSummary(registrations, pricing, instructors)

      expect(result.revenue).toBe(0)
      expect(result.venueCosts).toBe(0)
      expect(result.instructorWages).toBe(0)
      expect(result.netProfit).toBe(0)
      expect(result.marginPercent).toBe(0)
    })
  })
})