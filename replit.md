# Michaels Mixer - Smart Pairing & Session Management

## Overview

Michaels Mixer is a web application for managing badminton sessions and player pairings. It focuses on creating balanced matches across multiple game types (Singles, Men's Doubles, Women's Doubles, Mixed Doubles), with intelligent skill-based pairing algorithms. The application helps club organizers manage sessions, track player registrations, and ensure fair, inclusive play for all skill levels.

**Core Features:**
- Player management with category-specific skill ratings (1000-2000 scale)
- Session creation and management with configurable capacity limits (8, 10, 12, 14, 16, 20 players)
- Player registration system with gender-aware event selection
- Capacity tracking and session status management
- Automated draw generation with configurable number of rounds
- Round-robin rotation for opponent variety across rounds
- Skill-based match balancing via partnership formation
- Bye rotation for odd participant counts
- Gender-aware pairing for mixed doubles
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
- Tables: users, players, sessions, registrations, matches, ratingHistories
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
- Basic info (name, date, capacity, number of rounds)
- Configuration (courts available, session types)
- Fixed capacity options: 8, 10, 12, 14, 16, or 20 players
- Configurable number of rounds (1-10)
- Status tracking (upcoming, active, completed)
- Draw generation on-demand via "Create Draws" button

**Registrations:**
- Links players to sessions
- Tracks selected event types per player (from session's available types)
- Gender-aware event filtering (Men's Doubles disabled for females, Women's Doubles for males)
- Real-time capacity tracking (shows X/Y players registered)
- Prevents duplicate registrations
- Enforces session capacity limits
- Session marked as "full" when capacity reached

**Matches (Draw Generation):**
- Auto-generated from registrations via draw generation algorithm
- Round-robin rotation ensures different opponents each round
- Bye rotation for odd participant counts (singles or partnerships)
- Court assignment based on session configuration
- Score tracking per match (team1Set1, team1Set2, team1Set3, team2Set1, team2Set2, team2Set3)
- Best-of-3 scoring with badminton rules (21 points with 2-point lead, or first to 30)
- Match status (scheduled, in-progress, completed)
- Automated rating updates triggered when scores are entered/modified

**Rating System (ELO-based):**
- Dynamic rating adjustments based on match outcomes
- Event-type specific ratings (Singles, Men's/Women's/Mixed Doubles)
- Expected win probability calculation using standard ELO formula
- Variable K-factors: 40 (<1500), 32 (1500-1800), 24 (>1800)
- Ratings clamped between 1000-2000
- Underdogs gain more points for wins; favorites lose more for losses
- Idempotent: editing scores recalculates ratings correctly (no double-counting)
- Full rating history tracking with match references

### Key Architectural Decisions

**Component Architecture:**
- Reusable dialog patterns for CRUD operations (Create/Edit Player, Create/Edit Session, Join Session)
- Card-based layouts for data display (PlayerCard, SessionCard with registration count)
- Centralized state management via TanStack Query with optimistic updates
- Progressive disclosure pattern for complex features (SkillAssessment multi-step wizard)
- Real-time capacity tracking via registration queries

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

**Draw Generation Algorithm:**
- **Singles Pairing:**
  - Players sorted by singles rating (descending: 2000 → 1000)
  - Round-robin rotation using circle method (fix first player, rotate others)
  - Bye rotation for odd counts: `byeIndex = (round - 1) % playerCount`
  - Each round produces different opponent pairings for variety
  
- **Doubles/Mixed Pairing (MIXER FORMAT - Partnerships Rotate Each Round):**
  - **NEW: Mixer-Style Partnership Rotation:**
    - Partnerships are created FRESH each round (not fixed for all rounds)
    - History tracking prevents partner/opponent repeats when possible
    - Seeded shuffle ensures variety across rounds
    
  - **Per-Round Partnership Formation:**
    - **Mixed Doubles:** 
      - Males and females shuffled independently each round
      - Algorithm pairs males with females they haven't partnered before
      - Falls back to least-repeated partners when necessary
    - **Men's/Women's Doubles:**
      - All players shuffled each round with seeded randomness
      - Greedy matching prioritizes new partnerships
      - Avoids previous partners when possible
    
  - **Opponent Matching:**
    - Teams sorted by total rating for balanced matches
    - Algorithm prefers opponents not faced in previous rounds
    - Falls back to any available opponent when needed
    
  - **History Tracking:**
    - Partner history: Map of playerId → Set of previous partner IDs
    - Opponent history: Map of playerId → Set of previous opponent IDs
    - Updated after each round for future round generation
    
- **Court Assignment:**
  - Matches distributed across available courts
  - Round-robin within each round for fair court usage
  - Sequential court numbering (1, 2, 3, ...)

### API Structure

RESTful endpoints follow convention:
- `GET /api/players` - List all players
- `GET /api/players/:id` - Get single player
- `GET /api/players/:id/rating-history` - Get rating history for a player
- `GET /api/players/:id/matches` - Get match history for a player
- `POST /api/players` - Create player
- `PATCH /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/:id` - Get single session
- `POST /api/sessions` - Create session (requires capacity)
- `PATCH /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session
- `GET /api/sessions/:sessionId/registrations` - List registrations for a session
- `POST /api/sessions/:sessionId/registrations` - Register player for session
- `DELETE /api/registrations/:id` - Remove registration
- `POST /api/sessions/:sessionId/draws` - Generate match draws for a session
- `GET /api/sessions/:sessionId/matches` - Get generated draws for a session
- `PATCH /api/matches/:id` - Update match scores (triggers automatic rating updates)

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