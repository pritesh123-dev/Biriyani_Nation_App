# BiriyaniNation — web (PWA)

The free path onto iOS: a real installable app via Safari's "Add to Home
Screen", no App Store, no Apple Developer account. Shares the exact same
backend as `../mobile` — same `/config`, `/auth/*`, `/orders` endpoints,
same pricing rules, same admin panel controls prices/menu/hours for both.

## Run it locally

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your deployed backend
npm run dev
```

Open the printed `localhost` URL, or the LAN URL on your phone (same
Wi-Fi) to test "Add to Home Screen" on a real device.

## Build

```bash
npm run build     # tsc -b && vite build → dist/
npm run preview   # serve the production build locally
```

`dist/` is fully static — no server-side rendering, no Node runtime
needed in production. Deploy it to any static host.

## What makes this a PWA

- `vite-plugin-pwa` generates `manifest.webmanifest` and a service worker
  (`sw.js`) at build time — the app is installable and works offline for
  anything already visited.
- `index.html` carries the iOS-specific meta tags
  (`apple-mobile-web-app-capable`, `apple-touch-icon`) that Safari
  actually reads — the standard web manifest alone is not enough on iOS.
- `public/_redirects` makes client-side routing (React Router) survive a
  direct link or refresh on a static host (Netlify/Cloudflare Pages
  syntax; adjust for other hosts — see below).

## Installing on a phone

**iOS:** open the site in Safari → Share → **Add to Home Screen**. No
Apple account, no App Store, works today.

**Android:** Chrome will offer an **Install** prompt automatically, or
Share → **Add to Home Screen**. For a real Play Store listing instead,
wrap this same `dist/` build with Google's
[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) (Trusted Web
Activity) — free, official, produces a real signed AAB.

## Hosting

This needs a public HTTPS URL — "Add to Home Screen" does not work
against `localhost`. Any static host works; a few free options:

| Host | Notes |
|---|---|
| **Cloudflare Pages** | Free, unlimited bandwidth, `wrangler pages deploy dist` |
| **Netlify** | Free tier, drag-and-drop or `netlify deploy` |
| **Vercel** | Free tier, auto-detects Vite |

AWS S3 + CloudFront was the natural fit given the backend already lives
in AWS, but CloudFront needs a one-time AWS Support verification on new
accounts — worth doing eventually, but not a blocker today given the
free alternatives above.

## Structure

```
src/
  screens/     One file per route (Home, Menu, Dish, Cart, Checkout, …)
  components/  Layout (header/nav) + shared UI primitives
  lib/         api.ts, store.tsx, types.ts — same shapes as mobile/src/lib
  theme.css    Design tokens, kept in sync by eye with mobile/src/theme.ts
```

No shared package between `web/` and `mobile/` — React Native and DOM
don't share a component layer, so the two are separate, deliberately
kept structurally similar for anyone moving between them.
