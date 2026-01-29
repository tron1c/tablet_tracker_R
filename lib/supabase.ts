import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type TabletType = 'silver' | 'purple'
export type OrderStatus = 'pending' | 'partial' | 'complete'

export interface Order {
  id: string
  created_at: string
  order_date: string
  type: TabletType
  packets: number
  tablets: number
  amount_paid: number
  status: OrderStatus
  tablets_received: number
}

export interface Receipt {
  id: string
  created_at: string
  receipt_date: string
  type: TabletType
  packets: number
  tablets: number
  order_id: string | null
  notes: string | null
}

export interface Consumption {
  id: string
  created_at: string
  consumption_date: string
  type: TabletType
  quantity: number
}

export interface Sale {
  id: string
  created_at: string
  sale_date: string
  type: TabletType
  quantity: number
  revenue: number
}

export interface Settings {
  id: string
  buffer_days: number
  cost_per_tablet: number
  sale_price_per_tablet: number
  updated_at: string
}

export interface StockSummary {
  type: TabletType
  current_stock: number
}

export interface ProfitSummary {
  type: TabletType
  tablets_sold: number
  total_revenue: number
  total_cost: number
  total_profit: number
}
