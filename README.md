# PurpleBeats

Music app project originally developed on Replit. Contains source code and assets for PurpleBeats.

## 🚀 Quick Start with GitHub Codespace

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/nikolastojadinov/PurpleBeats)

1. Click "Open in GitHub Codespaces" above
2. Wait for automatic setup (dependencies, database, environment)
3. Run `npm run dev:setup` 
4. Open the forwarded port 5000 to preview the app

For detailed setup instructions, see [CODESPACE_SETUP.md](./CODESPACE_SETUP.md).

## 🎵 About PurpleBeats

PurpleBeats is a modern music streaming application built with:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express + TypeScript + Drizzle ORM
- **Database**: PostgreSQL  
- **Integration**: Pi Network for payments
- **Music**: 100+ royalty-free tracks

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Set up database and start development server
npm run dev:setup
```

The app will be available at http://localhost:5000.
