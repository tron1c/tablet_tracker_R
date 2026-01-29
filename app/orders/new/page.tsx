'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function NewOrder() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'silver' as 'silver' | 'purple',
    packets: '',
    amountPaid: ''
  })

  const tablets = formData.packets ? parseInt(formData.packets) * 10 : 0
  const pricePerTablet = formData.packets && formData.amountPaid 
    ? (parseFloat(formData.amountPaid) / tablets).toFixed(4)
    : '0.0000'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          order_date: formData.date,
          type: formData.type,
          packets: parseInt(formData.packets),
          tablets: tablets,
          amount_paid: parseFloat(formData.amountPaid)
        })

      if (error) throw error

      alert('✓ Order logged successfully')
      router.push('/')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to log order')
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
          <h1 className="text-2xl font-bold text-gray-900">Log Order Paid</h1>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              Packets
            </label>
            <input
              type="number"
              min="1"
              value={formData.packets}
              onChange={(e) => setFormData({ ...formData, packets: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Number of packets"
              required
            />
            {formData.packets && (
              <p className="mt-2 text-sm text-gray-600">
                = {tablets} tablets
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Paid (BHD)
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={formData.amountPaid}
              onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.000"
              required
            />
            {formData.packets && formData.amountPaid && (
              <p className="mt-2 text-sm text-gray-600">
                = {pricePerTablet} BHD per tablet
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : 'Submit Order'}
          </button>
        </form>
      </div>
    </div>
  )
}
