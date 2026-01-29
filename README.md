# Rinvoq Calculations

Personal medication inventory and profit tracking system.

## Features

- 📊 Track inventory (Silver & Purple tablets)
- 💰 Log orders and payments
- 📦 Record receipts with order matching
- 💊 Track personal consumption
- 💵 Record sales and calculate profits
- 📈 Real-time stock and profit summaries
- ⚙️ Configurable buffer days and pricing

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Deployment:** Vercel

## Setup Instructions

### 1. Prerequisites

Make sure you have installed:
- Node.js 18+ 
- npm or yarn

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

The `.env.local` file is already configured with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fnnevzwobfwqhyridvqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Database Setup

✅ **Already completed!** Your Supabase database is ready with:
- Tables: orders, receipts, consumption, sales, settings
- Views: stock_summary, profit_summary  
- Triggers: auto-update order status
- Default settings: 60 day buffer, 0.4125 BHD cost, 1.0 BHD sale price

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your User Account

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to Authentication → Users
3. Click "Add user" → Create user manually
4. Use your email and choose a password
5. Confirm the user (toggle to "Confirmed")

Now you can log in to the app!

## Deployment to Vercel

### Option 1: GitHub (Recommended)

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Import from GitHub
4. Select your repository
5. Vercel will auto-detect Next.js
6. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Click "Deploy"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, then:
vercel --prod
```

## Project Structure

```
rinvoq-tracker/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── orders/new/           # Log new order
│   ├── receipts/new/         # Log receipt
│   ├── consumption/new/      # Log consumption
│   ├── sales/new/            # Log sale
│   ├── history/              # Transaction history
│   ├── settings/             # App settings
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── lib/
│   └── supabase.ts           # Supabase client & types
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

## Usage Guide

### Dashboard
- **Quick Take**: Tap Silver or Purple to instantly log 1 tablet consumption
- **Current Stock**: View inventory by type and total days remaining
- **Financial Summary**: See reserved tablets, available to sell, and all-time profit
- **In Transit**: Track orders waiting for shipment

### Logging Transactions

**Order (💰 Paid)**
- When you pay supplier
- Enter: date, type, packets, amount paid
- System calculates: total tablets, cost per tablet

**Receipt (📦 Received)**
- When shipment arrives  
- Enter: date, type, packets
- Match to pending order (optional)
- System auto-updates order status

**Consumption (💊 Took)**
- Your personal use
- Enter: date, type, quantity
- Or use quick-take buttons on dashboard

**Sale (💵 Sold)**
- When you sell to customers
- Enter: date, type, quantity, revenue
- System calculates profit automatically

### Settings

- **Buffer Days**: Personal supply reserve (default 60)
- **Cost Per Tablet**: Your purchase cost (default 0.4125 BHD)
- **Sale Price**: Your selling price (default 1.0 BHD)

## Key Calculations

- **Current Stock** = Received - Consumed - Sold
- **Days Remaining** = Total Stock ÷ 1 tablet/day
- **Available to Sell** = Total Stock - Buffer Days
- **Profit** = Revenue - (Quantity × Cost Per Tablet)

## Database Schema

### Tables
- `orders` - Payments to supplier
- `receipts` - Shipments received
- `consumption` - Personal use
- `sales` - Sales to customers
- `settings` - App configuration

### Views
- `stock_summary` - Real-time stock by type
- `profit_summary` - Profit calculations by type

### Triggers
- Auto-update order status when receipts are logged (pending → partial → complete)

## Support

For issues or questions, check:
- Supabase logs: Dashboard → Logs
- Browser console: F12 → Console
- Next.js terminal output

## License

Personal use - Ahmed's Rinvoq tracking system
