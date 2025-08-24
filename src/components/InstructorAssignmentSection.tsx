'use client'

import { useState } from 'react'

interface InstructorAssignmentSectionProps {
  program: {
    id: string
    isMonthly?: boolean | null
    instructors: {
      id: string
      instructorId: string
      workDays: any // JSON field
      instructor: {
        id: string
        name: string
        hourlyWage: number
      }
    }[]
  }
  availableInstructors: {
    id: string
    name: string
    hourlyWage: number
  }[]
  currentSeason?: {
    id: string
    name: string
  } | null
}

const WEEK_DAYS = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' }
]

export function InstructorAssignmentSection({ 
  program, 
  availableInstructors, 
  currentSeason 
}: InstructorAssignmentSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedInstructor, setSelectedInstructor] = useState('')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Filter out already assigned instructors
  const unassignedInstructors = availableInstructors.filter(
    instructor => !program.instructors.some(pi => pi.instructorId === instructor.id)
  )

  const handleAddInstructor = async () => {
    if (!selectedInstructor || selectedDays.length === 0) {
      setError('Please select an instructor and at least one work day')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/program-instructors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          programId: program.id,
          instructorId: selectedInstructor,
          seasonId: program.isMonthly ? null : currentSeason?.id,
          workDays: selectedDays
        })
      })

      if (response.ok) {
        // Refresh the page to show the new assignment
        window.location.reload()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to assign instructor')
      }
    } catch (error) {
      setError('An error occurred while assigning instructor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveInstructor = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this instructor assignment?')) {
      return
    }

    try {
      const response = await fetch(`/api/program-instructors/${assignmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to remove instructor assignment')
      }
    } catch (error) {
      alert('An error occurred while removing instructor assignment')
    }
  }

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">👨‍🏫 Assigned Instructors</h2>
        {unassignedInstructors.length > 0 && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            ➕ Assign Instructor
          </button>
        )}
      </div>

      {/* Current Assignments */}
      <div className="space-y-3 mb-6">
        {program.instructors.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No instructors assigned yet</p>
        ) : (
          program.instructors.map((assignment) => (
            <div key={assignment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium">{assignment.instructor.name}</div>
                <div className="text-sm text-gray-600">
                  {assignment.instructor.hourlyWage.toLocaleString()} ISK/hour • {(assignment.workDays as string[]).join(', ')}
                </div>
              </div>
              <button
                onClick={() => handleRemoveInstructor(assignment.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                🗑️ Remove
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Instructor Form */}
      {showAddForm && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign New Instructor</h3>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Instructor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Instructor
              </label>
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose an instructor...</option>
                {unassignedInstructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.name} ({instructor.hourlyWage.toLocaleString()} ISK/hour)
                  </option>
                ))}
              </select>
            </div>

            {/* Work Days Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Days
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {WEEK_DAYS.map((day) => (
                  <label key={day.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day.value)}
                      onChange={() => handleDayToggle(day.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setSelectedInstructor('')
                  setSelectedDays([])
                  setError('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInstructor}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Assigning...' : 'Assign Instructor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No available instructors */}
      {unassignedInstructors.length === 0 && program.instructors.length > 0 && (
        <div className="text-center py-4 text-sm text-gray-500">
          All available instructors are already assigned. 
          <a href="/instructors/new" className="text-blue-600 hover:text-blue-800 ml-1">
            Add new instructor
          </a>
        </div>
      )}

      {/* No instructors at all */}
      {availableInstructors.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm mb-2">No instructors found.</p>
          <a
            href="/instructors/new"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Create your first instructor →
          </a>
        </div>
      )}
    </div>
  )
}