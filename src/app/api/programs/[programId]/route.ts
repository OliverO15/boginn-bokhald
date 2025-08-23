import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ programId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { programId } = await params

    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        programType: true,
        year: true
      }
    })

    if (!program) {
      return NextResponse.json(
        { message: 'Program not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(program)
  } catch (error) {
    console.error('Error fetching program:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { programId } = await params
    const body = await request.json()
    const { fullPrice, halfPrice, subscriptionPrice, venueSplitPercent } = body

    // Validate required fields
    if (!fullPrice || venueSplitPercent === undefined) {
      return NextResponse.json(
        { message: 'Full price and venue split are required' },
        { status: 400 }
      )
    }

    // Check if program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id: programId }
    })

    if (!existingProgram) {
      return NextResponse.json(
        { message: 'Program not found' },
        { status: 404 }
      )
    }

    // Update the program
    const updatedProgram = await prisma.program.update({
      where: { id: programId },
      data: {
        fullPrice: parseInt(fullPrice),
        halfPrice: halfPrice ? parseInt(halfPrice) : null,
        subscriptionPrice: subscriptionPrice ? parseInt(subscriptionPrice) : null,
        venueSplitPercent: parseFloat(venueSplitPercent),
      },
      include: {
        programType: true,
        year: true
      }
    })

    return NextResponse.json(updatedProgram)
  } catch (error) {
    console.error('Error updating program:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { programId } = await params

    // Check if program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        registrations: true,
        instructors: true
      }
    })

    if (!existingProgram) {
      return NextResponse.json(
        { message: 'Program not found' },
        { status: 404 }
      )
    }

    // Check if program has associated data
    if (existingProgram.registrations.length > 0) {
      return NextResponse.json(
        { message: 'Cannot delete program with existing registrations' },
        { status: 400 }
      )
    }

    // Delete associated instructor assignments first
    await prisma.programInstructor.deleteMany({
      where: { programId }
    })

    // Delete the program
    await prisma.program.delete({
      where: { id: programId }
    })

    return NextResponse.json({ message: 'Program deleted successfully' })
  } catch (error) {
    console.error('Error deleting program:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}