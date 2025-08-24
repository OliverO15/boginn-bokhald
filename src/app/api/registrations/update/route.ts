import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/registrations/update - Update registration quantity for a specific pricing option
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { programId, month, pricingOptionId, quantity } = body

    if (!programId || !month || !pricingOptionId || quantity === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields: programId, month, pricingOptionId, quantity' },
        { status: 400 }
      )
    }

    // Ensure quantity is not negative
    const safeQuantity = Math.max(0, parseInt(quantity))

    // Update registration in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find or create registration for this program/month
      let registration = await tx.registration.findFirst({
        where: {
          programId,
          month: parseInt(month)
        },
        include: {
          entries: true
        }
      })

      if (!registration) {
        // Create new registration
        registration = await tx.registration.create({
          data: {
            programId,
            month: parseInt(month),
            // Legacy fields (set to 0 for now)
            fullRegistrations: 0,
            halfRegistrations: 0,
            subscriptionRegistrations: 0
          },
          include: {
            entries: true
          }
        })
      }

      // Find existing entry for this pricing option
      const existingEntry = registration.entries.find(
        entry => entry.pricingOptionId === pricingOptionId
      )

      if (existingEntry) {
        if (safeQuantity === 0) {
          // Remove entry if quantity is 0
          await tx.registrationEntry.delete({
            where: { id: existingEntry.id }
          })
        } else {
          // Update existing entry
          await tx.registrationEntry.update({
            where: { id: existingEntry.id },
            data: { quantity: safeQuantity }
          })
        }
      } else if (safeQuantity > 0) {
        // Create new entry only if quantity > 0
        await tx.registrationEntry.create({
          data: {
            registrationId: registration.id,
            pricingOptionId,
            quantity: safeQuantity
          }
        })
      }

      return registration
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Registration updated successfully',
      registrationId: result.id 
    })

  } catch (error) {
    console.error('Error updating registration:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}