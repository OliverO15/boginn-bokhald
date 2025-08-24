'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Instructor {
  id: string
  name: string
  hourlyWage: number
  programAssignments: {
    id: string
    program: {
      id: string
      name: string | null
      programType: {
        name: string
      } | null
      year: {
        year: number
      }
    }
    workDays: string[]
  }[]
}

export default function EditInstructorPage() {
  const router = useRouter()
  const params = useParams()
  const instructorId = params.instructorId as string

  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    hourlyWage: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Load instructor data
  useEffect(() => {
    const loadInstructor = async () => {
      try {
        const response = await fetch(`/api/instructors/${instructorId}`)
        if (response.ok) {
          const data = await response.json()
          setInstructor(data)
          setFormData({
            name: data.name,
            hourlyWage: data.hourlyWage.toString()
          })
        } else {
          setError('Failed to load instructor')
        }
      } catch (error) {
        setError('An error occurred while loading instructor')
      } finally {
        setLoading(false)
      }
    }

    loadInstructor()
  }, [instructorId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/instructors/${instructorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/instructors')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to update instructor')
      }
    } catch (error) {
      setError('An error occurred while updating the instructor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this instructor? This cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/instructors/${instructorId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/instructors')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to delete instructor')
      }
    } catch (error) {
      setError('An error occurred while deleting the instructor')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading instructor...</p>
        </div>
      </div>
    )
  }

  if (!instructor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Instructor Not Found</h1>
            <p className="text-gray-600 mb-6">The instructor you're looking for doesn't exist or has been deleted.</p>
            <Link
              href="/instructors"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Instructors
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const canDelete = instructor.programAssignments.length === 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/instructors"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Instructors
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">✏️ Edit Instructor</h1>
              <p className="text-gray-600 mt-1">
                Update instructor information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Instructor Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter instructor's full name"
                />
              </div>

              {/* Hourly Wage */}
              <div>
                <label htmlFor="hourlyWage" className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Wage (ISK) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="hourlyWage"
                    name="hourlyWage"
                    value={formData.hourlyWage}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 8000"
                  />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">ISK</span>
                </div>
              </div>

              {/* Program Assignments */}
              {instructor.programAssignments.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Current Assignments</h3>
                  <div className="space-y-2">
                    {instructor.programAssignments.map((assignment) => (
                      <div key={assignment.id} className="bg-white rounded px-3 py-2 text-sm">
                        <div className="font-medium">
                          {assignment.program.name || assignment.program.programType?.name}
                        </div>
                        <div className="text-gray-600">
                          {assignment.program.year.year} • {assignment.workDays.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div>
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isDeleting ? 'Deleting...' : '🗑️ Delete Instructor'}
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Cannot delete - instructor has active assignments
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-4">
                  <Link
                    href="/instructors"
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Instructor'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}