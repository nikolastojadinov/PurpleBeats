# PurpleBeats - Codespace Development Guide

Welcome to PurpleBeats! This guide will help you get started with development in GitHub Codespace.

## 🚀 Quick Start

### 1. Open in Codespace
Click the "Code" button on GitHub and select "Open with Codespaces" → "New codespace".

### 2. Automatic Setup
The Codespace will automatically:
- Install Node.js 20 and dependencies
- Set up PostgreSQL database
- Configure environment variables
- Run database migrations

### 3. Start Development Server
```bash
npm run dev:setup
```

The application will be available at `http://localhost:5000` and will automatically open in a preview tab.

## 📋 Manual Setup (if needed)

If automatic setup fails, follow these steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file if needed (default values should work for development).

### 3. Set up Database
```bash
npm run db:push
```

### 4. Start the Application
```bash
npm run dev
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run dev:setup` - Setup database and start development server
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run check` - Type check TypeScript
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## 🌐 Port Configuration

The application uses the following ports:

- **5000** - Main application server (React + Express)
- **5432** - PostgreSQL database

These ports are automatically forwarded in Codespace and you'll see them in the "Ports" tab.

## 🗄️ Database

- **Type**: PostgreSQL 15
- **Host**: localhost
- **Port**: 5432
- **Database**: purplebeats_db
- **Username**: purplebeats
- **Password**: purplebeats_dev

## 🔧 Architecture

PurpleBeats is a full-stack music streaming application:

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + TanStack Query
- **Routing**: Wouter

### Backend
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js (tsx for development)
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful endpoints

### Key Features
- Music streaming with player controls
- Search functionality
- Playlists and favorites
- Pi Network integration
- Mobile-responsive design

## 🔍 Development Tips

### File Structure
```
PurpleBeats/
├── client/           # React frontend
├── server/           # Express backend
├── shared/           # Shared types and schemas
├── public/           # Static assets and music files
├── .devcontainer/    # Codespace configuration
└── dist/             # Build output
```

### Path Aliases
- `@/` - Points to `client/src/`
- `@shared/` - Points to `shared/`
- `@assets/` - Points to `attached_assets/`

### Database Schema
Use Drizzle Studio to explore the database:
```bash
npm run db:studio
```

### Hot Reloading
Both frontend and backend support hot reloading:
- Frontend: Vite HMR
- Backend: tsx with file watching

## 🎵 Music Files

The application includes 100+ royalty-free music tracks in various genres:
- Electronic
- Romantic
- World music
- Epic/Orchestral
- Comedy

All music is legally sourced from FreePD.com under CC0 public domain license.

## 🌐 Pi Network Integration

PurpleBeats integrates with Pi Network for payments and authentication:

- Development uses sandbox mode
- Pi SDK is loaded from `https://sdk.minepi.com/pi-sdk.js`
- Authentication flows through `/api/auth/pi-login`
- App ID: `purplebeats5173`

## 🐛 Troubleshooting

### TypeScript Errors
The codebase currently has some pre-existing TypeScript errors that don't affect functionality:
- Missing type definitions for Pi SDK
- Some interface mismatches in storage layers
- These are development-time warnings only and don't prevent the app from running

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose -f .devcontainer/docker-compose.yml ps

# Start database service
docker-compose -f .devcontainer/docker-compose.yml up -d postgres

# Check database connectivity
docker-compose -f .devcontainer/docker-compose.yml exec postgres pg_isready -U purplebeats
```

### Port Already in Use
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Build Issues
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables
Make sure `.env` file exists and contains proper database URL:
```bash
cat .env
```

## 📞 Support

If you encounter issues:
1. Check the Codespace terminal for error messages
2. Verify all ports are properly forwarded
3. Ensure PostgreSQL service is running
4. Check environment variables in `.env`

## 🚀 Deployment

For production deployment, the application supports:
- Vercel/Netlify for frontend
- Railway/Render for backend
- Neon/Supabase for PostgreSQL

Build production version:
```bash
npm run build
npm run start
```

---

Happy coding! 🎵✨