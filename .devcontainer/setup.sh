#!/bin/bash

echo "🚀 Setting up PurpleBeats development environment..."

# Start PostgreSQL using docker-compose
echo "🐘 Starting PostgreSQL database..."
cd /workspaces/PurpleBeats/.devcontainer || cd $(pwd)/.devcontainer
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -h localhost -p 5432 -U purplebeats; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    echo "🔄 Attempting to connect to PostgreSQL (attempt $i/30)..."
    sleep 2
done

# Return to project root
cd /workspaces/PurpleBeats || cd ..

# Set up environment variables if .env doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env 2>/dev/null || echo "⚠️  No .env.example found, creating basic .env"
    
    if [ ! -f .env ]; then
        cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://purplebeats:purplebeats_dev@localhost:5432/purplebeats_db"

# Application Configuration
NODE_ENV=development
PORT=5000

# Pi Network Configuration (Development)
PI_APP_ID="purplebeats5173"
PI_ENVIRONMENT="development"
PI_SKIP_VERIFY="true"

# Additional development settings
REPL_ID=""
EOF
    fi
fi

# Run database migrations
echo "🗄️  Setting up database schema..."
if [ -f package.json ]; then
    npm run db:push 2>/dev/null || echo "⚠️  Database push failed or no db:push script available"
fi

echo "✅ Development environment setup complete!"
echo ""
echo "🎵 To start PurpleBeats, run:"
echo "   npm run dev"
echo ""
echo "📊 The application will be available at http://localhost:5000"
echo "🔗 PostgreSQL is running in Docker on localhost:5432"
echo ""