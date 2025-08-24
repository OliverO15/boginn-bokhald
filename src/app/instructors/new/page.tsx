'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewInstructorPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    hourlyWage: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/instructors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/instructors')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create instructor')
      }
    } catch (error) {
      setError('An error occurred while creating the instructor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

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
              <h1 className="text-3xl font-bold text-gray-900">➕ Add New Instructor</h1>
              <p className="text-gray-600 mt-1">
                Create a new instructor profile
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
                <p className="text-sm text-gray-600 mt-1">
                  The hourly rate for this instructor (e.g., 8000 ISK per hour)
                </p>
              </div>

              {/* Preview */}
              {formData.name && formData.hourlyWage && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Preview</h3>
                  <div className="text-sm text-blue-800">
                    <div><strong>Name:</strong> {formData.name}</div>
                    <div><strong>Hourly Rate:</strong> {parseInt(formData.hourlyWage || '0').toLocaleString()} ISK</div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
                  {isSubmitting ? 'Creating...' : 'Create Instructor'}
                </button>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">💡 Tips</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Enter the instructor's full name as it should appear in reports</li>
              <li>• Hourly wage will be used for calculating total instruction costs</li>
              <li>• You can assign instructors to programs after creating their profile</li>
              <li>• Wages can be updated later if rates change</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}