# traveling-world-map

Interactive world map of the countries and cities I've visited, the theme parks I went to,
and my favourite coaster / flat ride at each park.

Data is hierarchical: **country → city → theme park → ride**.

## Structure

This is an npm workspaces monorepo:

| Package | Purpose |
|---|---|
| `shared/` | TypeScript types shared by the client and server |
| `server/` | REST API + database (Fastify + Drizzle + Postgres) |
| `client/` | React + TypeScript app with the interactive map (react-leaflet) |
| `api/` | Vercel function entrypoint that runs the server as one serverless function |

## Features

- Visited countries highlighted on a Leaflet world map, with city and theme-park markers.
- Hover a country for its city list, a city for photo placeholders, a park for its
  favourite coaster / flat ride.
- Click any element for a detail panel (country → city → theme park → rides).
- Admin mode (password) adds inline forms to create / edit / delete countries, cities,
  theme parks and rides, including a "pick on map" location picker and a favourite toggle.
- Stats panel with totals and lists of countries, parks and favourite coasters.

## Development

The server needs a Postgres database. Use a [Neon](https://neon.tech) branch (or any
Postgres) and put its connection string in `server/.env`:

```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require   # omit channel_binding
ADMIN_PASSWORD=admin                                          # dev-only fallback
TOKEN_SECRET=any-long-random-string
```

```bash
npm install
npm run typecheck

npm run db:migrate -w @twm/server    # apply migrations to DATABASE_URL
npm run db:seed -w @twm/server       # insert sample data

npm run dev            # runs the server (:4000) and the client (:5173) together
npm run dev:server     # server only (Fastify)
npm run dev:client     # client only (Vite; proxies /api to the server)

npm run db:generate -w @twm/server   # create a migration after editing the schema
```

## Map data

`client/public/countries.geo.json` is a trimmed Natural Earth 1:110m admin-0 dataset
(properties reduced to `name` + `code`, coordinates rounded). `code` is the Natural Earth
`ADM0_A3` value; a country row's `isoA3` must match it for the country to highlight.

## Auth

Reads are public. Creating/updating/deleting data requires the admin password:
`POST /api/login` with `{ "password": "..." }` returns a signed token (30-day expiry) to
send as `Authorization: Bearer <token>`. `/api/login` is rate limited to 10 attempts per
IP per 10 minutes.

In production the password is stored **hashed** (scrypt) in `ADMIN_PASSWORD_HASH`; generate
it with `npm run hash-password -w @twm/server -- '<password>'`. In development, if
`ADMIN_PASSWORD_HASH` is unset the plaintext `ADMIN_PASSWORD` is used instead.

## Deployment (Vercel + Neon)

One Vercel project serves the built client (static) and the API (one serverless function
at `api/index.ts`). Auto-deploys on push to `master`.

1. **Neon** — create a project, copy the **pooled** connection string. Remove any
   `channel_binding=require` param (the `pg` driver doesn't support it); keep `sslmode=require`.
2. **Import the repo into Vercel.** On the setup screen set **Root Directory** to the repo
   root (`.`, *not* `server`) and **Application Preset** to *Other*.
3. **Environment variables** (Production + Preview):
   - `DATABASE_URL` — the Neon pooled string
   - `TOKEN_SECRET` — `openssl rand -base64 32`
   - `ADMIN_PASSWORD_HASH` — from `npm run hash-password`
4. **Deploy.** `vercel.json` runs `npm ci --include=dev`, applies migrations
   (`drizzle-kit migrate` against `DATABASE_URL`), builds the client to `client/dist`, and
   bundles `api/`.

Migrations run on every deploy (idempotent). To run them by hand: `npm run db:migrate -w @twm/server`.

## API

| Method | Route | Notes |
|---|---|---|
| GET | `/api/map` | all countries nested with cities → theme parks → rides |
| GET | `/api/stats` | counts of countries, cities, theme parks, coasters |
| GET/POST/PUT/DELETE | `/api/countries[/:id]` | `POST` nested cities at `/api/countries/:id/cities` |
| GET/POST/PUT/DELETE | `/api/cities[/:id]` | `POST` nested parks at `/api/cities/:id/theme-parks` |
| GET/POST/PUT/DELETE | `/api/theme-parks[/:id]` | `POST` nested rides at `/api/theme-parks/:id/rides` |
| GET/POST/PUT/DELETE | `/api/rides[/:id]` | |
| POST | `/api/login` | `{ password }` → `{ token }` |

Non-`GET` requests require `Authorization: Bearer <token>`.
