# Bharat Inventory Manager AI (BIM AI) — Product Vision

> The Next Generation AI-Powered Inventory & Business Management Platform.

This document captures the long-term product vision for BIM AI. It describes
the full scope of the platform this project is working towards — most of it
is **not yet implemented**. See [`README.md`](./README.md) for what currently
exists (the Owner Dashboard MVP) and how to run it.

## Project vision

Create a fully cloud-based, open-source AI-powered Inventory ERP for:

- Retail Shops
- Grocery Stores
- Medical Stores
- Electronics Stores
- Clothing Stores
- Hardware Shops
- Restaurants
- Warehouses
- Small Businesses
- Wholesalers
- Distributors

Along with a customer shopping application connected in real time.

## Overall system

```
                       ┌──────────────────────┐
                       │    AI Cloud Engine    │
                       └───────────┬───────────┘
              ┌────────────────────┼────────────────────┐
        Owner Dashboard      Employee Portal        Customer App
              │                    │                     │
              └──────────────Cloud Database───────────────┘
                    Storage + Authentication
                    AI Recommendation
                    Analytics + Automation
```

## Technology stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, React Query, Zustand
- **Backend:** Supabase (Postgres, Auth, Storage)
- **Deployment:** Vercel, with GitHub Actions for CI — free tiers initially
- **AI:** OpenRouter API (GPT OSS, DeepSeek, Qwen, Llama, Gemma, Mistral)
- **Charts:** Tremor, Recharts, Apache ECharts
- **Notifications:** Novu, OneSignal
- **Payments:** Razorpay, Stripe
- **Maps:** OpenStreetMap

## Applications

1. **Owner Dashboard** — complete ERP
2. **Employee Dashboard** — limited permissions
3. **Customer Shopping App** — browse, buy, track orders, wishlist, AI recommendations
4. **Admin Panel** — manage everything

## Modules

- **Inventory** — products, categories, brands, variants, stock, warehouses, barcode/QR, batch, expiry, suppliers
- **Sales** — POS, online/offline orders, GST invoice, discounts, coupons, refunds
- **Customers** — profiles, purchase history, reward points, membership, wallet, credit balance
- **Supplier** — dashboard, purchase orders, outstanding payments, delivery status
- **Finance** — expenses, income, cash flow, profit, tax, reports
- **Employee** — attendance, salary, tasks, permissions, roles
- **CRM** — leads, customer notes, follow-ups, AI CRM assistant
- **Analytics** — daily/weekly/monthly/yearly/custom

## AI features

- AI Inventory Assistant ("Which products should I restock?")
- AI Demand Forecast
- AI Smart Purchase (suggested order quantities)
- AI Price Optimizer
- AI Supplier Recommendation (price, delivery, rating)
- AI Business Health Score
- AI Customer Insights (loyal / inactive / high spenders)
- AI Fraud Detection
- AI Expense Analyzer
- AI Voice Assistant ("Add 20 Coca-Cola bottles.")
- AI OCR (invoice → products, GST, quantities, supplier)
- AI Barcode Detection (phone camera)
- AI Receipt Scanner
- AI Chatbot (business assistant)
- AI Marketing (WhatsApp/email/SMS/social copy)
- AI Review Analysis
- AI Product Description generation
- AI Auto Translation (multi-language product names)
- AI Image Generator (product banners)
- AI Smart Search (natural language)
- AI Reports ("Show me profit for last month.")
- AI Recommendation Engine — frequently bought together, similar products, trending, personalized

## Customer application

Login, browse, search, categories, cart, wishlist, AI shopping assistant,
voice search, image search, offers, coupons, wallet, order tracking, live
inventory, notifications, ratings, reviews, loyalty points, referral system,
subscription orders.

## Design direction

Glassmorphism, floating cards, animated charts, AI assistant sidebar, dark/light
mode, command palette, dynamic widgets, Apple-inspired minimal UI, keyboard
shortcuts.

## Security

Row-Level Security (RLS), JWT authentication, MFA, API rate limiting, audit
logs, encrypted storage, automatic backups.

## Database tables (target)

users, businesses, stores, employees, customers, suppliers, products,
product_images, categories, brands, warehouses, inventory, stock_movements,
purchase_orders, sales_orders, invoices, payments, expenses, returns, reviews,
loyalty_points, coupons, notifications, ai_logs, audit_logs, analytics_events.

## Architecture (target)

```
Customer App
      │
      ▼
API Gateway
      │
──────────────────────────────
 Authentication
 Inventory Service
 Customer Service
 Order Service
 Payment Service
 AI Service
 Analytics Service
 Notification Service
 OCR Service
 Recommendation Engine
──────────────────────────────
          │
 PostgreSQL / Storage / Redis (optional)
```

## Workflow (target)

1. Owner adds products.
2. Inventory syncs to the cloud.
3. Customer app instantly displays available stock.
4. Customer places an order.
5. Inventory updates automatically.
6. AI recommends related products.
7. Owner receives analytics and low-stock alerts.
8. Supplier purchase orders are suggested automatically.
9. AI generates sales reports and forecasts.
10. Marketing campaigns are generated based on customer behavior.

## Future roadmap

Multi-store management, franchise support, offline-first sync, PWA, Android &
iOS apps (React Native / Flutter), IoT integration (barcode scanners, smart
shelves, weighing scales), WhatsApp ordering bot, voice-controlled POS,
computer vision stock counting, predictive maintenance, multi-language,
multi-currency and GST/VAT support, public REST API and webhooks, plugin
marketplace.

## Current status

Implemented so far: authenticated **Owner Dashboard** with Products,
Categories, and Suppliers CRUD, stock/expiry overview, backed by Supabase
with Row-Level Security. Everything else in this document is roadmap.
