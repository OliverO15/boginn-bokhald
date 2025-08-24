import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { yearId, seasonId, month, amount, description, paidDate } = body

    // Validation
    if (!yearId || !amount || amount <= 0) {
      return NextResponse.json(
        { message: 'Year and positive amount are required' },
        { status: 400 }
      )
    }

    if (!seasonId && !month) {
      return NextResponse.json(
        { message: 'Either season or month must be specified' },
        { status: 400 }
      )
    }

    // Check if payment already exists for this period
    const existingPayment = await prisma.venuePayment.findFirst({
      where: {
        yearId,
        seasonId,
        month
      }
    })

    if (existingPayment) {
      return NextResponse.json(
        { message: 'A payment already exists for this period. Please edit or delete the existing one first.' },
        { status: 400 }
      )
    }

    // Create the venue payment
    const venuePayment = await prisma.venuePayment.create({
      data: {
        yearId,
        seasonId: seasonId || null,
        month: month || null,
        amount: parseInt(amount),
        description: description || null,
        paidDate: new Date(paidDate)
      },
      include: {
        year: true,
        season: true
      }
    })

    return NextResponse.json(venuePayment)
  } catch (error) {
    console.error('Error creating venue payment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const venuePayments = await prisma.venuePayment.findMany({
      include: {
        year: true,
        season: true
      },
      orderBy: [
        { year: { year: 'desc' } },
        { month: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(venuePayments)
  } catch (error) {
    console.error('Error fetching venue payments:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Payment ID is required' },
        { status: 400 }
      )
    }

    const venuePayment = await prisma.venuePayment.delete({
      where: { id }
    })

    return NextResponse.json(venuePayment)
  } catch (error) {
    console.error('Error deleting venue payment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}