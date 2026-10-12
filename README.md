# Sanctuary

A peaceful digital community for Christians to read the Bible, share prayer requests, and grow in faith together — one private space per church.

Originally prototyped on Lovable (grace-share-verse.lovable.app); this is the standalone local codebase.

Sanctuary is built for many churches. A pastor or church admin opens their church's space, then brings members in by personal invite, join code or QR code. Each church's members and content are private to that church.

## Getting started

```bash
npm install
npm run dev        # http://localhost:8080
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

Requires Node 18+. The app needs a Supabase project for accounts — follow **[SETUP.md](SETUP.md)** (about 10 minutes). Without one, the app shows setup instructions.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · Supabase (auth + Postgres) · framer-motion · lucide-react · Radix UI · qrcode.react · sonner

## Features

| Section | What it does |
| --- | --- |
| Home | Greeting, reading streak, Verse of the Day with reactions and reflections, quick links |
| Bible | KJV reader for all 66 books, 4-colour highlights, bookmarks, verse image cards, read-aloud (Web Speech API), zen mode, reading progress + daily streak |
| Bookmarks | Saved verses with editable personal notes |
| Prayer Wall | Share requests (optionally anonymous, with an attached verse), "praying" counter, pull to refresh |
| Live Prayer | Prayer room with participants, prayer points and a session timer |
| Prayer Partners | Church leaders to message privately for prayer |
| Soul Check | Weekly wellness check-in, personal 4-week trend, anonymised church pulse |
| Worship | Share songs, hymns and spoken word that are ministering to you |
| Faith Journey | Timeline of personal milestones (public or private) |
| Community | Group chats with scripture lookup and inline verse cards |
| Journal | Private prayer journal with answered-prayer tracking |
| Settings | Daily verse browser notification, light/dark theme |
| Church Admin | Members and roles, approval requests, personal invites (WhatsApp/SMS/email), join codes with QR (download or present full screen), church details |

Outside the main app: sign-in (email + password or magic link, or phone + SMS code), the welcome flow (create or join a church), `/join/:code` for codes and QR, and `/invite/:token` for personal invites. People can belong to several churches and switch between them.

## Project layout

```
src/
  components/
    layout/       sidebar, mobile bottom nav, navigation config
    sections/     one component per app section (see table above)
    ui/           small Radix/shadcn-style primitives
    *.tsx         shared pieces: onboarding, audio player, share-verse dialog, etc.
  contexts/       theme + audio Bible (read-aloud) providers
  hooks/          reading streak, bookmarks, pull-to-refresh, daily notifications
  lib/            Bible API client, book list, utilities
  data/mockData.ts  demo content for community features
  pages/          app shell, sign-in, welcome, join and invite pages
supabase/
  migrations/     database schema, privacy rules and joining logic
```

Admin screens live in `src/components/sections/admin/`; signed-in user and active church come from `src/contexts/AuthContext.tsx` and `ChurchContext.tsx`.

## Data & persistence

- **Accounts, churches, memberships, join codes and invitations** live in Supabase. The schema, privacy rules and joining logic are in `supabase/migrations/`.
- **Bible text** comes from the free public [bible-api.com](https://bible-api.com) (KJV), cached in memory per session. To use a different source, change `fetchChapter` in `src/lib/bible.ts`.
- **Personal data** — highlights, bookmarks, reading streak, theme, notification settings, onboarding state — is stored in the browser's `localStorage` under `sanctuary-*` keys.
- **Community content** (prayer requests, chats, partners, worship shares, milestones, soul-check stats) is demo data from `src/data/mockData.ts`. New posts live in component state and reset on reload.

## Roadmap

1. ~~Accounts, churches, roles, and adding members by invite, code or QR~~ ✅
2. Store each section's content in the database, scoped to the church (replacing `mockData`).
3. Realtime updates for Community chat, Prayer Partners and Live Prayer.
4. Sync highlights, bookmarks and streaks to the user's account instead of `localStorage`.
5. Installable mobile app, then app-store builds.
