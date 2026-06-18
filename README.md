# Breezy Profil Service

Service gérant les profils publics des utilisateurs et les notifications.

## Prérequis
- Node.js
- MongoDB
- Créer un fichier `.env` basé sur `.env.example`

## API Routes (Port par défaut : 4001)

### Profils
- `GET /api/profiles/:userId` : Récupère le profil d'un utilisateur.
- `PUT /api/profiles/:userId` : Met à jour un profil.
  - Header requis : `x-user-id` (doit correspondre au `userId`).
  - Body optionnel : `display_name`, `bio` (max 160 char), `avatar_url`, `banner_url`.

### Notifications
- `GET /api/notifications` : Récupère les notifications de l'utilisateur (Header `x-user-id` requis).
- `PUT /api/notifications/read-all` : Marque toutes les notifications comme lues.
- `PUT /api/notifications/:id/read` : Marque une notification spécifique comme lue.
- `POST /api/notifications/internal` : (Usage interne) Créer une notification.