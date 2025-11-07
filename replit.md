# MovieVault - Video Hosting & Download Platform

## Overview

MovieVault is a video hosting and download platform that allows users to browse, stream, and download movies from a personal library. The application features a Netflix/YouTube-inspired interface with video cards, search/filter capabilities, and a cinematic hero section. Users can upload videos with metadata (title, description, category), stream them in-browser, and download them for offline viewing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing (replacing React Router)
- React Query (TanStack Query) for server state management, caching, and data fetching

**UI Component System**
- Shadcn/ui component library (New York style variant) providing accessible, customizable components built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming support (light/dark modes)
- Inter font family for typography hierarchy (Bold for headings, Regular for body, Medium for metadata)

**State Management Strategy**
- React Query handles all server state (videos list, individual video data)
- Local component state (useState) for UI interactions (modals, filters, search)
- Form state managed by react-hook-form with Zod validation
- No global state management library needed due to server-state-first approach

**Design System Principles**
- Responsive grid layouts: 1 column (mobile) → 2 (tablet) → 3 (desktop) → 4 (wide screens)
- Consistent spacing using Tailwind's scale (2, 4, 6, 8 units)
- 16:9 aspect ratio for all video thumbnails and players
- Hover interactions: scale-105 transform, overlay displays, shadow elevations

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- Custom middleware for request logging with duration tracking
- Session management using connect-pg-simple (PostgreSQL session store)
- File upload handling via Multer with disk storage

**API Design**
- RESTful endpoints under `/api` namespace
- CRUD operations for videos: GET /api/videos, POST /api/videos, DELETE /api/videos/:id, etc.
- Specialized endpoints for streaming (`/api/videos/:id/stream`) and downloads (`/api/videos/:id/download`)
- JSON request/response format with Zod schema validation
- Static file serving for uploaded videos from `/uploads` directory

**File Storage Strategy**
- Videos stored on local filesystem in `uploads/` directory
- Multer generates unique filenames using timestamp + random suffix pattern
- 500MB file size limit enforced at upload
- MIME type validation (only video/* files accepted)
- Original filename preserved in database for download purposes

**Data Validation Layer**
- Shared Zod schemas between frontend and backend (`@shared/schema`)
- `insertVideoSchema` for creating videos (omits id, uploadDate)
- `updateVideoSchema` for partial updates (omits id, uploadDate, file fields)
- Drizzle-zod integration generates schemas from database table definitions

### Data Storage

**Database Technology**
- PostgreSQL via Neon serverless driver (@neondatabase/serverless)
- Drizzle ORM for type-safe database queries and schema management
- Migration system using drizzle-kit (migrations stored in `/migrations`)

**Schema Design**
- `videos` table structure:
  - `id`: UUID primary key (auto-generated via gen_random_uuid())
  - `title`: Text, required
  - `description`: Text with empty string default
  - `filename`: Disk storage filename
  - `originalFilename`: User's original filename for downloads
  - `fileSize`: Integer (bytes)
  - `duration`: Optional text field for video length
  - `category`: Text with "Other" default (Action, Drama, Comedy, etc.)
  - `thumbnailUrl`: Optional URL for custom thumbnails
  - `uploadDate`: Timestamp, auto-set to current time

**In-Memory Fallback**
- MemStorage class implements IStorage interface for development/testing
- Provides identical API to database storage for seamless switching
- Uses JavaScript Map for fast lookups by video ID
- Supports search filtering and category filtering in-memory

### External Dependencies

**UI Component Libraries**
- @radix-ui/* primitives (v1.x): Accessible, unstyled components for dialogs, dropdowns, menus, tooltips, etc.
- lucide-react: Icon library (Play, Upload, Download, Trash, etc.)
- class-variance-authority: Type-safe variant styling
- tailwind-merge + clsx: Conditional className merging utility

**Form & Validation**
- react-hook-form: Performant form state management
- @hookform/resolvers: Zod resolver integration
- zod: Schema validation library

**Database & ORM**
- drizzle-orm: TypeScript ORM with SQL-like query builder
- drizzle-zod: Auto-generate Zod schemas from Drizzle tables
- @neondatabase/serverless: PostgreSQL driver optimized for serverless

**File Handling**
- multer: Multipart/form-data parser for file uploads
- Built-in fs/path modules for file system operations

**Development Tools**
- @replit/vite-plugin-runtime-error-modal: Runtime error overlay for Replit environment
- @replit/vite-plugin-cartographer: Replit-specific development features
- tsx: TypeScript execution for development server
- esbuild: Fast bundler for production server build

**Utility Libraries**
- date-fns: Date formatting and manipulation
- nanoid: Unique ID generation
- wouter: Minimalist routing (~1.2kb)