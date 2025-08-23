'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProgramTypePage() {
  const [name, setName] = useState('')
  const [isMonthly, setIsMonthly] = useState(false)
  const [sessionHours, setSessionHours] = useState('1.5')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/program-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          isMonthly,
          sessionHours: parseFloat(sessionHours),
        }),
      })

      if (response.ok) {
        router.push('/program-types')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create program type')
      }
    } catch (error) {
      alert('Failed to create program type')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Program Type</h1>
          <p className="text-gray-600 mt-2">Define a new program type template for your archery club</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Program Type Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Advanced Training, Youth Programs"
            />
            <p className="mt-1 text-sm text-gray-500">
              Choose a descriptive name for this program type
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Billing Method
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="billingMethod"
                  checked={!isMonthly}
                  onChange={() => setIsMonthly(false)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Seasonal</div>
                  <div className="text-sm text-gray-500">
                    Billed per season (Spring, Summer, Fall). Best for structured training programs.
                  </div>
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="billingMethod"
                  checked={isMonthly}
                  onChange={() => setIsMonthly(true)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Monthly</div>
                  <div className="text-sm text-gray-500">
                    Billed monthly. Best for ongoing memberships and flexible access programs.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="sessionHours" className="block text-sm font-medium text-gray-700 mb-2">
              Session Duration (Hours)
            </label>
            <input
              type="number"
              id="sessionHours"
              value={sessionHours}
              onChange={(e) => setSessionHours(e.target.value)}
              min="0.5"
              max="8"
              step="0.5"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1.5"
            />
            <p className="mt-1 text-sm text-gray-500">
              {isMonthly 
                ? 'For monthly programs, this can be set to 0 if not applicable'
                : 'How long each training session lasts for seasonal programs'
              }
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">Examples</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Seasonal Examples:</strong> Adult Training (1.5h), Kids Training (1.5h), U21 Training (2h)</p>
              <p><strong>Monthly Examples:</strong> Monthly Pass (0h), Open Access (0h)</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Program Type'}
            </button>
            <Link
              href="/program-types"
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