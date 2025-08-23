import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      include: {
        programType: true,
        year: true
      },
      orderBy: [
        { year: { year: 'desc' } },
        { programType: { name: 'asc' } }
      ]
    })

    return NextResponse.json(programs)
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}