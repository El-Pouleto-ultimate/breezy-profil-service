# Wiki : Profil Service (Breezy)

Ce document est le Wiki officiel du **Profil Service**. Il détaille le fonctionnement complet de ce microservice. Il a été conçu pour permettre à tout développeur (vous y compris lors des révisions pour la soutenance) de comprendre l'architecture et les choix techniques de ce dépôt.

---

## 1. Rôle et Architecture du Service

Le Profil Service a une responsabilité unique et limitée dans notre architecture en microservices : **Gérer les informations publiques des utilisateurs (bio, avatar, nom d'affichage) et le système de notifications (bonus).**

### Différence avec l'Auth / User Service
Il est primordial de comprendre que ce service **ne gère pas** les mots de passe, les emails ou les adresses de connexion. Ces données ultra-sensibles sont gérées par le User Service de votre collègue. Le Profil Service se contente de s'associer à l'ID technique d'un utilisateur (`user_id`).

### L'API Gateway
Comme tous les services backend du projet, ce service est protégé par une **API Gateway**. Les requêtes reçues par ce service ont déjà été authentifiées. Le serveur sait qui fait la demande en lisant simplement le header HTTP `x-user-id`.

---

## 2. Point d'Entrée (`app.js` et `index.js`)

L'application démarre en deux temps :
1. **L'application Express (`src/app.js`)** : C'est ici que l'on configure le "réceptionniste" web. On lui apprend à lire le JSON (`express.json()`), on lui donne un journal de bord pour tracker les requêtes entrantes (`morgan('dev')`), et on lui branche le système de routage sur `/api`.
2. **Le lancement réseau (`index.js`)** : Ce fichier appelle le module Mongoose pour se connecter à la base de données. Si la connexion à MongoDB réussit, alors seulement il démarre le réceptionniste web sur un port réseau (port 4001).

---

## 3. Les Modèles de Données (MongoDB / Mongoose)

### `profile.model.js`
C'est le schéma qui définit à quoi ressemble un profil public dans notre base de données.
- `user_id` : C'est la clé de voûte. Il est défini avec `required: true` et `unique: true`. Impossible de créer deux profils pour la même personne.
- `display_name`, `avatar_url`, `banner_url` : Les informations visuelles classiques d'un réseau social (Fx10).
- `bio` : Un texte limité par `maxlength: 160`, ce qui force la concision façon Twitter/X.

*Note : Les abonnements (suivre/être suivi) n'apparaissent pas ici car cette logique a été intelligemment déportée dans le User Service global.*

### `notification.model.js` (Fonctionnalité Bonus)
Permet de tracer les évènements (quelqu'un vous a suivi, quelqu'un a liké votre post).
- `recipient_user_id` : La personne qui doit recevoir la notification.
- `from_user_id` et `from_username` : L'utilisateur qui a déclenché l'évènement.
- `post_id` : L'identifiant du post concerné (optionnel, par défaut `null`).
- `type` : Le type d'évènement ('like', 'follow', 'mention', 'comment', 'reply').
- `is_read` : Un booléen (vrai/faux) pour savoir si la notification a été vue, avec `default: false`.

---

## 4. La Logique Métier (Les Contrôleurs)

Le dossier `src/controllers/` abrite le code exécutant l'action demandée par l'utilisateur.

### Le Contrôleur de Profil (`profile.controller.js`)

**La fonction `getProfile`**
Quand on demande à voir le profil de quelqu'un, le système fait une opération très intelligente : un `findOneAndUpdate` avec l'option `upsert: true`. 
*Explication* : Si le profil n'existe pas encore dans la base (par exemple si l'utilisateur vient tout juste de créer son compte sur le User Service et qu'on regarde son profil pour la première fois), Mongoose va le créer à la volée avec des valeurs par défaut. Cela évite les erreurs 404 frustrantes.

**La fonction `updateProfile`**
C'est ici qu'on protège la donnée. 
1. Le contrôleur vérifie que la personne qui demande la modification (`req.headers['x-user-id']`) est bien la propriétaire du profil (`req.params.userId`). Si ce n'est pas le cas, on renvoie une erreur 403 (Forbidden).
2. Il y a un filtrage sécurisé (`allowedFields`) pour empêcher un petit malin d'envoyer des données qu'il n'a pas le droit de modifier (par exemple, essayer de changer son `user_id`). Seuls la bio, le nom, et les images sont autorisés à être modifiés.

---

## 5. Le Routage

Dans `src/routes/profil.routes.js`, on câble nos URL à nos fonctions de contrôleur.
On utilise le modèle REST :
- `GET /profiles/:userId` : L'action de "Lire" le profil. Déclenche `profileCtrl.getProfile`.
- `PUT /profiles/:userId` : L'action de "Mettre à jour" le profil de manière complète. Déclenche `profileCtrl.updateProfile`.

On retrouve la même logique pour les notifications (`PUT /notifications/:id/read` pour marquer une notification précise comme lue).

---

## Pour résumer en soutenance
Si le jury vous interroge sur ce service, vous pourrez mettre en avant que :
1. Vous avez respecté l'isolation des données (aucune donnée secrète dans le profil).
2. Vous avez mis en place des protections au niveau des contrôleurs (on ne modifie que ce qui est autorisé, par la personne autorisée).
3. Vous avez été proactif en gérant la création dynamique d'un profil lors du premier accès (l'upsert) pour améliorer l'expérience utilisateur.
