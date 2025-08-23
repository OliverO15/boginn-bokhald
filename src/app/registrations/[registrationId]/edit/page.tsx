'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { calculateRevenue, calculateVenueCosts } from '@/lib/calculations'

interface Registration {
  id: string
  fullRegistrations: number
  halfRegistrations: number
  subscriptionRegistrations: number
  month: number | null
  program: {
    id: string
    fullPrice: number
    halfPrice: number | null
    subscriptionPrice: number | null
    venueSplitPercent: number
    programType: {
      name: string
      isMonthly: boolean
    }
    year: {
      year: number
    }
  }
  season: {
    id: string
    name: string
  } | null
}

interface PageProps {
  params: Promise<{ registrationId: string }>
}

export default function EditRegistrationPage({ params }: PageProps) {
  const [registrationId, setRegistrationId] = useState<string>('')
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [fullRegistrations, setFullRegistrations] = useState('')
  const [halfRegistrations, setHalfRegistrations] = useState('')
  const [subscriptionRegistrations, setSubscriptionRegistrations] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params
      setRegistrationId(resolvedParams.registrationId)
    }
    initializeParams()
  }, [params])

  useEffect(() => {
    if (registrationId) {
      fetchRegistration()
    }
  }, [registrationId])

  const fetchRegistration = async () => {
    try {
      const response = await fetch(`/api/registrations/${registrationId}`)
      if (response.ok) {
        const data = await response.json()
        setRegistration(data)
        setFullRegistrations(data.fullRegistrations.toString())
        setHalfRegistrations(data.halfRegistrations.toString())
        setSubscriptionRegistrations(data.subscriptionRegistrations.toString())
      } else {
        alert('Failed to load registration')
        router.push('/registrations')
      }
    } catch (error) {
      console.error('Failed to fetch registration:', error)
      alert('Failed to load registration')
      router.push('/registrations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullRegistrations: parseInt(fullRegistrations) || 0,
          halfRegistrations: parseInt(halfRegistrations) || 0,
          subscriptionRegistrations: parseInt(subscriptionRegistrations) || 0,
        }),
      })

      if (response.ok) {
        router.push('/registrations')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update registration')
      }
    } catch (error) {
      alert('Failed to update registration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this registration? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/registrations')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to delete registration')
      }
    } catch (error) {
      alert('Failed to delete registration')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">Loading registration...</div>
        </div>
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center text-red-600">Registration not found</div>
        </div>
      </div>
    )
  }

  // Calculate preview values
  const revenue = calculateRevenue(
    {
      fullRegistrations: parseInt(fullRegistrations) || 0,
      halfRegistrations: parseInt(halfRegistrations) || 0,
      subscriptionRegistrations: parseInt(subscriptionRegistrations) || 0
    },
    {
      fullPrice: registration.program.fullPrice,
      halfPrice: registration.program.halfPrice,
      subscriptionPrice: registration.program.subscriptionPrice,
      venueSplitPercent: registration.program.venueSplitPercent
    }
  )

  const venueCosts = calculateVenueCosts(revenue, registration.program.venueSplitPercent)
  const netProfit = revenue - venueCosts

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Registration</h1>
          <p className="text-gray-600 mt-2">
            {registration.program.year.year} - {registration.program.programType.name}
            {registration.season ? ` (${registration.season.name})` : ` (${monthNames[registration.month! - 1]})`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900 mb-2">Program Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Program:</strong> {registration.program.programType.name}</p>
                  <p><strong>Year:</strong> {registration.program.year.year}</p>
                  <p><strong>Period:</strong> {registration.season ? registration.season.name : monthNames[registration.month! - 1]}</p>
                  <p><strong>Type:</strong> {registration.program.programType.isMonthly ? 'Monthly' : 'Seasonal'}</p>
                </div>
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
                    {registration.program.fullPrice.toLocaleString()} ISK each
                  </p>
                </div>

                {registration.program.halfPrice && (
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
                      {registration.program.halfPrice.toLocaleString()} ISK each
                    </p>
                  </div>
                )}

                {registration.program.subscriptionPrice && (
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
                      {registration.program.subscriptionPrice.toLocaleString()} ISK each
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <Link
                  href="/registrations"
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-center"
                >
                  Cancel
                </Link>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Registration
                </button>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  This will permanently delete this registration.
                </p>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Preview</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium text-green-600">
                    {revenue.toLocaleString()} ISK
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Venue Cost ({registration.program.venueSplitPercent}%):</span>
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
                  Instructor wages will be calculated separately.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}