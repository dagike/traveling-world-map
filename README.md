# traveling-world-map

Interactive world map of the countries and cities I've visited, the theme parks I went to,
and my favourite coaster / flat ride at each park.

Data is hierarchical: **country → city → theme park → ride**.

## Structure

This is an npm workspaces monorepo:

| Package | Purpose |
|---|---|
| `shared/` | TypeScript types shared by the client and server |
| `server/` | REST API + database (Fastify + Drizzle + SQLite) — _planned_ |
| `client/` | React + TypeScript app with the interactive map (react-leaflet) — _planned_ |

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

## Auth

Reads are public. Creating/updating/deleting data requires the admin password
(`ADMIN_PASSWORD`, default `admin` in dev): `POST /api/login` with `{ "password": "..." }`
returns a token to send as `Authorization: Bearer <token>`.

## Status

Early scaffold. Being built in small increments.
