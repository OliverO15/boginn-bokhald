'use client'

import { useState, useEffect } from 'react'
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
      month?: number
      seasonId?: string
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
  currentSeason?: {
    id: string
    name: string
  } | null
  isMonthly: boolean
}

export function ProgramCard({ program, currentMonth, currentSeason, isMonthly }: ProgramCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [localQuantities, setLocalQuantities] = useState<Map<string, number>>(new Map())
  
  // Find appropriate registration (monthly or seasonal)
  const currentRegistration = isMonthly 
    ? program.registrations.find(r => r.month === currentMonth)
    : program.registrations.find(r => r.seasonId === currentSeason?.id)
  
  // For monthly programs, also find previous month's registration for persistence
  const previousMonthRegistration = isMonthly 
    ? program.registrations.find(r => r.month === currentMonth - 1)
    : null

  // Initialize local quantities from current registration or previous month (for monthly programs)
  useEffect(() => {
    const initialQuantities = new Map<string, number>()
    
    if (currentRegistration) {
      // Use current month's registration
      currentRegistration.entries.forEach(entry => {
        initialQuantities.set(entry.pricingOption.id, entry.quantity)
      })
    } else if (isMonthly && previousMonthRegistration) {
      // For monthly programs with no current registration, copy from previous month
      previousMonthRegistration.entries.forEach(entry => {
        initialQuantities.set(entry.pricingOption.id, entry.quantity)
      })
    }
    
    setLocalQuantities(initialQuantities)
  }, [program.id, currentMonth, currentRegistration, previousMonthRegistration, isMonthly])

  // Get quantity for display (local changes take precedence)
  const getQuantity = (pricingOptionId: string): number => {
    if (localQuantities.has(pricingOptionId)) {
      return localQuantities.get(pricingOptionId) || 0
    }
    
    // Fallback to current registration
    if (currentRegistration) {
      const entry = currentRegistration.entries.find(e => e.pricingOption.id === pricingOptionId)
      return entry?.quantity || 0
    }
    
    // For monthly programs, fallback to previous month
    if (isMonthly && previousMonthRegistration) {
      const entry = previousMonthRegistration.entries.find(e => e.pricingOption.id === pricingOptionId)
      return entry?.quantity || 0
    }
    
    return 0
  }

  // Calculate totals based on current display quantities
  let totalRevenue = 0
  let totalVenueCosts = 0
  let hasRegistrations = false

  program.pricingOptions.forEach(option => {
    const quantity = getQuantity(option.id)
    if (quantity > 0) {
      hasRegistrations = true
      const revenue = quantity * option.price
      const venueCost = revenue * ((program.venueSplitPercentNew || program.venueSplitPercent) / 100)
      totalRevenue += revenue
      totalVenueCosts += venueCost
    }
  })

  const totalProfit = totalRevenue - totalVenueCosts

  // Local quantity update (no API call)
  const updateLocalQuantity = (pricingOptionId: string, newQuantity: number) => {
    const safeQuantity = Math.max(0, newQuantity)
    setLocalQuantities(prev => {
      const updated = new Map(prev)
      updated.set(pricingOptionId, safeQuantity)
      return updated
    })
    setHasChanges(true)
  }

  // Apply all changes to the server
  const applyChanges = async () => {
    setIsUpdating(true)
    
    try {
      // Send all changes in parallel
      const updates = Array.from(localQuantities.entries()).map(([pricingOptionId, quantity]) => 
        fetch('/api/registrations/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            programId: program.id,
            month: isMonthly ? currentMonth : undefined,
            seasonId: isMonthly ? undefined : currentSeason?.id,
            pricingOptionId,
            quantity
          })
        })
      )

      const results = await Promise.all(updates)
      
      // Check if all requests succeeded
      const allSucceeded = results.every(response => response.ok)
      
      if (allSucceeded) {
        setHasChanges(false)
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        console.error('Some registration updates failed')
        alert('Some updates failed. Please try again.')
      }
    } catch (error) {
      console.error('Error applying changes:', error)
      alert('Failed to apply changes. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Reset changes
  const resetChanges = () => {
    const originalQuantities = new Map<string, number>()
    
    if (currentRegistration) {
      currentRegistration.entries.forEach(entry => {
        originalQuantities.set(entry.pricingOption.id, entry.quantity)
      })
    } else if (isMonthly && previousMonthRegistration) {
      previousMonthRegistration.entries.forEach(entry => {
        originalQuantities.set(entry.pricingOption.id, entry.quantity)
      })
    }
    
    setLocalQuantities(originalQuantities)
    setHasChanges(false)
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
          const currentQuantity = getQuantity(option.id)
          const hasLocalChanges = localQuantities.has(option.id) && 
            (!currentRegistration || !currentRegistration.entries.find(e => e.pricingOption.id === option.id) || 
             currentQuantity !== (currentRegistration.entries.find(e => e.pricingOption.id === option.id)?.quantity || 0))

          return (
            <div key={option.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{option.name}:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateLocalQuantity(option.id, currentQuantity - 1)}
                  disabled={isUpdating || currentQuantity <= 0}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                >
                  ➖
                </button>
                <span className={`w-8 text-center font-mono text-sm ${hasLocalChanges ? 'text-orange-600 font-bold' : ''}`}>
                  {currentQuantity}
                </span>
                <button
                  onClick={() => updateLocalQuantity(option.id, currentQuantity + 1)}
                  disabled={isUpdating}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                >
                  ➕
                </button>
              </div>
            </div>
          )
        })}
        
        {/* Apply/Reset buttons */}
        {hasChanges && (
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={applyChanges}
              disabled={isUpdating}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Applying...' : 'Apply Changes'}
            </button>
            <button
              onClick={resetChanges}
              disabled={isUpdating}
              className="px-3 py-2 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        )}
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
        
        {/* Temporary Debug Info */}
        <div className="text-xs text-gray-500 border-t pt-2">
          <div>Debug: Regs={program.registrations.length}, Current={currentRegistration ? 'Found' : 'None'}</div>
          <div>Season: {currentSeason?.id?.slice(-8)}, IsMonthly: {isMonthly ? 'Yes' : 'No'}</div>
          <div>Entries: {currentRegistration?.entries.length || 0}</div>
          {isMonthly && !currentRegistration && previousMonthRegistration && (
            <div className="text-orange-600">Using prev month: {previousMonthRegistration.entries.length} entries</div>
          )}
          {hasChanges && (
            <div className="text-blue-600">Has unsaved changes</div>
          )}
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