# Badminton Pairing Software - Design Guidelines

## Design Approach

**Selected Approach:** Design System (Material Design)
**Justification:** This is a utility-focused, information-dense application where efficiency, learnability, and clear data presentation are paramount. The app serves club organizers and players who need quick access to pairing logic, match schedules, and player statistics.

**Core Principles:**
- Clarity over decoration: Information hierarchy drives every layout decision
- Action-oriented: Primary actions (create session, confirm pairing, enter scores) are always prominent
- Scannable data: Tables, lists, and cards designed for quick information retrieval
- Progressive disclosure: Complex features accessible but not overwhelming

---

## Typography

**Font Family:** 
- Primary: Inter (via Google Fonts)
- Monospace: JetBrains Mono (for ratings, scores, statistics)

**Hierarchy:**
- Page Titles: text-3xl font-bold (sessions, player management)
- Section Headers: text-2xl font-semibold
- Card Titles: text-lg font-semibold
- Body Text: text-base font-normal
- Labels/Metadata: text-sm font-medium
- Small Print (timestamps, helper text): text-xs

---

## Layout System

**Spacing Primitives:** Tailwind units of **2, 4, 6, and 8** (e.g., p-4, gap-6, mb-8)
- Component internal spacing: p-4, gap-2
- Section spacing: py-8, mb-6
- Card margins: gap-4
- Page padding: p-6 (mobile), p-8 (desktop)

**Grid System:**
- Dashboard layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Match cards: grid-cols-1 lg:grid-cols-2
- Player lists: Single column with responsive table on desktop
- Max container width: max-w-7xl mx-auto

---

## Component Library

### Navigation
**Top Navigation Bar:**
- Fixed top bar with app logo/name (left), primary nav links (center), user profile/logout (right)
- Height: h-16
- Items: Dashboard, Sessions, Players, Statistics
- Mobile: Hamburger menu with slide-out drawer

### Dashboard
**Session Overview Cards:**
- Grid of upcoming/active session cards
- Each card: Session name, date/time, participant count, courts available, quick action button
- Status indicators: border-l-4 accent stripe (active, upcoming, completed)

**Quick Action Panel:**
- Prominent "Create New Session" button (large, primary action)
- Quick stats: Total players, sessions this month, upcoming matches

### Session Management
**Session Creation Form:**
- Multi-step wizard OR single-page form with clear sections
- Sections: Basic Info, Court Setup, Constraints, Player Selection
- Input groups with labels above fields
- Constraint sliders for skill gap, match quotas
- Checkbox groups for session types (singles, men's doubles, women's doubles, mixed doubles)

**Active Session View:**
- Court grid showing current matches
- Match cards with: Court number, player names, match time, score entry button
- Sidebar: Waiting list, upcoming pairings queue
- Rotation controls: Next round button, manual override options

### Player Management
**Player List:**
- Sortable/filterable table: Name, Gender, Skill Rating, Preferred Categories, Actions
- Search bar at top
- Add Player button (floating action or header)
- Row actions: Edit, View History, Adjust Rating

**Player Profile:**
- Header: Name, rating badge, contact info
- Tabs: Match History, Statistics, Preferences, Notes
- Match history: Timeline of past games with win/loss indicators
- Statistics: Win rate, average partner rating, categories played

### Match Pairing Display
**Pairing Results:**
- Grouped by court/round
- Each pairing: Team A (player 1 + player 2) vs Team B (player 1 + player 2)
- Skill balance indicator: visual representation of team strength difference
- Gender indicators for mixed doubles
- Regenerate/adjust pairing options

**Match Cards:**
- Compact card: Court number badge, player names in pairs, vs separator
- Score entry fields (inline or modal)
- Status badge: Scheduled, In Progress, Completed

### Forms
**Input Fields:**
- Labels above inputs (not floating)
- Full-width inputs with border, rounded corners
- Focus states with accent outline
- Error states with red border and helper text below
- Consistent height: h-10 for text inputs

**Buttons:**
- Primary: Solid fill, medium prominence
- Secondary: Outlined style
- Sizes: Default (px-4 py-2), Large (px-6 py-3 for primary actions)
- Icons: Heroicons (outline style), positioned left of text

### Data Display
**Tables:**
- Alternating row backgrounds for readability
- Sticky headers on scroll
- Responsive: Collapse to cards on mobile
- Sortable columns with arrow indicators

**Statistics Cards:**
- Metric cards: Number (large, bold) with label below
- Small charts/graphs for trends
- Border or subtle shadow for separation

**Badges:**
- Skill ratings: Rounded pill badges with number
- Gender: Single letter badges (M/F)
- Status: Small rounded badges with text

---

## Images

**Hero Section (Landing/Login Page):**
- Full-width hero image showing badminton court with players mid-game (action shot)
- Image: High-quality photo of mixed doubles match, diverse players, modern court
- Overlay: Semi-transparent dark gradient (top to bottom) for text readability
- Placement: Behind hero title "Smart Badminton Pairing for Inclusive Play" and login/signup CTAs
- Buttons on hero: Blurred glass-morphism background (backdrop-blur-md with semi-transparent fill)

**Dashboard:**
- No large images; focus on data and functionality
- Optional: Small court diagram icons for visual context in empty states

**Empty States:**
- Illustrations: Simple line art of badminton equipment (racket, shuttlecock) when no data exists
- Placement: Center of empty player lists, session views with call-to-action below

---

## Interactions & Micro-animations

**Minimal Motion:**
- Button hover: Subtle brightness increase
- Card hover: Slight elevation shadow (shadow-md to shadow-lg)
- Loading states: Simple spinner or skeleton screens
- No decorative animations; focus on functional feedback

---

## Responsive Behavior

**Breakpoints:**
- Mobile: Single column, stacked layout, drawer navigation
- Tablet (md:): Two-column grids, visible sidebar
- Desktop (lg:): Three-column grids, full navigation, side-by-side forms

**Key Adaptations:**
- Tables → Cards on mobile
- Multi-column forms → Stacked fields on mobile
- Fixed sidebar → Slide-out drawer on mobile

---

## Accessibility
- Maintain WCAG AA contrast ratios throughout
- Keyboard navigation for all interactive elements
- ARIA labels on icon buttons
- Form validation with clear error messaging
- Focus indicators on all inputs and buttons