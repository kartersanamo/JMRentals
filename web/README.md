# J&M Rentals Website

A premium marketing website and resident portal for J&M Rentals in Larose, Louisiana — built with Next.js 15, Tailwind CSS, Mapbox, MySQL, and Auth.js.

## Features

### Public site
- Landing page with hero, amenities, gallery, neighborhood, and contact sections
- Dedicated pages: Amenities, Gallery, Book (browse units & apply), Terms, Privacy
- Interactive photo gallery with lightbox and inside/outside filters
- Mapbox map with property pin
- Contact form with Mailgun email delivery (optional)

### Login portal (`/login`, `/portal`)
Four role-based dashboards:
- **Guest** — register, browse units, apply, track applications, message staff
- **Staff** — manage guests, review applications, residents, maintenance, messages, announcements
- **Resident** — lease, documents, maintenance, payments ledger, home info, messages, community
- **Admin** — full governance: admins, staff, users, units, leases, audit log, settings

## Quick Start

```bash
cd web
cp .env.example .env
# Configure DATABASE_URL, AUTH_SECRET, ADMIN_SEED_* (see below)
npm install
npm run db:deploy    # run migrations (requires MySQL)
npm run db:seed      # seed units + admin accounts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Portal: [http://localhost:3000/login](http://localhost:3000/login).

## MySQL Setup

Create a database and user on your existing MySQL server:

```sql
CREATE DATABASE jm_rentals_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'jm_portal'@'localhost' IDENTIFIED BY 'your_secure_password';
CREATE USER 'jm_portal'@'%' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON jm_rentals_portal.* TO 'jm_portal'@'localhost';
GRANT ALL PRIVILEGES ON jm_rentals_portal.* TO 'jm_portal'@'%';
FLUSH PRIVILEGES;
```

Then set `DATABASE_URL` in `.env`:

```
DATABASE_URL=mysql://jm_portal:your_secure_password@localhost:3306/jm_rentals_portal
```

For Docker deployments, use `127.0.0.1` as the database host (the container runs with `--network host` and shares the host network stack).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Portal | MySQL connection string |
| `AUTH_SECRET` | Portal | Random secret (`openssl rand -base64 32`) |
| `AUTH_URL` | Portal | Production URL, e.g. `https://jm.kartersanamo.com` |
| `ADMIN_SEED_EMAILS` | Seed | Comma-separated admin emails for `db:seed` |
| `ADMIN_SEED_PASSWORD` | Seed | Temporary password for seeded admins |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Map | [Mapbox access token](https://account.mapbox.com/) |
| `NEXT_PUBLIC_MAPBOX_STYLE` | No | Map style URL (default: `streets-v12`) |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical site URL |
| `MAILGUN_*` | Contact form | Mailgun credentials |
| `UPLOAD_DIR` | Portal | Upload storage path (Docker: `/app/data/uploads`, mounted by `deploy.sh`) |
| `UPLOAD_DIR_HOST` | Deploy | Host upload path (default: `web/data/uploads`; `/var/lib/...` needs sudo) |
| `MAILGUN_INBOUND_ENABLED` | No | Set `true` only after Mailgun MX + inbound route are configured |

## Portal Scripts

```bash
npm run db:generate   # Regenerate Prisma client
npm run db:migrate    # Create/apply dev migrations
npm run db:deploy     # Apply migrations (production)
npm run db:seed       # Seed units, settings, admin accounts
```

Seeded admins must change their password on first login (`/portal/account`).

## Customizing Content

Edit [`lib/site-config.ts`](lib/site-config.ts) for marketing content. Portal units are seeded from `floorPlans` in that file; manage live units in `/portal/admin/units`.

## Deployment (jm.kartersanamo.com — Home Server)

Docker on port **8004**, routed through Cloudflare tunnel.

```bash
cd web
# Ensure .env has DATABASE_URL pointing at 127.0.0.1 (host MySQL)
npm run db:deploy && npm run db:seed   # first time only
./deploy.sh
```

`deploy.sh` runs with `--network host`, mounts `UPLOAD_DIR_HOST` (default `web/data/uploads`) for persistent uploads, and applies database migrations on the host before starting the container.

## Launch Checklist

- [ ] Create MySQL database and user
- [ ] Set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` in `.env`
- [ ] Run `npm run db:deploy && npm run db:seed`
- [ ] Sign in at `/login` with a seeded admin; change password
- [ ] Create additional admins at `/portal/admin/admins`
- [ ] Configure Mapbox and Mailgun as needed
