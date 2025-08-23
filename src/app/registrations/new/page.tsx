'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { calculateRevenue, calculateVenueCosts } from '@/lib/calculations'

interface Program {
  id: string
  fullPrice: number
  halfPrice: number | null
  subscriptionPrice: number | null
  venueSplitPercent: number
  programType: {
    id: string
    name: string
    isMonthly: boolean
    sessionHours: number
  }
  year: {
    id: string
    year: number
  }
}

interface Season {
  id: string
  name: string
  startDate: string
  endDate: string
}

export default function NewRegistrationPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [selectedSeasonId, setSelectedSeasonId] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [fullRegistrations, setFullRegistrations] = useState('')
  const [halfRegistrations, setHalfRegistrations] = useState('')
  const [subscriptionRegistrations, setSubscriptionRegistrations] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const selectedProgram = programs.find(p => p.id === selectedProgramId)

  useEffect(() => {
    fetchPrograms()
  }, [])

  useEffect(() => {
    if (selectedProgram && !selectedProgram.programType.isMonthly) {
      fetchSeasons(selectedProgram.year.id)
    } else {
      setSeasons([])
      setSelectedSeasonId('')
    }
  }, [selectedProgram])

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs')
      if (response.ok) {
        const data = await response.json()
        setPrograms(data)
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error)
    }
  }

  const fetchSeasons = async (yearId: string) => {
    try {
      const response = await fetch(`/api/years/${yearId}/seasons`)
      if (response.ok) {
        const data = await response.json()
        setSeasons(data)
      }
    } catch (error) {
      console.error('Failed to fetch seasons:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const registrationData = {
        programId: selectedProgramId,
        seasonId: selectedProgram?.programType.isMonthly ? null : selectedSeasonId,
        month: selectedProgram?.programType.isMonthly ? parseInt(selectedMonth) : null,
        fullRegistrations: parseInt(fullRegistrations) || 0,
        halfRegistrations: parseInt(halfRegistrations) || 0,
        subscriptionRegistrations: parseInt(subscriptionRegistrations) || 0,
      }

      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      if (response.ok) {
        router.push('/registrations')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create registration')
      }
    } catch (error) {
      alert('Failed to create registration')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate preview values
  const revenue = selectedProgram ? calculateRevenue(
    {
      fullRegistrations: parseInt(fullRegistrations) || 0,
      halfRegistrations: parseInt(halfRegistrations) || 0,
      subscriptionRegistrations: parseInt(subscriptionRegistrations) || 0
    },
    {
      fullPrice: selectedProgram.fullPrice,
      halfPrice: selectedProgram.halfPrice,
      subscriptionPrice: selectedProgram.subscriptionPrice,
      venueSplitPercent: selectedProgram.venueSplitPercent
    }
  ) : 0

  const venueCosts = selectedProgram ? calculateVenueCosts(revenue, selectedProgram.venueSplitPercent) : 0
  const netProfit = revenue - venueCosts

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Registration</h1>
          <p className="text-gray-600 mt-2">Enter student registration numbers for a program</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6">
              <div>
                <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2">
                  Program
                </label>
                <select
                  id="program"
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.year.year} - {program.programType.name} 
                      ({program.programType.isMonthly ? 'Monthly' : 'Seasonal'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProgram && (
                <>
                  {/* Period Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {selectedProgram.programType.isMonthly ? 'Month' : 'Season'}
                    </label>
                    {selectedProgram.programType.isMonthly ? (
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a month</option>
                        {monthNames.map((month, index) => (
                          <option key={index + 1} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={selectedSeasonId}
                        onChange={(e) => setSelectedSeasonId(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a season</option>
                        {seasons.map((season) => (
                          <option key={season.id} value={season.id}>
                            {season.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Registration Numbers */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="fullRegistrations" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Registrations
                      </label>
                      <input
                        type="number"
                        id="fullRegistrations"
                        value={fullRegistrations}
                        onChange={(e) => setFullRegistrations(e.target.value)}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {selectedProgram.fullPrice.toLocaleString()} ISK each
                      </p>
                    </div>

                    {selectedProgram.halfPrice && (
                      <div>
                        <label htmlFor="halfRegistrations" className="block text-sm font-medium text-gray-700 mb-2">
                          Half Registrations
                        </label>
                        <input
                          type="number"
                          id="halfRegistrations"
                          value={halfRegistrations}
                          onChange={(e) => setHalfRegistrations(e.target.value)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {selectedProgram.halfPrice.toLocaleString()} ISK each
                        </p>
                      </div>
                    )}

                    {selectedProgram.subscriptionPrice && (
                      <div>
                        <label htmlFor="subscriptionRegistrations" className="block text-sm font-medium text-gray-700 mb-2">
                          With Subscription
                        </label>
                        <input
                          type="number"
                          id="subscriptionRegistrations"
                          value={subscriptionRegistrations}
                          onChange={(e) => setSubscriptionRegistrations(e.target.value)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {selectedProgram.subscriptionPrice.toLocaleString()} ISK each
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Adding...' : 'Add Registration'}
                    </button>
                    <Link
                      href="/registrations"
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-center"
                    >
                      Cancel
                    </Link>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Preview</h3>
              
              {selectedProgram ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium text-green-600">
                      {revenue.toLocaleString()} ISK
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Venue Cost ({selectedProgram.venueSplitPercent}%):</span>
                    <span className="font-medium text-red-600">
                      -{venueCosts.toLocaleString()} ISK
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Net Profit:</span>
                      <span className={`font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {netProfit.toLocaleString()} ISK
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
                    <p><strong>Note:</strong> This preview shows revenue and venue costs only. 
                    Instructor wages will be calculated separately based on scheduled sessions.</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Select a program to see financial preview</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}