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
cd D:\P_w_Claude
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
CREATE DATABASE invoiceflow;

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

```env
# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/invoiceflow

# Auth (generate a random 32+ character string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-for-production
JWT_EXPIRES_IN=7d

# Claude API (get your key from https://console.anthropic.com/)
CLAUDE_API_KEY=sk-ant-your-api-key-here

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

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
invoiceflow/
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
```

## API Endpoints (Phase 1)

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Health Check
- `GET /api/health` - Check API status

## Development Workflow

### Phase 1: ✅ COMPLETE
- Monorepo setup with workspaces
- Backend with Express + TypeScript + Prisma
- PostgreSQL database schema
- JWT authentication system
- Frontend with React + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- Login and Register pages
- Protected routes

### Phase 2: Coming Next
- Enhanced dashboard layout
- Navigation with user menu
- Mobile responsive design

### Future Phases
- Client management (Phase 3)
- Invoice creation (Phase 4)
- AI OCR integration (Phase 5)
- Natural language processing (Phase 6)
- PDF export (Phase 7)
- Payment tracking (Phase 8)
- Search and polish (Phase 9)
- Demo data and deployment (Phase 10)

## Troubleshooting

### Database Connection Issues

If you see "Can't reach database server":
1. Ensure PostgreSQL is running
2. Check your DATABASE_URL in `.env`
3. Verify the database exists: `psql -U postgres -l`

### Port Already in Use

If port 3001 or 5173 is taken:
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.ts`

### Module Not Found Errors

If you see module errors:
```bash
# Clear node_modules and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
cd frontend && npm install
cd ../backend && npm install
```

### Prisma Issues

If Prisma client is out of sync:
```bash
cd backend
npx prisma generate
```

## Getting Claude API Key

1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Add it to `backend/.env` as `CLAUDE_API_KEY`

## Scripts Reference

### Root Directory
- `npm run dev` - Run both frontend and backend
- `npm run build` - Build both projects for production

### Backend
- `npm run dev` - Start development server
- `npm run build` - Compile TypeScript
- `npm start` - Run production build
- `npx prisma studio` - Open Prisma database GUI

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Next Steps

Phase 1 is complete! The foundation is solid. Here's what's next:

1. **Test the authentication** - Try registering and logging in
2. **Verify database** - Check that users are being created in PostgreSQL
3. **Get your Claude API key** - You'll need this for AI features in Phase 5-6
4. **Familiarize yourself with the codebase** - Explore the file structure

## Support

This is a university FIP project. For issues or questions:
- Check the troubleshooting section above
- Review the inline code comments
- Check Prisma documentation: https://www.prisma.io/docs
- Check React Query docs: https://tanstack.com/query/latest

## License

This is a university project. All rights reserved.

---

**Built with Claude Code** 🤖
