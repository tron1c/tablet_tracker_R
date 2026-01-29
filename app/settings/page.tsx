'use client'

import { useEffect, useState } from 'react'
import { supabase, type Settings } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [formData, setFormData] = useState({
    bufferDays: '60',
    costPerTablet: '0.4125',
    salePrice: '1.0'
  })

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .single()

      if (data) {
        setSettings(data)
        setFormData({
          bufferDays: data.buffer_days.toString(),
          costPerTablet: data.cost_per_tablet.toString(),
          salePrice: data.sale_price_per_tablet.toString()
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      if (!settings) return

      const { error } = await supabase
        .from('settings')
        .update({
          buffer_days: parseInt(formData.bufferDays),
          cost_per_tablet: parseFloat(formData.costPerTablet),
          sale_price_per_tablet: parseFloat(formData.salePrice),
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id)

      if (error) throw error

      alert('✓ Settings updated successfully')
      router.push('/')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to update settings')
    } finally {
      setSaving(false)
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
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => router.back()} className="mr-4 text-gray-600 hover:text-gray-900">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buffer Days (Personal Supply Reserve)
            </label>
            <input
              type="number"
              min="0"
              value={formData.bufferDays}
              onChange={(e) => setFormData({ ...formData, bufferDays: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-2 text-sm text-gray-600">
              Number of days of personal supply to keep reserved. This amount won't be counted as "available to sell".
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost Per Tablet (BHD)
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={formData.costPerTablet}
              onChange={(e) => setFormData({ ...formData, costPerTablet: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-2 text-sm text-gray-600">
              Your purchase cost per tablet. Used for profit calculations.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sale Price Per Tablet (BHD)
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={formData.salePrice}
              onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-2 text-sm text-gray-600">
              Your selling price per tablet. Reference only.
            </p>
          </div>

          {/* Summary */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Profit Per Tablet</h3>
            <p className="text-2xl font-bold text-green-600">
              {(parseFloat(formData.salePrice) - parseFloat(formData.costPerTablet)).toFixed(4)} BHD
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ({((parseFloat(formData.salePrice) - parseFloat(formData.costPerTablet)) / parseFloat(formData.salePrice) * 100).toFixed(1)}% margin)
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Update Settings'}
          </button>
        </form>
      </div>
    </div>
  )
}
