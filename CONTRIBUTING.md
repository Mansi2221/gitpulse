# Contributing to gitpulse

## Setup

1. Fork and clone
2. `npm install`
3. `npm run dev`
4. Open http://localhost:3000

## Structure

- `app/api/pulse/route.ts` — GitHub API data fetching
- `app/components/Dashboard.tsx` — analytics dashboard (recharts)
- `app/components/CompareView.tsx` — side-by-side developer comparison
- `app/components/RoleAnalysis.tsx` — career fit scoring per role
- `app/components/SearchBar.tsx` — search with compare mode

## Adding a Role

1. Add to `RoleKey` type and `ROLES` array in `RoleAnalysis.tsx`
2. Add profiles in `SUGGESTED_PROFILES`
3. Add scoring function and wire into the switch
