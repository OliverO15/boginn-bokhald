'use client'

import { useState } from 'react'

interface Season {
  id: string
  name: string
  startDate: Date
  endDate: Date
}

interface Year {
  id: string
  year: number
  seasons: Season[]
}

interface VenuePaymentFormProps {
  years: Year[]
}

export default function VenuePaymentForm({ years }: VenuePaymentFormProps) {
  const [selectedYear, setSelectedYear] = useState(years[0]?.id || '')
  const [paymentType, setPaymentType] = useState<'monthly' | 'seasonal'>('monthly')
  const [selectedSeason, setSelectedSeason] = useState('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedYearData = years.find(y => y.id === selectedYear)
  const currentYear = new Date().getFullYear()
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedYear || !amount) {
      alert('Please fill in all required fields')
      return
    }

    if (paymentType === 'seasonal' && !selectedSeason) {
      alert('Please select a season')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/venue-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yearId: selectedYear,
          seasonId: paymentType === 'seasonal' ? selectedSeason : null,
          month: paymentType === 'monthly' ? month : null,
          amount: parseInt(amount.replace(/,/g, '')), // Remove commas from formatted number
          description: description.trim() || null,
          paidDate: new Date(paidDate)
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to record payment')
      }

      // Reset form
      setAmount('')
      setDescription('')
      setPaidDate(new Date().toISOString().split('T')[0])
      
      // Refresh the page to show new payment
      window.location.reload()
      
    } catch (error) {
      console.error('Error recording payment:', error)
      alert(error instanceof Error ? error.message : 'Failed to record payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format amount with commas as user types
  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/,/g, '')
    if (/^\d*$/.test(numericValue)) {
      setAmount(numericValue ? parseInt(numericValue).toLocaleString() : '')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Year Selection */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
            Year *
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Year</option>
            {years.map((year) => (
              <option key={year.id} value={year.id}>
                {year.year}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Type *
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="paymentType"
                value="monthly"
                checked={paymentType === 'monthly'}
                onChange={(e) => setPaymentType(e.target.value as 'monthly')}
                className="form-radio"
              />
              <span className="ml-2">Monthly</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="paymentType"
                value="seasonal"
                checked={paymentType === 'seasonal'}
                onChange={(e) => setPaymentType(e.target.value as 'seasonal')}
                className="form-radio"
              />
              <span className="ml-2">Seasonal</span>
            </label>
          </div>
        </div>

        {/* Month Selection (for monthly payments) */}
        {paymentType === 'monthly' && (
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
              Month *
            </label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {monthNames.map((monthName, index) => (
                <option key={index + 1} value={index + 1}>
                  {monthName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Season Selection (for seasonal payments) */}
        {paymentType === 'seasonal' && selectedYearData && (
          <div>
            <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-2">
              Season *
            </label>
            <select
              id="season"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Season</option>
              {selectedYearData.seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (ISK) *
          </label>
          <input
            type="text"
            id="amount"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Date Paid */}
        <div>
          <label htmlFor="paidDate" className="block text-sm font-medium text-gray-700 mb-2">
            Date Paid *
          </label>
          <input
            type="date"
            id="paidDate"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Additional notes about this payment..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Recording...' : '💰 Record Payment'}
        </button>
      </div>
    </form>
  )
}