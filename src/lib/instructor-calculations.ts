interface InstructorAssignment {
  instructor: {
    hourlyWage: number;
  };
  workDays: string[]; // JSON array stored in DB
}

interface Season {
  startDate: Date;
  endDate: Date;
}

interface Program {
  sessionDuration?: number | null;
  programType?: {
    sessionHours: number;
  } | null;
  instructors: InstructorAssignment[];
}

// Icelandic employer wage cost overhead (2024)
const ICELAND_EMPLOYER_OVERHEAD = 0.18; // 6.35% social security + 11.5% pension + 0.1% VIRK = ~18%

// Helper function to count specific weekdays in a month
function countWeekdaysInMonth(year: number, month: number, weekdays: string[]): number {
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const targetDays = weekdays.map(day => dayNames.indexOf(day));
  
  let count = 0;
  const date = new Date(year, month - 1, 1); // month - 1 because Date constructor uses 0-based months
  const lastDay = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= lastDay; day++) {
    date.setDate(day);
    if (targetDays.includes(date.getDay())) {
      count++;
    }
  }
  
  return count;
}

/**
 * Calculate total instructor wages for a program in a given month
 * Counts actual occurrences of work days and includes Icelandic employer costs
 */
export function calculateMonthlyInstructorWages(
  program: Program,
  month: number,
  year: number,
  season?: Season
): number {
  let totalWages = 0;

  // Get session duration (prefer program-specific, fallback to program type)
  const sessionHours =
    program.sessionDuration || program.programType?.sessionHours || 1.5;

  for (const assignment of program.instructors) {
    // Count actual occurrences of work days in the month
    const sessionsInMonth = countWeekdaysInMonth(year, month, assignment.workDays);
    const hoursInMonth = sessionsInMonth * sessionHours;
    const baseWage = hoursInMonth * assignment.instructor.hourlyWage;
    
    // Add Icelandic employer overhead costs (social security, pension, etc.)
    const totalEmployerCost = baseWage * (1 + ICELAND_EMPLOYER_OVERHEAD);
    
    totalWages += totalEmployerCost;
  }

  return Math.round(totalWages);
}

/**
 * Calculate total instructor wages for a seasonal program
 * Includes Icelandic employer overhead costs
 */
export function calculateSeasonalInstructorWages(
  program: Program,
  season: Season
): number {
  let totalWages = 0;

  // Get session duration
  const sessionHours =
    program.sessionDuration || program.programType?.sessionHours || 1.5;

  // Calculate total weeks in season
  const seasonStart = new Date(season.startDate);
  const seasonEnd = new Date(season.endDate);
  const seasonDuration = seasonEnd.getTime() - seasonStart.getTime();
  const weeksInSeason = seasonDuration / (1000 * 60 * 60 * 24 * 7);

  for (const assignment of program.instructors) {
    const workDaysPerWeek = assignment.workDays.length;
    const totalSessions = workDaysPerWeek * weeksInSeason;
    const totalHours = totalSessions * sessionHours;
    const baseWage = totalHours * assignment.instructor.hourlyWage;
    
    // Add Icelandic employer overhead costs (social security, pension, etc.)
    const totalEmployerCost = baseWage * (1 + ICELAND_EMPLOYER_OVERHEAD);

    totalWages += totalEmployerCost;
  }

  return Math.round(totalWages);
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
  let totalInstructorWages = 0;

  for (const program of programs) {
    if (program.instructors && program.instructors.length > 0) {
      if (program.isMonthly) {
        // Monthly program - calculate for specific month
        totalInstructorWages += calculateMonthlyInstructorWages(
          program,
          month,
          year
        );
      } else if (currentSeason) {
        // Seasonal program - divide by 4 for consistent monthly view
        const seasonalWage = calculateSeasonalInstructorWages(
          program,
          currentSeason
        );
        totalInstructorWages += seasonalWage / 4;
      }
    }
  }

  return Math.round(totalInstructorWages);
}
