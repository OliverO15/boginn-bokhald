'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ProgramCardProps {
  program: {
    id: string
    name: string | null
    programType?: { name: string } | null
    pricingOptions: {
      id: string
      name: string
      price: number
      order: number
    }[]
    registrations: {
      id: string
      month: number
      entries: {
        id: string
        quantity: number
        pricingOption: {
          id: string
          name: string
          price: number
        }
      }[]
    }[]
    venueSplitPercentNew?: number | null
    venueSplitPercent: number
  }
  currentMonth: number
  isMonthly: boolean
}

interface RegistrationUpdate {
  pricingOptionId: string
  quantity: number
}

export function ProgramCard({ program, currentMonth, isMonthly }: ProgramCardProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  
  // Find current month's registration
  const currentRegistration = program.registrations.find(r => r.month === currentMonth)
  
  // Create a map of current quantities
  const currentQuantities = new Map<string, number>()
  if (currentRegistration) {
    currentRegistration.entries.forEach(entry => {
      currentQuantities.set(entry.pricingOption.id, entry.quantity)
    })
  }

  // Calculate totals
  let totalRevenue = 0
  let totalVenueCosts = 0
  let hasRegistrations = false

  program.pricingOptions.forEach(option => {
    const quantity = currentQuantities.get(option.id) || 0
    if (quantity > 0) {
      hasRegistrations = true
      const revenue = quantity * option.price
      const venueCost = revenue * ((program.venueSplitPercentNew || program.venueSplitPercent) / 100)
      totalRevenue += revenue
      totalVenueCosts += venueCost
    }
  })

  const totalProfit = totalRevenue - totalVenueCosts

  const updateRegistration = async (pricingOptionId: string, newQuantity: number) => {
    setIsUpdating(pricingOptionId)
    
    try {
      const response = await fetch('/api/registrations/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: program.id,
          month: currentMonth,
          pricingOptionId,
          quantity: Math.max(0, newQuantity) // Ensure non-negative
        })
      })

      if (response.ok) {
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        console.error('Failed to update registration')
      }
    } catch (error) {
      console.error('Error updating registration:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const programDisplayName = program.name || program.programType?.name || 'Custom Program'

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${
      hasRegistrations ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{programDisplayName}</h3>
          <p className="text-sm text-gray-500">
            {isMonthly ? `${getCurrentMonthName(currentMonth)} ${new Date().getFullYear()}` : 'Season Program'}
          </p>
        </div>
        <div className="flex items-center">
          {hasRegistrations ? (
            <span className="text-green-600 text-xl">✅</span>
          ) : (
            <span className="text-gray-400 text-xl">⚪</span>
          )}
        </div>
      </div>

      {/* Registration Controls */}
      <div className="space-y-3 mb-4">
        {program.pricingOptions.map(option => {
          const currentQuantity = currentQuantities.get(option.id) || 0
          const isUpdatingThis = isUpdating === option.id

          return (
            <div key={option.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{option.name}:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateRegistration(option.id, currentQuantity - 1)}
                  disabled={isUpdatingThis || currentQuantity <= 0}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                >
                  ➖
                </button>
                <span className="w-8 text-center font-mono text-sm">
                  {isUpdatingThis ? '...' : currentQuantity}
                </span>
                <button
                  onClick={() => updateRegistration(option.id, currentQuantity + 1)}
                  disabled={isUpdatingThis}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                >
                  ➕
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Financial Summary */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center">💰 Revenue:</span>
          <span className="font-medium">{totalRevenue.toLocaleString()} ISK</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center">🏢 Venue Costs:</span>
          <span className="font-medium">{totalVenueCosts.toLocaleString()} ISK</span>
        </div>
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="flex items-center">📊 Net Profit:</span>
          <span className={totalProfit > 0 ? 'text-green-600' : 'text-gray-600'}>
            {totalProfit.toLocaleString()} ISK
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href={`/years/${program.id}/programs/${program.id}/details`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}

// Helper function to get month name
function getCurrentMonthName(monthNumber: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return monthNames[monthNumber - 1]
}