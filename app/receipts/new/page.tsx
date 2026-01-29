'use client'

import { useState, useEffect } from 'react'
import { supabase, type Order } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function NewReceipt() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'silver' as 'silver' | 'purple',
    packets: '',
    orderId: null as string | null,
    notes: ''
  })

  useEffect(() => {
    loadPendingOrders()
  }, [formData.type])

  async function loadPendingOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('type', formData.type)
      .in('status', ['pending', 'partial'])
      .order('order_date', { ascending: false })
    
    setPendingOrders(data || [])
  }

  const tablets = formData.packets ? parseInt(formData.packets) * 10 : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('receipts')
        .insert({
          receipt_date: formData.date,
          type: formData.type,
          packets: parseInt(formData.packets),
          tablets: tablets,
          order_id: formData.orderId,
          notes: formData.notes || null
        })

      if (error) throw error

      alert('✓ Receipt logged successfully')
      router.push('/')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to log receipt')
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
          <h1 className="text-2xl font-bold text-gray-900">Log Receipt</h1>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                onClick={() => setFormData({ ...formData, type: 'silver', orderId: null })}
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
                onClick={() => setFormData({ ...formData, type: 'purple', orderId: null })}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Number of packets"
              required
            />
            {formData.packets && (
              <p className="mt-2 text-sm text-gray-600">
                = {tablets} tablets
              </p>
            )}
          </div>

          {pendingOrders.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Match to Order (Optional)
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, orderId: null })}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                    formData.orderId === null
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">No Match - Just Log Receipt</span>
                </button>
                {pendingOrders.map(order => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, orderId: order.id })}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                      formData.orderId === order.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.tablets} {order.type} tablets
                        </p>
                        <p className="text-sm text-gray-600">
                          Paid: {order.amount_paid.toFixed(3)} BHD ({order.order_date})
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Status: {order.tablets_received}/{order.tablets} received
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Any additional notes..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : 'Submit Receipt'}
          </button>
        </form>
      </div>
    </div>
  )
}
