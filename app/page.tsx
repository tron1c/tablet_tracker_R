'use client'

import { useEffect, useState } from 'react'
import { supabase, type StockSummary, type Settings, type Order } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default function Dashboard() {
  const [stock, setStock] = useState<StockSummary[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [allTimeProfit, setAllTimeProfit] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      // Load stock
      const { data: stockData } = await supabase
        .from('stock_summary')
        .select('*')
      
      // Load settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .single()
      
      // Load pending/partial orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'partial'])
        .order('order_date', { ascending: false })
      
      // Calculate all-time profit
      const { data: profitData } = await supabase
        .from('profit_summary')
        .select('*')
      
      const totalProfit = profitData?.reduce((sum, p) => sum + (Number(p.total_profit) || 0), 0) || 0

      setStock(stockData || [])
      setSettings(settingsData)
      setPendingOrders(ordersData || [])
      setAllTimeProfit(totalProfit)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  async function quickTakeTablet(type: 'silver' | 'purple') {
    try {
      const { error } = await supabase
        .from('consumption')
        .insert({
          consumption_date: new Date().toISOString().split('T')[0],
          type,
          quantity: 1
        })

      if (error) throw error
      
      // Reload dashboard
      await loadDashboardData()
      alert(`✓ Took 1 ${type} tablet`)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to log tablet consumption')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const silverStock = stock.find(s => s.type === 'silver')?.current_stock || 0
  const purpleStock = stock.find(s => s.type === 'purple')?.current_stock || 0
  const totalStock = silverStock + purpleStock
  const daysRemaining = totalStock
  const bufferDays = settings?.buffer_days || 60
  const availableToSell = Math.max(0, totalStock - bufferDays)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Rinvoq Calculations</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Take Buttons */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Quick Take Tablet</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => quickTakeTablet('silver')}
              className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors"
            >
              💊 Take Silver
            </button>
            <button
              onClick={() => quickTakeTablet('purple')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors"
            >
              💊 Take Purple
            </button>
          </div>
        </div>

        {/* Current Stock */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Current Stock</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Silver:</span>
              <span className="text-2xl font-bold text-gray-900">{silverStock} tablets</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Purple:</span>
              <span className="text-2xl font-bold text-purple-600">{purpleStock} tablets</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total:</span>
                <span className="text-3xl font-bold text-gray-900">{totalStock} tablets</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Days Remaining:</span>
                <span className="text-lg font-semibold text-blue-600">{daysRemaining} days</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">(at 1 tablet/day)</p>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Financial Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Reserved ({bufferDays} days):</span>
              <span className="text-lg font-semibold text-gray-700">{bufferDays} tablets</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Available to Sell:</span>
              <span className="text-lg font-semibold text-green-600">{availableToSell} tablets</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">All-Time Profit:</span>
                <span className="text-2xl font-bold text-green-600">{allTimeProfit.toFixed(3)} BHD</span>
              </div>
            </div>
          </div>
        </div>

        {/* In Transit */}
        {pendingOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Waiting for Shipments</h2>
            <div className="space-y-3">
              {pendingOrders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">{order.type}: {order.tablets - order.tablets_received} tablets</p>
                      <p className="text-sm text-gray-500">Paid: {order.amount_paid.toFixed(3)} BHD ({order.order_date})</p>
                      {order.tablets_received > 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          Partial: {order.tablets_received}/{order.tablets} received
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <a href="/orders/new" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-6 rounded-lg text-center transition-colors">
            <div className="text-3xl mb-2">💰</div>
            <div>Paid Order</div>
          </a>
          <a href="/receipts/new" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-6 px-6 rounded-lg text-center transition-colors">
            <div className="text-3xl mb-2">📦</div>
            <div>Received</div>
          </a>
          <a href="/consumption/new" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 px-6 rounded-lg text-center transition-colors">
            <div className="text-3xl mb-2">💊</div>
            <div>Took Tablet</div>
          </a>
          <a href="/sales/new" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 px-6 rounded-lg text-center transition-colors">
            <div className="text-3xl mb-2">💵</div>
            <div>Made Sale</div>
          </a>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4">
          <a href="/history" className="bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-lg text-center transition-colors">
            📊 History
          </a>
          <a href="/settings" className="bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-lg text-center transition-colors">
            ⚙️ Settings
          </a>
        </div>
      </div>
    </div>
  )
}
