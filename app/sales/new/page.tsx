'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function NewSale() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'silver' as 'silver' | 'purple',
    quantity: '',
    revenue: ''
  })

  const calculatedProfit = formData.quantity && formData.revenue
    ? (parseFloat(formData.revenue) - (parseInt(formData.quantity) * 0.4125)).toFixed(3)
    : '0.000'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('sales')
        .insert({
          sale_date: formData.date,
          type: formData.type,
          quantity: parseInt(formData.quantity),
          revenue: parseFloat(formData.revenue)
        })

      if (error) throw error

      alert('✓ Sale logged successfully')
      router.push('/')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to log sale')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => router.back()} className="mr-4 text-gray-600 hover:text-gray-900">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Log Sale</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'silver' })}
                className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                  formData.type === 'silver'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Silver
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'purple' })}
                className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                  formData.type === 'purple'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Purple
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity (tablets)
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Number of tablets sold"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Revenue (BHD)
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={formData.revenue}
              onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="0.000"
              required
            />
            {formData.quantity && formData.revenue && (
              <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-600">Auto-calculated profit:</p>
                <p className="text-2xl font-bold text-green-600">+{calculatedProfit} BHD</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : 'Submit Sale'}
          </button>
        </form>
      </div>
    </div>
  )
}
