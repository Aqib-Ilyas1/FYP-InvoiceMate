# InvoiceFlow - AI-Powered Invoice Management System

A modern, full-stack invoice management application that leverages AI to transform invoice creation from 15 minutes to 30 seconds.

## Features

- **AI-Powered OCR**: Extract invoice data from images using Claude AI
- **Natural Language Processing**: Create invoices by typing "Invoice John for 5 hours at $100/hr"
- **Smart Invoice Editor**: Real-time calculations, client management, and line item tracking
- **PDF Export**: Professional invoice generation
- **Payment Tracking**: Monitor payment status and history
- **Client Database**: Manage all your clients in one place

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for lightning-fast builds
- Tailwind CSS for styling
- shadcn/ui components
- React Query for data fetching
- Zustand for state management

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Prisma ORM
- JWT authentication
- Claude AI API integration

## Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** (v9 or higher) - comes with Node.js

## Installation

### 1. Clone or Navigate to Project Directory

```bash
cd D:\InvoiceMate-FYP
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 3. Setup Database

Create a PostgreSQL database for the project:

```bash
# Connect to PostgreSQL (Windows)
psql -U postgres

# Create database
CREATE DATABASE invoiceMate;

# Exit psql
\q
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
copy ..\.env.example .env
```

Edit `backend/.env` with your actual values:

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

### 5. Run Database Migrations

```bash
# From the backend directory
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

## Running the Application

### Development Mode

From the **root directory**, run both frontend and backend simultaneously:

```bash
npm run dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:5173

### Run Separately (if needed)

**Backend only:**
```bash
cd backend
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

## First Steps

1. Open http://localhost:5173 in your browser
2. Click "Sign up" to create an account
3. Login with your new credentials
4. You'll see the dashboard (currently showing placeholder data)

## Project Structure

```
InvoiceMate-FYP/
├── backend/                 # Node.js + Express API
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   └── server.ts       # Entry point
│   └── package.json
│
├── frontend/                # React + TypeScript
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── lib/           # Utilities
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── package.json
│
├── shared/                 # Shared TypeScript types
│   └── types/
│       └── index.ts
│
├── .env.example           # Environment template
├── .gitignore
├── package.json           # Root package.json
└── README.md

