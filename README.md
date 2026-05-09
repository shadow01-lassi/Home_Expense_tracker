# 🏠 HomeExpense - Family Expense Management App

A production-grade household expense management application with real-time multi-user syncing, beautiful analytics, smart insights, and budget management.

![HomeExpense](https://img.shields.io/badge/Version-1.0.0-6366f1) ![Next.js](https://img.shields.io/badge/Next.js-14-000000) ![Express](https://img.shields.io/badge/Express-4.x-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248) ![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101)

## ✨ Features

- **Multi-User Family System** — Create/join family workspaces with invite codes
- **Real-Time Sync** — Instant updates across all devices via Socket.io
- **19+ Expense Categories** — Predefined + custom categories with icons
- **Beautiful Dashboard** — Summary cards, pie charts, bar charts, trends
- **Smart Insights** — AI-like financial analysis ("Groceries up 18%")
- **Budget Management** — Total + category-wise budgets with alerts
- **Reports & Export** — Download PDF and Excel reports
- **Search & Filters** — Filter by category, user, date, payment method
- **Dark/Light Mode** — Theme switching with system preference
- **Firebase Auth** — Email/password + Google Sign-In
- **Mobile-First** — Responsive design for all screen sizes
- **Admin Panel** — User management, activity logs

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | Firebase Authentication |
| Real-time | Socket.io |
| Charts | Recharts |
| Export | jsPDF, SheetJS |
| Icons | Lucide React |
| Animations | Framer Motion |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Firebase project (for auth)

### 1. Clone & Install

```bash
cd "HomeExpense Tracker app"
npm run install:all
```

### 2. Configure Environment

**Server** (`server/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/homeexpense
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key"
```

**Client** (`client/.env.local`):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Seed Database (Optional)

```bash
npm run seed
```

This creates 5 sample users, 40+ expenses, budgets, and categories.

### 4. Run Development

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Health: http://localhost:5000/api/health

### Dev Mode Login

Without Firebase configured, use the **Dev Mode Login** button on the login page with a seeded user ID.

## 📁 Project Structure

```
├── client/                  # Next.js frontend
│   └── src/
│       ├── app/             # Pages (App Router)
│       │   ├── dashboard/   # Main app pages
│       │   ├── login/       # Auth pages
│       │   └── page.tsx     # Landing page
│       ├── contexts/        # Auth, Theme, Socket contexts
│       └── lib/             # API client, utilities
│
├── server/                  # Express backend
│   └── src/
│       ├── config/          # DB, Firebase config
│       ├── controllers/     # Business logic
│       ├── middleware/      # Auth, error handling
│       ├── models/          # Mongoose schemas
│       ├── routes/          # API routes
│       ├── services/        # Insights engine
│       └── socket/          # Socket.io handlers
│
└── package.json             # Root workspace
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register/sync user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/family/create` | Create family |
| POST | `/api/family/join` | Join via invite code |
| GET/POST | `/api/expenses` | List/add expenses |
| GET | `/api/analytics/summary` | Dashboard summary |
| GET | `/api/analytics/insights` | Smart insights |
| GET/POST | `/api/budgets` | Get/set budgets |
| GET | `/api/budgets/status` | Budget overview |

## 🎨 Design

- **Colors**: Indigo primary, Emerald accent, Amber warnings
- **Typography**: Inter (Google Fonts)
- **Effects**: Glassmorphism, gradient cards, micro-animations
- **Dark Mode**: Full dark theme support

## 📱 Responsive Breakpoints

- **Mobile** (<640px): Bottom navigation, stacked layout
- **Tablet** (640-1024px): Collapsible sidebar
- **Desktop** (1024px+): Full sidebar, multi-column

## 🔒 Security

- Firebase Authentication (JWT tokens)
- Server-side token verification via Firebase Admin
- Role-based access control (admin/member)
- Input validation via express-validator
- CORS & Helmet security headers
- Mongoose schema validation

## 🚢 Deployment

**Frontend**: Deploy `client/` to Vercel
```bash
cd client && npx vercel
```

**Backend**: Deploy `server/` to Render/Railway
- Set environment variables
- Start command: `npm start`
- Build command: `npm install`

---

Built with ❤️ for Indian households
