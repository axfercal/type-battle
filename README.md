# Typeblade

A short, browser-based typing battle. Type the prompted sentence quickly and accurately to damage your opponent, then survive their counterattack.

On first use, Typeblade asks for a battle name and stores a versioned local
profile under `typeblade.profile.v1`. The profile never leaves the browser and
can be edited from the header.

After onboarding, the main menu routes between the existing Solo battle and a
Multiplayer room flow.

Solo setup includes a shared character catalog with Azure and Crimson knights.
Character metadata is server-safe under `shared/characters/`, while directional
sprite imports remain in the browser application.

Multiplayer room creation is backed by one SQLite Durable Object per six-character
room code. The HTTP foundation supports creating, joining, restoring, and leaving
two-player lobbies. Room sessions are stored in `sessionStorage`. Hibernating
WebSockets deliver automatic lobby and presence updates, with client reconnection
after temporary interruptions.

```text
POST /api/rooms
POST /api/rooms/:code/join
GET  /api/rooms/:code
POST /api/rooms/:code/leave
GET  /api/rooms/:code/socket?token=:reconnectToken
```

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The Cloudflare Vite plugin runs both the
React app and Worker API in the local Workers runtime.

The first backend endpoint is available at:

```text
GET /api/health
```

It returns `{"ok":true,"service":"typeblade"}`.

## Production build

```bash
npm run build
npm run preview
```

The build contains both the browser application and Cloudflare Worker output in
`dist/`. Validate it locally with `npm run preview`.

Run all TypeScript and lint checks with:

```bash
npm run check
```

Deploy the application and Worker together to Cloudflare Workers with:

```bash
npm run deploy
```

Wrangler will prompt for Cloudflare authentication the first time it is used.

## Stack

React 19, TypeScript, Vite, Cloudflare Workers, Durable Objects, hibernating
WebSockets, and the Cloudflare Vite plugin. Solo gameplay remains client-side;
authoritative multiplayer room state lives under `worker/`.
