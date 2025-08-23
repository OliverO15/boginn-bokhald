'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProgramType {
  id: string
  name: string
  isMonthly: boolean
  sessionHours: number
  programs: Array<{
    id: string
    year: {
      year: number
    }
  }>
}

interface PageProps {
  params: Promise<{ programTypeId: string }>
}

export default function EditProgramTypePage({ params }: PageProps) {
  const [programTypeId, setProgramTypeId] = useState<string>('')
  const [programType, setProgramType] = useState<ProgramType | null>(null)
  const [name, setName] = useState('')
  const [isMonthly, setIsMonthly] = useState(false)
  const [sessionHours, setSessionHours] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params
      setProgramTypeId(resolvedParams.programTypeId)
    }
    initializeParams()
  }, [params])

  useEffect(() => {
    if (programTypeId) {
      fetchProgramType()
    }
  }, [programTypeId])

  const fetchProgramType = async () => {
    try {
      const response = await fetch(`/api/program-types/${programTypeId}`)
      if (response.ok) {
        const data = await response.json()
        setProgramType(data)
        setName(data.name)
        setIsMonthly(data.isMonthly)
        setSessionHours(data.sessionHours.toString())
      } else {
        alert('Failed to load program type')
        router.push('/program-types')
      }
    } catch (error) {
      console.error('Failed to fetch program type:', error)
      alert('Failed to load program type')
      router.push('/program-types')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/program-types/${programTypeId}`, {
        method: 'PUT',
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
        alert(error.message || 'Failed to update program type')
      }
    } catch (error) {
      alert('Failed to update program type')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!programType) return

    const usageCount = programType.programs.length
    const confirmMessage = usageCount > 0
      ? `This program type is used in ${usageCount} program(s). Deleting it will also delete all associated programs. This action cannot be undone. Are you sure?`
      : 'Are you sure you want to delete this program type? This action cannot be undone.'

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const response = await fetch(`/api/program-types/${programTypeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/program-types')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to delete program type')
      }
    } catch (error) {
      alert('Failed to delete program type')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">Loading program type...</div>
        </div>
      </div>
    )
  }

  if (!programType) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center text-red-600">Program type not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit {programType.name}</h1>
          <p className="text-gray-600 mt-2">Update the program type configuration</p>
        </div>

        {programType.programs.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">This program type is in use</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>This program type is currently used in {programType.programs.length} program(s) across years: {[...new Set(programType.programs.map(p => p.year.year))].join(', ')}</p>
                  <p className="mt-1">Changes will affect all associated programs.</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    Billed per season (Spring, Summer, Fall)
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
                    Billed monthly
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
              min="0"
              max="8"
              step="0.5"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              {isMonthly 
                ? 'For monthly programs, this can be set to 0 if not applicable'
                : 'How long each training session lasts'
              }
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
              href="/program-types"
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
              Delete Program Type
            </button>
            <p className="mt-2 text-sm text-gray-500 text-center">
              {programType.programs.length > 0 
                ? `This will delete the program type and all ${programType.programs.length} associated program(s).`
                : 'This will permanently delete the program type.'
              }
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}