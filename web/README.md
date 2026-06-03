# J&M Rentals Website

A premium marketing website for J&M Rentals in Larose, Louisiana — built with Next.js 15, Tailwind CSS, Mapbox, and Mailgun.

## Features

- Catoctin-inspired landing page with hero, amenities, gallery, neighborhood, and contact sections
- Dedicated pages: Amenities, Gallery, Book (Coming Soon), Terms, Privacy
- Interactive photo gallery with lightbox and inside/outside filters
- Mapbox map with property pin at 12918 S Main St, Larose, LA
- Contact form with Mailgun email delivery, honeypot, and rate limiting
- Future-ready online booking placeholders

## Quick Start

```bash
cd web
cp .env.example .env.local
# Edit .env.local with your tokens (see below)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | For map | [Mapbox access token](https://account.mapbox.com/) |
| `NEXT_PUBLIC_MAPBOX_STYLE` | No | Map style URL (default: `mapbox://styles/mapbox/light-v11`) |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical site URL for metadata |
| `MAILGUN_API_KEY` | For contact form | Mailgun API key |
| `MAILGUN_DOMAIN` | For contact form | Verified sending domain |
| `MAILGUN_FROM` | For contact form | Sender, e.g. `J&M Rentals <noreply@mg.yourdomain.com>` |
| `CONTACT_TO_EMAIL` | For contact form | Inbox that receives form submissions |
| `CONTACT_RATE_LIMIT_PER_HOUR` | No | Default `5` |

## Mailgun Setup

1. Create a Mailgun account and add/verify your domain.
2. Copy your API key and domain into `.env.local`.
3. Set `MAILGUN_FROM` to an address on your verified domain.
4. Set `CONTACT_TO_EMAIL` to the inbox where inquiries should arrive.
5. Submit a test message via the contact form.

## Customizing Content

Edit [`lib/site-config.ts`](lib/site-config.ts) to update:

- Phone, email, office hours
- Amenities list and descriptions
- Neighborhood bullets
- Map coordinates (refine pin location)
- Gallery image metadata

Replace photos in [`public/images/`](public/images/).

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Future Booking

When ready to enable online booking:

1. Set `bookingEnabled: true` in `site-config.ts`
2. Replace `/book` page content with your reservation flow
3. Wire nav CTAs to the live booking system

Planned integrations: database, payments (Stripe), admin dashboard, calendar sync.

## Deployment (jm.kartersanamo.com — Home Server)

This site runs in Docker on port **8004**, routed through the Cloudflare tunnel (`homeserver`).

### Deploy / update

```bash
cd web
cp .env.example .env   # Mailgun, Mapbox, etc.
./deploy.sh
sudo systemctl restart cloudflared   # required after first deploy or ingress changes
```

`deploy.sh` reads `.env` and passes `NEXT_PUBLIC_*` values into the Docker **build** (they are baked into the client bundle). Runtime secrets (Mailgun) are loaded into the container via `--env-file .env`. `.env` is excluded from the image context via `.dockerignore`.

The tunnel ingress for `jm.kartersanamo.com` → `http://localhost:8004` lives in `/etc/cloudflared/config.yml`.

DNS: `cloudflared tunnel route dns homeserver jm.kartersanamo.com` (already provisioned).

### Alternative: Vercel

1. Push the repo and import the `web` directory as the project root.
2. Add all environment variables in the Vercel dashboard.
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain.

## Launch Checklist

- [ ] Update phone and email in `site-config.ts`
- [ ] Confirm office hours
- [ ] Add Mapbox token and verify map pin
- [ ] Configure Mailgun and send test inquiry
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production URL
- [ ] Review Terms and Privacy copy with legal counsel if needed
