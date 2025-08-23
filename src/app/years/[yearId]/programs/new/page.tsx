'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProgramType {
  id: string
  name: string
  isMonthly: boolean
  sessionHours: number
}

interface PageProps {
  params: Promise<{ yearId: string }>
}

export default function NewProgramPage({ params }: PageProps) {
  const [yearId, setYearId] = useState<string>('')
  const [programTypes, setProgramTypes] = useState<ProgramType[]>([])
  const [selectedProgramTypeId, setSelectedProgramTypeId] = useState('')
  const [fullPrice, setFullPrice] = useState('')
  const [halfPrice, setHalfPrice] = useState('')
  const [subscriptionPrice, setSubscriptionPrice] = useState('')
  const [venueSplitPercent, setVenueSplitPercent] = useState('50')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params
      setYearId(resolvedParams.yearId)
    }
    initializeParams()
  }, [params])

  useEffect(() => {
    if (yearId) {
      fetchAvailableProgramTypes()
    }
  }, [yearId])

  const fetchAvailableProgramTypes = async () => {
    try {
      const response = await fetch(`/api/years/${yearId}/available-program-types`)
      if (response.ok) {
        const data = await response.json()
        setProgramTypes(data)
      }
    } catch (error) {
      console.error('Failed to fetch program types:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/years/${yearId}/programs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programTypeId: selectedProgramTypeId,
          fullPrice: parseInt(fullPrice),
          halfPrice: halfPrice ? parseInt(halfPrice) : null,
          subscriptionPrice: subscriptionPrice ? parseInt(subscriptionPrice) : null,
          venueSplitPercent: parseFloat(venueSplitPercent),
        }),
      })

      if (response.ok) {
        router.push(`/years/${yearId}/programs`)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create program')
      }
    } catch (error) {
      alert('Failed to create program')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedProgramType = programTypes.find(pt => pt.id === selectedProgramTypeId)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Program</h1>
          <p className="text-gray-600 mt-2">Configure pricing and settings for a program type</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="programType" className="block text-sm font-medium text-gray-700 mb-2">
              Program Type
            </label>
            <select
              id="programType"
              value={selectedProgramTypeId}
              onChange={(e) => setSelectedProgramTypeId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a program type</option>
              {programTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.isMonthly ? 'Monthly' : 'Seasonal'})
                </option>
              ))}
            </select>
            {selectedProgramType && (
              <p className="mt-1 text-sm text-gray-500">
                {selectedProgramType.isMonthly 
                  ? 'Monthly program - charged per month'
                  : `Seasonal program - ${selectedProgramType.sessionHours} hours per session`
                }
              </p>
            )}
          </div>

          <div>
            <label htmlFor="fullPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Full Registration Price (ISK)
            </label>
            <input
              type="number"
              id="fullPrice"
              value={fullPrice}
              onChange={(e) => setFullPrice(e.target.value)}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 50000"
            />
          </div>

          <div>
            <label htmlFor="halfPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Half Registration Price (ISK) - Optional
            </label>
            <input
              type="number"
              id="halfPrice"
              value={halfPrice}
              onChange={(e) => setHalfPrice(e.target.value)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 25000"
            />
          </div>

          <div>
            <label htmlFor="subscriptionPrice" className="block text-sm font-medium text-gray-700 mb-2">
              With Subscription Price (ISK) - Optional
            </label>
            <input
              type="number"
              id="subscriptionPrice"
              value={subscriptionPrice}
              onChange={(e) => setSubscriptionPrice(e.target.value)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 61500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Additional fee for subscription-based registrations (used in some U21 programs)
            </p>
          </div>

          <div>
            <label htmlFor="venueSplit" className="block text-sm font-medium text-gray-700 mb-2">
              Venue Split Percentage (%)
            </label>
            <input
              type="number"
              id="venueSplit"
              value={venueSplitPercent}
              onChange={(e) => setVenueSplitPercent(e.target.value)}
              min="0"
              max="100"
              step="0.1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="50"
            />
            <p className="mt-1 text-sm text-gray-500">
              Percentage of revenue that goes to Bogfimisetrið (venue/equipment rental)
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Program'}
            </button>
            <Link
              href={`/years/${yearId}/programs`}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}