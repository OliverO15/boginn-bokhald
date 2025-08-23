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

interface PricingOption {
  id?: string
  name: string
  price: number
  order: number
  isActive: boolean
}

interface PageProps {
  params: Promise<{ yearId: string }>
}

export default function NewFlexibleProgramPage({ params }: PageProps) {
  const [yearId, setYearId] = useState<string>('')
  const [programTypes, setProgramTypes] = useState<ProgramType[]>([])
  const [selectedProgramTypeId, setSelectedProgramTypeId] = useState('')
  const [programName, setProgramName] = useState('')
  const [sessionDuration, setSessionDuration] = useState('1.5')
  const [isMonthly, setIsMonthly] = useState(false)
  const [venueSplitPercent, setVenueSplitPercent] = useState('50')
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([
    { name: 'Full Season', price: 50000, order: 0, isActive: true }
  ])
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

  const addPricingOption = () => {
    setPricingOptions([
      ...pricingOptions,
      { 
        name: '', 
        price: 0, 
        order: pricingOptions.length, 
        isActive: true 
      }
    ])
  }

  const removePricingOption = (index: number) => {
    if (pricingOptions.length > 1) {
      setPricingOptions(pricingOptions.filter((_, i) => i !== index))
    }
  }

  const updatePricingOption = (index: number, field: keyof PricingOption, value: any) => {
    const updated = [...pricingOptions]
    updated[index] = { ...updated[index], [field]: value }
    setPricingOptions(updated)
  }

  const movePricingOption = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === pricingOptions.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const updated = [...pricingOptions]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp

    // Update order values
    updated[index].order = index
    updated[newIndex].order = newIndex

    setPricingOptions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate pricing options
    if (pricingOptions.some(po => !po.name.trim() || po.price <= 0)) {
      alert('All pricing options must have a name and a positive price')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/programs/flexible', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yearId,
          programTypeId: selectedProgramTypeId || null,
          name: programName.trim() || null,
          sessionDuration: parseFloat(sessionDuration),
          isMonthly,
          venueSplitPercent: parseFloat(venueSplitPercent),
          pricingOptions: pricingOptions.map((po, index) => ({
            name: po.name.trim(),
            price: po.price,
            order: index,
            isActive: po.isActive
          }))
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Flexible Program</h1>
          <p className="text-gray-600 mt-2">Create a program with fully customizable pricing options and settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Program Configuration */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Program Configuration</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="programType" className="block text-sm font-medium text-gray-700 mb-2">
                  Program Type (Optional)
                </label>
                <select
                  id="programType"
                  value={selectedProgramTypeId}
                  onChange={(e) => setSelectedProgramTypeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">None (Fully Custom)</option>
                  {programTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.isMonthly ? 'Monthly' : 'Seasonal'})
                    </option>
                  ))}
                </select>
                {selectedProgramType && (
                  <p className="mt-1 text-sm text-gray-500">
                    Default: {selectedProgramType.sessionHours}h sessions, {selectedProgramType.isMonthly ? 'monthly' : 'seasonal'}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="programName" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Program Name (Optional)
                </label>
                <input
                  type="text"
                  id="programName"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., U16 Advanced Spring Training"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty to use program type name
                </p>
              </div>

              <div>
                <label htmlFor="sessionDuration" className="block text-sm font-medium text-gray-700 mb-2">
                  Session Duration (Hours)
                </label>
                <input
                  type="number"
                  id="sessionDuration"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                  min="0.5"
                  max="8"
                  step="0.5"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                />
                <p className="mt-1 text-sm text-gray-500">
                  Percentage of revenue that goes to Bogfimisetrið
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isMonthly}
                  onChange={(e) => setIsMonthly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Monthly program (charged per month)</span>
              </label>
            </div>
          </div>

          {/* Pricing Options */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Pricing Options</h2>
              <button
                type="button"
                onClick={addPricingOption}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                + Add Pricing Option
              </button>
            </div>

            <div className="space-y-4">
              {pricingOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option.name}
                      onChange={(e) => updatePricingOption(index, 'name', e.target.value)}
                      placeholder="Pricing option name (e.g., Full Season, Student Rate)"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      value={option.price}
                      onChange={(e) => updatePricingOption(index, 'price', parseInt(e.target.value) || 0)}
                      placeholder="Price"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="text-sm text-gray-600">ISK</div>
                  
                  {/* Move buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => movePricingOption(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => movePricingOption(index, 'down')}
                      disabled={index === pricingOptions.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Active toggle */}
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={option.isActive}
                      onChange={(e) => updatePricingOption(index, 'isActive', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-xs text-gray-600">Active</span>
                  </label>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removePricingOption(index)}
                    disabled={pricingOptions.length <= 1}
                    className="text-red-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-gray-500">
              You can reorder pricing options using the ▲▼ buttons. Inactive options will not be shown to users but can be reactivated later.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? 'Creating Program...' : 'Create Flexible Program'}
            </button>
            <Link
              href={`/years/${yearId}/programs`}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors text-center font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}