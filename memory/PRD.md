# Bodhak — PRD

## Original problem statement
Build "Bodhak" ("Know your teacher before you enrol."): a discovery and reputation platform for instructors, like Practo for teachers. One profile and one reputation per instructor across platforms (Udemy, Coursera, upGrad, Great Learning, offline institutes). Three user types: Learners, Instructors, Edtech Platforms. Apple-inspired minimal design, no login, fully responsive, self-explanatory. React + FastAPI + MongoDB, Emergent LLM key for AI features with keyword fallback.

## User choices
- LLM: Claude Opus 5.5 (via Emergent LLM key, emergentintegrations)
- AI learner summary: generated on first profile open, then cached (invalidated when a new story is added)
- Edtech shortlist: saved in browser localStorage only

## Architecture
- Backend `/app/backend`: `server.py` (routes), `ai.py` (LLM + fallback ranking/summary), `seed.py` (24 synthetic instructors, ~120 stories; seeded on first run if collection empty)
- Frontend `/app/frontend/src`: `App.js` (routes), `components/Nav|Footer|InstructorCard|ScoreBadge|FilterBar|AISummary|StoryForm|ProfileForm|Dashboard|Leaderboard`, `pages/LearnerPage|ProfilePage|TeachPage|PlatformPage`, `hooks/useShortlist`, `lib/api.js`
- Mongo collections: `instructors` (with cached `summary`), `stories`

## API (all under /api)
GET /meta · GET /instructors (skill, platform, min_rating, min_years, sort) · POST /instructors · PUT /instructors/{id} · GET /instructors/{id} · GET /instructors/{id}/summary · POST /instructors/{id}/stories · GET /instructors/{id}/dashboard · POST /match · POST /platform-search · GET /leaderboard?skill=

## Implemented (2026-06)
- Learner view: hero + AI Match (top 3, match %, reasons), browse grid with filters/sort, instructor cards
- Instructor profile: header, Verified badge, large Bodhak Score, Teaches on, Skills, Upcoming batches, AI summary (cached), Learner stories, Share your story (updates score + refreshes summary), disabled Book 1:1
- Instructor view: View as, Create new profile, full profile form, dashboard (score, stories, bar chart by platform, line trend, AI summary with What to improve)
- Edtech view: AI ranked search with reasons, leaderboard by skill, shortlist (localStorage)
- Bodhak Score tooltip, footer demo notice, responsive layout
- Testing: iteration_1 — all backend + frontend tests passed

## Backlog
- P1: Pre-generate summaries in background after seed; per-platform deep links to courses
- P2: Instructor avatar upload (object storage); share-profile link; compare two instructors
- P2: Book a 1:1 session flow (currently disabled placeholder)
