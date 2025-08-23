import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ yearId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { yearId } = await params

    // Check if year exists
    const year = await prisma.year.findUnique({
      where: { id: yearId }
    })

    if (!year) {
      return NextResponse.json(
        { message: 'Year not found' },
        { status: 404 }
      )
    }

    // Get existing seasons for this year
    let seasons = await prisma.season.findMany({
      where: { yearId },
      orderBy: { name: 'asc' }
    })

    // If no seasons exist, create default seasons
    if (seasons.length === 0) {
      const defaultSeasons = [
        {
          name: 'Spring',
          startDate: new Date(`${year.year}-01-01`),
          endDate: new Date(`${year.year}-04-30`),
          yearId
        },
        {
          name: 'Summer',
          startDate: new Date(`${year.year}-05-01`),
          endDate: new Date(`${year.year}-08-31`),
          yearId
        },
        {
          name: 'Fall',
          startDate: new Date(`${year.year}-09-01`),
          endDate: new Date(`${year.year}-12-31`),
          yearId
        }
      ]

      // Create default seasons
      for (const seasonData of defaultSeasons) {
        await prisma.season.create({ data: seasonData })
      }

      // Fetch the newly created seasons
      seasons = await prisma.season.findMany({
        where: { yearId },
        orderBy: { name: 'asc' }
      })
    }

    return NextResponse.json(seasons)
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}