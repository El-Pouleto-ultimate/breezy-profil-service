# Breezy: profil service

Public profiles and notifications for [Breezy](https://github.com/El-Pouleto-ultimate/breezy-infra), a
Twitter-like social network built as microservices. A profile holds a bio of up to 160 characters, an avatar, a
banner and a location, and is created automatically the first time it is read. Notifications cover likes,
follows, mentions, comments and replies; the other services create them through an internal endpoint.

Team project at CESI École d'Ingénieurs (distributed applications, June 2026).

Stack: Node.js 20, Express 5, Mongoose 9 on MongoDB, axios.

## API

| Method | Path | Access |
|---|---|---|
| GET | `/api/profils/:userId` | public |
| PUT | `/api/profils/:userId` | own profile only |
| GET | `/api/notifications` | signed in |
| PUT | `/api/notifications/read-all` | signed in |
| PUT | `/api/notifications/:id/read` | signed in |
| POST | `/api/notifications/internal` | internal |

"Signed in" routes read the `x-user-id` header that the gateway sets once it has checked the JWT. The internal
route requires the `x-internal-secret` header shared by the services.

## Configuration

Copy `.env.example` to `.env`. Variables: `PORT`, `MONGO_URI`, `AUTH_SERVICE_URL`, `INTERNAL_SECRET`,
`CORS_ORIGIN`.

## Run

The whole stack runs with Docker Compose from [breezy-infra](https://github.com/El-Pouleto-ultimate/breezy-infra).
On its own: `npm install`, then `npm run dev` or `npm start`. There are no automated tests yet.
[WIKI.md](WIKI.md), in French, walks through the code: architecture, entry point, models and controllers.

## Team

[Estebge](https://github.com/Estebge), [haguetm](https://github.com/haguetm),
[Jessica14112005](https://github.com/Jessica14112005), [Tuture57](https://github.com/Tuture57).
