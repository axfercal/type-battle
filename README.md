# Typeblade

A short, browser-based typing battle. Type the prompted sentence quickly and accurately to damage your opponent, then survive their counterattack.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. No backend or environment variables are required.

## Production build

```bash
npm run build
npm run preview
```

The deployable site is written to `dist/`. The build uses relative asset paths, so the folder can be published on Netlify, Vercel, Cloudflare Pages, GitHub Pages, or any static web host.

For a host that asks for project settings, use:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 20 or newer

## Stack

React 19, TypeScript, and Vite. Gameplay is entirely client-side.
