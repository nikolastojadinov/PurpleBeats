# Overview

PurpleBeats is a modern mobile-first music streaming application built with a React frontend and Express backend. The app provides a Spotify-like experience with features for browsing artists, albums, songs, creating playlists, and managing a personal music library. The application uses a clean, dark-themed UI with purple accent colors and supports music playback controls.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: React Context for music player state, TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: Responsive layout optimized for mobile devices with bottom navigation

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API endpoints for music data operations
- **Data Layer**: Abstracted storage interface (IStorage) with in-memory implementation
- **Development Setup**: Vite integration for hot module replacement during development

## Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Core Entities**: Artists, Albums, Songs, Playlists, PlaylistSongs, and LikedSongs
- **Relationships**: Proper foreign key relationships between music entities
- **Schema Validation**: Zod integration for type-safe data validation

## Key Features
- **Music Player**: Context-based music player with play/pause, queue management, and progress tracking
- **Search**: Real-time search functionality across songs, artists, and albums
- **Library Management**: Personal playlists and liked songs functionality
- **Mobile Navigation**: Bottom navigation bar with Home, Search, Library, and Podcasts sections

## Development Tooling
- **TypeScript**: Full type safety across frontend and backend with shared schema types
- **Path Aliases**: Configured aliases for clean imports (@/ for client, @shared for shared types)
- **Code Quality**: ESM modules, strict TypeScript configuration
- **Build Process**: Separate build processes for client (Vite) and server (esbuild)

# External Dependencies

## Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm & drizzle-kit**: Database ORM and migration tools
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React routing

## UI Components
- **@radix-ui/***: Accessible UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

## Development Tools
- **vite**: Frontend build tool and development server
- **tsx**: TypeScript execution for Node.js
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Form Handling
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation integration
- **zod**: Schema validation library

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and a mobile-first approach to user experience.