# 🏠 HomeExpense - Family Expense Management App

A production-grade household expense management application with real-time multi-user syncing, beautiful analytics, smart insights, and budget management.

![HomeExpense](https://img.shields.io/badge/Version-1.0.0-6366f1) ![Next.js](https://img.shields.io/badge/Next.js-15-000000) ![Express](https://img.shields.io/badge/Express-4.x-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248) ![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101)

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
- **Custom Authentication** — Secure JWT-based local authentication
- **Mobile-First** — Responsive design for all screen sizes
- **Admin Panel** — User management, activity logs

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | Custom JWT Authentication (bcryptjs + jsonwebtoken) |
| Real-time | Socket.io |
| Charts | Recharts |
| Export | jsPDF, SheetJS |
| Icons | Lucide React |
| Animations | Framer Motion |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone https://github.com/shadow01-lassi/Home_Expense_tracker.git
cd Home_Expense_tracker
npm run install:all
```

### 2. Configure Environment

**Server** (`server/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/homeexpense
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key_here
```

**Client** (`client/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

### 3. Run Development

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5001
- API Health: http://localhost:5001/api/health

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
│       ├── config/          # DB config
│       ├── controllers/     # Business logic
│       ├── middleware/      # Auth, error handling
│       ├── models/          # Mongoose schemas
│       ├── routes/          # API routes
│       ├── services/        # Insights engine
│       └── socket/          # Socket.io handlers
│
└── package.json             # Root workspace
```

## 🎨 Design

- **Colors**: Indigo primary, Emerald accent, Amber warnings
- **Typography**: Inter (Google Fonts)
- **Effects**: Glassmorphism, gradient cards, micro-animations
- **Dark Mode**: Full dark theme support

## 🔒 Security

- Secure JWT-based Authentication
- Password hashing via bcryptjs
- Role-based access control (admin/member)
- Input validation via express-validator
- CORS & Helmet security headers
- Mongoose schema validation

## 🚢 Deployment

**1. Database (MongoDB Atlas)**
- Create a free cluster on MongoDB Atlas
- Get the connection string and set `MONGODB_URI` on your backend

**2. Backend (Render / Railway)**
- Connect your GitHub repository to Render as a "Web Service"
- Root Directory: `server`
- Start Command: `npm start`
- Add Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`

**3. Frontend (Vercel)**
- Connect your GitHub repository to Vercel
- Root Directory: `client`
- Add Environment Variables: `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` (pointing to your Render backend)

---

Built with ❤️ for Indian households
