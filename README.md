# gitpulse

**Developer Intelligence Dashboard** — paste a GitHub username, get instant analytics.

[Live Demo](https://gitpulse.vercel.app)

![gitpulse screenshot](public/screenshot.png)

## Features

- Instant GitHub profile analytics from any public username
- Contribution heatmap derived from public event data
- Language distribution with visual breakdown
- Repository quality table with stars, forks, and activity
- Activity timeline showing event frequency over 30 days
- Coding patterns heatmap (day of week x hour of day)
- Event type breakdown (Push, PR, Issues, etc.)
- Topic cloud across all repositories
- No API key required — uses public GitHub REST API
- Fully responsive dark-themed dashboard

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **Data:** GitHub REST API (public, no auth required)
- **Deploy:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter a GitHub username.

## License

MIT

---

Built by [Mansi Patil](https://github.com/Mansi2221)
