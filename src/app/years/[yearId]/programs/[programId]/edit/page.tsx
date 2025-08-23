'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
}

interface PageProps {
  params: Promise<{ yearId: string; programId: string }>
}

export default function EditProgramPage({ params }: PageProps) {
  const [yearId, setYearId] = useState<string>('')
  const [programId, setProgramId] = useState<string>('')
  const [program, setProgram] = useState<Program | null>(null)
  const [fullPrice, setFullPrice] = useState('')
  const [halfPrice, setHalfPrice] = useState('')
  const [subscriptionPrice, setSubscriptionPrice] = useState('')
  const [venueSplitPercent, setVenueSplitPercent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params
      setYearId(resolvedParams.yearId)
      setProgramId(resolvedParams.programId)
    }
    initializeParams()
  }, [params])

  useEffect(() => {
    if (programId) {
      fetchProgram()
    }
  }, [programId])

  const fetchProgram = async () => {
    try {
      const response = await fetch(`/api/programs/${programId}`)
      if (response.ok) {
        const data = await response.json()
        setProgram(data)
        setFullPrice(data.fullPrice.toString())
        setHalfPrice(data.halfPrice?.toString() || '')
        setSubscriptionPrice(data.subscriptionPrice?.toString() || '')
        setVenueSplitPercent(data.venueSplitPercent.toString())
      } else {
        alert('Failed to load program')
        router.push(`/years/${yearId}/programs`)
      }
    } catch (error) {
      console.error('Failed to fetch program:', error)
      alert('Failed to load program')
      router.push(`/years/${yearId}/programs`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        alert(error.message || 'Failed to update program')
      }
    } catch (error) {
      alert('Failed to update program')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push(`/years/${yearId}/programs`)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to delete program')
      }
    } catch (error) {
      alert('Failed to delete program')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">Loading program...</div>
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center text-red-600">Program not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit {program.programType.name}</h1>
          <p className="text-gray-600 mt-2">Update pricing and settings for this program</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">Program Type Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Type:</strong> {program.programType.isMonthly ? 'Monthly' : 'Seasonal'}</p>
              {!program.programType.isMonthly && (
                <p><strong>Session Duration:</strong> {program.programType.sessionHours} hours</p>
              )}
            </div>
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
              Additional fee for subscription-based registrations
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
              disabled={isSaving}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/years/${yearId}/programs`}
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
              Delete Program
            </button>
            <p className="mt-2 text-sm text-gray-500 text-center">
              This will permanently delete the program and all associated data.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}