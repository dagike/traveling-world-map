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
```

## Status

Early scaffold. Being built in small increments.
