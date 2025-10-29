# BadmintonPro - Smart Pairing & Session Management

## Overview

BadmintonPro is a web application for managing badminton sessions and player pairings. It focuses on creating balanced matches across multiple game types (Singles, Men's Doubles, Women's Doubles, Mixed Doubles), with intelligent skill-based pairing algorithms. The application helps club organizers manage sessions, track player registrations, and ensure fair, inclusive play for all skill levels.

**Core Features:**
- Player management with category-specific skill ratings
- Session creation and management with configurable constraints
- Gender-aware pairing for mixed doubles
- Skill-based match balancing
- Real-time session tracking and score entry

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack

**Frontend:**
- React with TypeScript
- Vite as build tool and dev server
- Wouter for client-side routing
- TanStack Query for server state management
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens

**Backend:**
- Express.js server
- In-memory storage abstraction (IStorage interface) for data persistence
- RESTful API design
- Session-based architecture preparation (connect-pg-simple configured)

**Database:**
- Drizzle ORM configured for PostgreSQL
- Schema-first approach with Zod validation
- Tables: users, players, sessions, registrations
- UUID primary keys with auto-generation

**Design System:**
- Material Design principles adapted for utility-focused application
- Custom theme with light/dark mode support
- Responsive grid layouts (mobile-first)
- Consistent spacing system using Tailwind units (2, 4, 6, 8)

### Data Model

**Players:**
- Demographic info (name, gender, club)
- Category-specific ratings (singles, men's doubles, women's doubles, mixed doubles)
- Preferred categories for session participation
- Optional notes field

**Sessions:**
- Basic info (name, date, capacity)
- Configuration (courts available, session types, skill gap constraints)
- Pairing constraints (max skill gap, min games per player)
- Status tracking (upcoming, active, completed)

**Registrations:**
- Links players to sessions
- Tracks selected event types per player
- Manages waitlist status

### Key Architectural Decisions

**Component Architecture:**
- Reusable dialog patterns for CRUD operations (Create/Edit Player, Create/Edit Session)
- Card-based layouts for data display (PlayerCard, SessionCard, MatchCard)
- Centralized state management via TanStack Query with optimistic updates
- Progressive disclosure pattern for complex features (SkillAssessment multi-step wizard)

**Routing Strategy:**
- Client-side routing with Wouter (lightweight React Router alternative)
- Layout wrapper pattern with persistent sidebar navigation
- Nested routes for session details

**Data Fetching:**
- Query key convention: `["/api/resource", id?]`
- Automatic refetching disabled (staleTime: Infinity) for controlled updates
- Manual invalidation after mutations
- Optimistic UI updates for better UX

**Form Handling:**
- Controlled components with local state
- Zod schema validation on both client and server
- React Hook Form with @hookform/resolvers for complex forms

**Storage Abstraction:**
- IStorage interface allows swapping implementations
- Current: MemStorage (in-memory Map-based)
- Prepared for: Drizzle ORM + PostgreSQL migration
- Consistent async API regardless of backend

**Skill Assessment System:**
- 10-question evaluation per category
- 5-point Likert scale (Beginner to Expert)
- Weighted scoring algorithm for rating calculation
- Category-specific questions (singles vs doubles focus areas)

**Theming Approach:**
- CSS custom properties for dynamic theming
- Automatic dark mode class toggle on document root
- localStorage persistence for theme preference
- Semantic color tokens (primary, secondary, destructive, etc.)

### API Structure

RESTful endpoints follow convention:
- `GET /api/players` - List all players
- `GET /api/players/:id` - Get single player
- `POST /api/players` - Create player
- `PATCH /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

Similar patterns for `/api/sessions` and `/api/registrations`.

**Request/Response Flow:**
1. Client validates input with Zod schema
2. TanStack Query mutation sends request
3. Express middleware parses JSON
4. Route handler validates again with same Zod schema
5. Storage layer performs operation
6. Response returns full entity or error
7. Query cache invalidated/updated on success

## External Dependencies

**UI Framework:**
- @radix-ui/* - Headless UI primitives (20+ components)
- class-variance-authority - Component variant management
- tailwindcss - Utility-first CSS framework
- lucide-react - Icon library

**Data & State:**
- @tanstack/react-query - Server state management
- drizzle-orm - TypeScript ORM
- drizzle-zod - Schema to Zod validation bridge
- zod - Schema validation

**Database:**
- @neondatabase/serverless - Serverless Postgres driver
- PostgreSQL (via DATABASE_URL environment variable)

**Development:**
- Vite - Build tool and dev server
- TypeScript - Type safety
- @replit/vite-plugin-* - Replit-specific dev tooling

**Date/Time:**
- date-fns - Date manipulation and formatting

**Session Management:**
- connect-pg-simple - PostgreSQL session store (configured but not yet active)

**Build Output:**
- esbuild - Server-side bundling for production
- Client assets served from dist/public