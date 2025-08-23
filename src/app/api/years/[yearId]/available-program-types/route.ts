import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ yearId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { yearId } = await params

    // Get all program types
    const allProgramTypes = await prisma.programType.findMany({
      orderBy: { name: 'asc' }
    })

    // Get already configured program types for this year
    const configuredPrograms = await prisma.program.findMany({
      where: { yearId },
      select: { programTypeId: true }
    })

    const configuredProgramTypeIds = new Set(configuredPrograms.map(p => p.programTypeId))

    // Filter out already configured program types
    const availableProgramTypes = allProgramTypes.filter(
      pt => !configuredProgramTypeIds.has(pt.id)
    )

    return NextResponse.json(availableProgramTypes)
  } catch (error) {
    console.error('Error fetching available program types:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}