interface InstructorAssignment {
  instructor: {
    hourlyWage: number
  }
  workDays: string[] // JSON array stored in DB
}

interface Season {
  startDate: Date
  endDate: Date
}

interface Program {
  sessionDuration?: number | null
  programType?: {
    sessionHours: number
  } | null
  instructors: InstructorAssignment[]
}

/**
 * Calculate total instructor wages for a program in a given month
 */
export function calculateMonthlyInstructorWages(
  program: Program,
  month: number,
  year: number,
  season?: Season
): number {
  let totalWages = 0
  
  // Get session duration (prefer program-specific, fallback to program type)
  const sessionHours = program.sessionDuration || program.programType?.sessionHours || 1.5
  
  // Calculate number of weeks in the month (approximately)
  const daysInMonth = new Date(year, month, 0).getDate()
  const weeksInMonth = daysInMonth / 7
  
  for (const assignment of program.instructors) {
    const workDaysPerWeek = assignment.workDays.length
    const sessionsPerMonth = workDaysPerWeek * weeksInMonth
    const hoursPerMonth = sessionsPerMonth * sessionHours
    const monthlyWage = hoursPerMonth * assignment.instructor.hourlyWage
    
    totalWages += monthlyWage
  }
  
  return Math.round(totalWages)
}

/**
 * Calculate total instructor wages for a seasonal program
 */
export function calculateSeasonalInstructorWages(
  program: Program,
  season: Season
): number {
  let totalWages = 0
  
  // Get session duration
  const sessionHours = program.sessionDuration || program.programType?.sessionHours || 1.5
  
  // Calculate total weeks in season
  const seasonStart = new Date(season.startDate)
  const seasonEnd = new Date(season.endDate)
  const seasonDuration = seasonEnd.getTime() - seasonStart.getTime()
  const weeksInSeason = seasonDuration / (1000 * 60 * 60 * 24 * 7)
  
  for (const assignment of program.instructors) {
    const workDaysPerWeek = assignment.workDays.length
    const totalSessions = workDaysPerWeek * weeksInSeason
    const totalHours = totalSessions * sessionHours
    const totalWage = totalHours * assignment.instructor.hourlyWage
    
    totalWages += totalWage
  }
  
  return Math.round(totalWages)
}

/**
 * Calculate instructor wages for dashboard display
 * Handles both monthly and seasonal programs
 */
export function calculateInstructorWagesForDashboard(
  programs: any[],
  month: number,
  year: number,
  currentSeason?: any
): number {
  let totalInstructorWages = 0
  
  for (const program of programs) {
    if (program.instructors && program.instructors.length > 0) {
      if (program.isMonthly) {
        // Monthly program - calculate for specific month
        totalInstructorWages += calculateMonthlyInstructorWages(
          program,
          month,
          year
        )
      } else if (currentSeason) {
        // Seasonal program - calculate for entire season, then divide by season months
        const seasonalWage = calculateSeasonalInstructorWages(program, currentSeason)
        
        // Divide by number of months in season for monthly display
        const seasonStart = new Date(currentSeason.startDate)
        const seasonEnd = new Date(currentSeason.endDate)
        const monthsInSeason = (seasonEnd.getFullYear() - seasonStart.getFullYear()) * 12 + 
                              (seasonEnd.getMonth() - seasonStart.getMonth()) + 1
        
        const monthlySeasonalWage = seasonalWage / monthsInSeason
        totalInstructorWages += monthlySeasonalWage
      }
    }
  }
  
  return Math.round(totalInstructorWages)
}