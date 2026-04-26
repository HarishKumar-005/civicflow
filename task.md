# CivicFlow — Build Task Tracker

## Phase 0: Planning & Architecture
- [x] Read and internalize Context.md
- [x] Create implementation plan
- [ ] Get user approval on plan

## Phase 1: Project Scaffolding & Foundation
- [/] Initialize Next.js project with TypeScript, Tailwind CSS
- [ ] Install core dependencies (shadcn/ui, Supabase client, Leaflet, Zod, React Hook Form, Recharts, TanStack Query)
- [ ] Set up project structure (folders, env files, .gitignore)
- [ ] Configure Supabase client and auth helpers
- [ ] Create `.env.example` and `.env.local` templates

## Phase 2: Database Schema & Core Data Layer
- [ ] Design and create full SQL schema (users, volunteer_profiles, reports, tasks, assignments, clusters, activity_logs)
- [ ] Create TypeScript types mirroring the schema
- [ ] Create Supabase data-access utilities
- [ ] Seed script with realistic demo data

## Phase 3: Auth & Role-Based Routing
- [ ] Implement Supabase Auth (email/password)
- [ ] Role-based middleware (admin, organizer, volunteer, reporter)
- [ ] Login / Signup pages
- [ ] Protected route layout

## Phase 4: Core Intake Module
- [ ] Report submission form (manual entry)
- [ ] File upload support (images of surveys)
- [ ] Structured data capture with validation
- [ ] Report list view

## Phase 5: Volunteer Management
- [ ] Volunteer profile creation/edit form
- [ ] Skills, availability, location, languages
- [ ] Volunteer list for organizers

## Phase 6: Prioritization & Matching Engine
- [ ] Priority scoring algorithm (server-side)
- [ ] Volunteer matching engine (multi-factor scoring)
- [ ] Task creation from reports
- [ ] Assignment workflow (suggest → assign → accept → complete)

## Phase 7: Dashboard & Map
- [ ] Organizer dashboard (urgent needs, stats, task queue)
- [ ] Map/heatmap view with Leaflet
- [ ] Volunteer dashboard (assigned tasks, nearby needs)
- [ ] Live data cards and charts

## Phase 8: AI Structuring Module
- [ ] Gemini API integration for report text extraction
- [ ] Category classification
- [ ] Urgency estimation
- [ ] Report summarization
- [ ] Duplicate suggestion

## Phase 9: Reporting & Analytics
- [ ] Summary statistics
- [ ] Exportable insights
- [ ] Activity/audit log
- [ ] Impact metrics

## Phase 10: Polish & Verification
- [ ] Responsive design pass
- [ ] Empty states, loading states, error states
- [ ] Demo seed data
- [ ] End-to-end browser verification
- [ ] Screenshots/recordings for walkthrough
