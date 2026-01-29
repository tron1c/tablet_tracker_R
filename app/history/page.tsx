'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Transaction = {
  id: string
  date: string
  type: 'order' | 'receipt' | 'consumption' | 'sale'
  tablet_type: 'silver' | 'purple'
  quantity: number
  amount?: number
  status?: string
}

export default function History() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'order' | 'receipt' | 'consumption' | 'sale'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'silver' | 'purple'>('all')

  useEffect(() => {
    loadTransactions()
  }, [])

  async function loadTransactions() {
    try {
      const [orders, receipts, consumption, sales] = await Promise.all([
        supabase.from('orders').select('*').order('order_date', { ascending: false }),
        supabase.from('receipts').select('*').order('receipt_date', { ascending: false }),
        supabase.from('consumption').select('*').order('consumption_date', { ascending: false }),
        supabase.from('sales').select('*').order('sale_date', { ascending: false })
      ])

      const allTransactions: Transaction[] = [
        ...(orders.data || []).map(o => ({
          id: o.id,
          date: o.order_date,
          type: 'order' as const,
          tablet_type: o.type,
          quantity: o.tablets,
          amount: o.amount_paid,
          status: o.status
        })),
        ...(receipts.data || []).map(r => ({
          id: r.id,
          date: r.receipt_date,
          type: 'receipt' as const,
          tablet_type: r.type,
          quantity: r.tablets
        })),
        ...(consumption.data || []).map(c => ({
          id: c.id,
          date: c.consumption_date,
          type: 'consumption' as const,
          tablet_type: c.type,
          quantity: c.quantity
        })),
        ...(sales.data || []).map(s => ({
          id: s.id,
          date: s.sale_date,
          type: 'sale' as const,
          tablet_type: s.type,
          quantity: s.quantity,
          amount: s.revenue
        }))
      ]

      allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setTransactions(allTransactions)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false
    if (typeFilter !== 'all' && t.tablet_type !== typeFilter) return false
    return true
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return '💰'
      case 'receipt': return '📦'
      case 'consumption': return '💊'
      case 'sale': return '💵'
      default: return '•'
    }
  }

  const getLabel = (type: string) => {
    switch (type) {
      case 'order': return 'Paid Order'
      case 'receipt': return 'Received'
      case 'consumption': return 'Took'
      case 'sale': return 'Sold'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => router.back()} className="mr-4 text-gray-600 hover:text-gray-900">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="order">Orders</option>
                <option value="receipt">Receipts</option>
                <option value="consumption">Consumption</option>
                <option value="sale">Sales</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tablet Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="silver">Silver</option>
                <option value="purple">Purple</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No transactions found
            </div>
          ) : (
            filteredTransactions.map(transaction => (
              <div key={`${transaction.type}-${transaction.id}`} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{getIcon(transaction.type)}</div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {getLabel(transaction.type)} - {transaction.quantity} {transaction.tablet_type} tablet{transaction.quantity !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-gray-600">{transaction.date}</p>
                      {transaction.amount && (
                        <p className="text-sm text-gray-700 font-medium mt-1">
                          {transaction.amount.toFixed(3)} BHD
                        </p>
                      )}
                      {transaction.status && (
                        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                          transaction.status === 'complete' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'partial' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
