import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ registrationId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { registrationId } = await params

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        program: {
          include: {
            programType: true,
            year: true
          }
        },
        season: true
      }
    })

    if (!registration) {
      return NextResponse.json(
        { message: 'Registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error fetching registration:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { registrationId } = await params
    const body = await request.json()
    const { fullRegistrations, halfRegistrations, subscriptionRegistrations } = body

    // Check if registration exists
    const existingRegistration = await prisma.registration.findUnique({
      where: { id: registrationId }
    })

    if (!existingRegistration) {
      return NextResponse.json(
        { message: 'Registration not found' },
        { status: 404 }
      )
    }

    // Update the registration
    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        fullRegistrations: parseInt(fullRegistrations) || 0,
        halfRegistrations: parseInt(halfRegistrations) || 0,
        subscriptionRegistrations: parseInt(subscriptionRegistrations) || 0,
      },
      include: {
        program: {
          include: {
            programType: true,
            year: true
          }
        },
        season: true
      }
    })

    return NextResponse.json(updatedRegistration)
  } catch (error) {
    console.error('Error updating registration:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { registrationId } = await params

    // Check if registration exists
    const existingRegistration = await prisma.registration.findUnique({
      where: { id: registrationId }
    })

    if (!existingRegistration) {
      return NextResponse.json(
        { message: 'Registration not found' },
        { status: 404 }
      )
    }

    // Delete the registration
    await prisma.registration.delete({
      where: { id: registrationId }
    })

    return NextResponse.json({ message: 'Registration deleted successfully' })
  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}