# traveling-world-map

Interactive world map of the countries and cities I've visited, the theme parks I went to,
and my favourite coaster / flat ride at each park.

Data is hierarchical: **country → city → theme park → ride**.

## Structure

This is an npm workspaces monorepo:

| Package | Purpose |
|---|---|
| `shared/` | TypeScript types shared by the client and server |
| `server/` | REST API + database (Fastify + Drizzle + SQLite) |
| `client/` | React + TypeScript app with the interactive map (react-leaflet) |

## Features

- Visited countries highlighted on a Leaflet world map, with city and theme-park markers.
- Hover a country for its city list, a city for photo placeholders, a park for its
  favourite coaster / flat ride.
- Click any element for a detail panel (country → city → theme park → rides).
- Admin mode (password) adds inline forms to create / edit / delete countries, cities,
  theme parks and rides, including a "pick on map" location picker and a favourite toggle.
- Stats panel with totals and lists of countries, parks and favourite coasters.

## Development

```bash
npm install
npm run typecheck

npm run dev            # runs the server (:4000) and the client (:5173) together
npm run dev:server     # server only (Fastify + SQLite; migrations run on start)
npm run dev:client     # client only (Vite; proxies /api to the server)

npm run db:generate -w @twm/server   # create a migration after editing the schema
npm run db:seed -w @twm/server       # insert sample data
```

## Map data

`client/public/countries.geo.json` is a trimmed Natural Earth 1:110m admin-0 dataset
(properties reduced to `name` + `code`, coordinates rounded). `code` is the Natural Earth
`ADM0_A3` value; a country row's `isoA3` must match it for the country to highlight.

## Auth

Reads are public. Creating/updating/deleting data requires the admin password
(`ADMIN_PASSWORD`, default `admin` in dev): `POST /api/login` with `{ "password": "..." }`
returns a token to send as `Authorization: Bearer <token>`.

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
