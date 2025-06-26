# API Equitrec - Documentation

API REST pour la gestion des compétitions équestres avec système de notation et évaluation.

## 📋 Table des matières

- [Installation](#installation)
- [Authentification](#authentification)
- [Modèles de données](#modèles-de-données)
- [Routes API](#routes-api)
  - [Authentification](#routes-authentification)
  - [Clubs](#routes-clubs)
  - [Cavaliers](#routes-cavaliers)
  - [Fiches de notation](#routes-fiches-de-notation)
  - [Épreuves](#routes-épreuves)
  - [Utilitaires](#routes-utilitaires)
- [Codes d'erreur](#codes-derreur)
- [Exemples d'utilisation](#exemples-dutilisation)

---

## 🚀 Installation

```bash
npm install
npm run dev
```

**Base URL:** `http://localhost:3000/api/v1`

---

## 🔐 Authentification

L'API utilise l'authentification JWT Bearer Token.

### Headers requis pour les routes protégées :
```
Authorization: Bearer <votre_token_jwt>
```

### Rôles disponibles :
- **SUPER_ADMIN** (idrole: 1) : Accès complet
- **JUDGE** (idrole: 2) : Gestion des notations et épreuves
- **USER** (idrole: 3) : Lecture seule

---

## 📊 Modèles de données

### User
```typescript
{
  idutilisateur: number;
  nomutilisateur: string;
  prenomutilisateur: string;
  username: string;
  idjuge?: number | null;
  idrole: number;
}
```

### Club
```typescript
{
  idclub: number;
  nomclub: string;
}
```

### Cavalier
```typescript
{
  idcavalier: number;
  nomcavalier: string;
  prenomcavalier: string;
  datenaissance: Date;
  numerodossard: number;
  idclub: number;
  nomclub?: string;
}
```

### FicheNotation
```typescript
{
  idfichenotation: number;
  cumulenote: number;
  appreciation: string;
  isvalidate: boolean;
  idcavalier: number;
  nomcavalier?: string;
  prenomcavalier?: string;
  nomclub?: string;
}
```

### Epreuve
```typescript
{
  idepreuve: number;
  titre: string;
  description: string;
  idfichenotation?: number;
}
```

---

## 🛣️ Routes API

### Routes Authentification

#### POST `/auth/register`
Inscription d'un nouvel utilisateur

**Pré-requis :** Aucun  
**Body :**
```json
{
  "nomutilisateur": "Dupont",
  "prenomutilisateur": "Jean",
  "username": "jean.dupont",
  "password": "motdepasse123",
  "idjuge": 1,
  "idrole": 2
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": { /* UserResponse */ },
    "token": "jwt_token_here"
  }
}
```

#### POST `/auth/login`
Connexion utilisateur

**Pré-requis :** Aucun  
**Body :**
```json
{
  "username": "jean.dupont",
  "password": "motdepasse123"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": { /* UserResponse */ },
    "token": "jwt_token_here"
  }
}
```

#### GET `/auth/profile`
Récupération du profil utilisateur

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
{
  "success": true,
  "data": { /* UserResponse */ }
}
```

---

### Routes Clubs

#### GET `/clubs`
Liste tous les clubs

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "idclub": 1,
      "nomclub": "Club Équestre de Paris"
    }
  ],
  "message": "Clubs récupérés avec succès"
}
```

#### GET `/clubs/:id`
Récupère un club par ID

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "idclub": 1,
    "nomclub": "Club Équestre de Paris"
  },
  "message": "Club récupéré avec succès"
}
```

#### POST `/clubs/create`
Création d'un nouveau club

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`  
**Body :**
```json
{
  "nomclub": "Nouveau Club Équestre"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "idclub": 2,
    "nomclub": "Nouveau Club Équestre"
  },
  "message": "Club créé avec succès"
}
```

---

### Routes Cavaliers

#### GET `/cavaliers`
Liste tous les cavaliers

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "idcavalier": 1,
      "nomcavalier": "Martin",
      "prenomcavalier": "Sophie",
      "datenaissance": "1995-03-15T00:00:00.000Z",
      "numerodossard": 42,
      "idclub": 1,
      "nomclub": "Club Équestre de Paris"
    }
  ],
  "message": "Cavaliers récupérés avec succès"
}
```

#### GET `/cavaliers/:id`
Récupère un cavalier par ID

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

#### GET `/cavaliers/club/:clubId`
Récupère les cavaliers d'un club

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `clubId` (number)

#### POST `/cavaliers/create`
Création d'un nouveau cavalier

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`  
**Body :**
```json
{
  "nomcavalier": "Durand",
  "prenomcavalier": "Pierre",
  "datenaissance": "1998-07-22",
  "numerodossard": 123,
  "idclub": 1
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "idcavalier": 2,
    "nomcavalier": "Durand",
    "prenomcavalier": "Pierre",
    "datenaissance": "1998-07-22T00:00:00.000Z",
    "numerodossard": 123,
    "idclub": 1
  },
  "message": "Cavalier créé avec succès"
}
```

#### PUT `/cavaliers/:id`
Mise à jour d'un cavalier

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)  
**Body :** (tous les champs optionnels)
```json
{
  "nomcavalier": "Nouveau nom",
  "prenomcavalier": "Nouveau prénom",
  "datenaissance": "1999-01-01",
  "numerodossard": 999,
  "idclub": 2
}
```

#### DELETE `/cavaliers/:id`
Suppression d'un cavalier

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

**Réponse :**
```json
{
  "success": true,
  "message": "Cavalier supprimé avec succès"
}
```

---

### Routes Fiches de notation

#### GET `/fiches-notation`
Liste toutes les fiches de notation

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "idfichenotation": 1,
      "cumulenote": 85,
      "appreciation": "Très bonne performance",
      "isvalidate": false,
      "idcavalier": 1,
      "nomcavalier": "Martin",
      "prenomcavalier": "Sophie",
      "nomclub": "Club Équestre de Paris"
    }
  ],
  "message": "Fiches de notation récupérées avec succès"
}
```

#### GET `/fiches-notation/:id`
Récupère une fiche de notation par ID

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

#### GET `/fiches-notation/cavalier/:cavalierId`
Récupère les fiches de notation d'un cavalier

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `cavalierId` (number)

#### POST `/fiches-notation/create`
Création d'une nouvelle fiche de notation

**Pré-requis :** Token JWT + Rôle JUDGE  
**Headers :** `Authorization: Bearer <token>`  
**Body :**
```json
{
  "cumulenote": 92,
  "appreciation": "Excellente performance, technique maîtrisée",
  "isvalidate": false,
  "idcavalier": 1
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "idfichenotation": 2,
    "cumulenote": 92,
    "appreciation": "Excellente performance, technique maîtrisée",
    "isvalidate": false,
    "idcavalier": 1
  },
  "message": "Fiche de notation créée avec succès"
}
```

#### PUT `/fiches-notation/:id`
Mise à jour d'une fiche de notation

**Pré-requis :** Token JWT + Rôle JUDGE  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)  
**Body :** (tous les champs optionnels)
```json
{
  "cumulenote": 88,
  "appreciation": "Performance améliorée",
  "isvalidate": true,
  "idcavalier": 2
}
```

#### DELETE `/fiches-notation/:id`
Suppression d'une fiche de notation

**Pré-requis :** Token JWT + Rôle JUDGE  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

**⚠️ Note :** La suppression utilise une transaction pour nettoyer les références dans les tables `epreuve` et `contenir`.

---

### Routes Épreuves

#### GET `/epreuves`
Liste toutes les épreuves

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "idepreuve": 1,
      "titre": "Saut d'obstacles",
      "description": "Épreuve de saut avec parcours technique de niveau amateur",
      "idfichenotation": 1
    }
  ],
  "message": "Épreuves récupérées avec succès"
}
```

#### GET `/epreuves/:id`
Récupère une épreuve par ID

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

#### GET `/epreuves/fiche/:ficheNotationId`
Récupère les épreuves d'une fiche de notation

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `ficheNotationId` (number)

#### POST `/epreuves/create`
Création d'une nouvelle épreuve

**Pré-requis :** Token JWT + Rôle JUDGE  
**Headers :** `Authorization: Bearer <token>`  
**Body :**
```json
{
  "titre": "Dressage libre",
  "description": "Épreuve de dressage avec musique et chorégraphie libre",
  "idfichenotation": 1
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "idepreuve": 2,
    "titre": "Dressage libre",
    "description": "Épreuve de dressage avec musique et chorégraphie libre",
    "idfichenotation": 1
  },
  "message": "Épreuve créée avec succès"
}
```

**Validation :**
- `titre` : requis, max 100 caractères
- `description` : requise, max 500 caractères
- `idfichenotation` : optionnel, doit exister si spécifié

#### PUT `/epreuves/:id`
Mise à jour d'une épreuve

**Pré-requis :** Token JWT + Rôle JUDGE  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)  
**Body :** (tous les champs optionnels)
```json
{
  "titre": "Nouveau titre",
  "description": "Nouvelle description",
  "idfichenotation": 2
}
```

#### DELETE `/epreuves/:id`
Suppression d'une épreuve

**Pré-requis :** Token JWT + Rôle JUDGE  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

**⚠️ Note :** La suppression utilise une transaction pour nettoyer les références dans la table `detenir`.

---

### Routes Utilitaires

#### GET `/health`
Vérification de l'état de l'API et de la base de données

**Pré-requis :** Aucun

**Réponse :**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "Connected",
  "dbTimestamp": "2024-01-15T10:30:00.123Z"
}
```

#### GET `/`
Information générale sur l'API

**Pré-requis :** Aucun

**Réponse :**
```json
{
  "message": "Bienvenue sur l'API equitrec!",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## ❌ Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès refusé (permissions insuffisantes) |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur interne |

### Format des réponses d'erreur :
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

---

## 💡 Exemples d'utilisation

### Authentification complète
```bash
# 1. Inscription
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nomutilisateur": "Dupont",
    "prenomutilisateur": "Jean",
    "username": "jean.dupont",
    "password": "motdepasse123",
    "idrole": 2
  }'

# 2. Connexion
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jean.dupont", 
    "password": "motdepasse123"
  }'

# 3. Utilisation du token (remplacer YOUR_TOKEN)
curl -X GET http://localhost:3000/api/v1/clubs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Création d'une fiche de notation complète
```bash
# 1. Créer un club (SUPER_ADMIN requis)
curl -X POST http://localhost:3000/api/v1/clubs/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nomclub": "Mon Club"}'

# 2. Créer un cavalier (SUPER_ADMIN requis)
curl -X POST http://localhost:3000/api/v1/cavaliers/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomcavalier": "Martin",
    "prenomcavalier": "Sophie",
    "datenaissance": "1995-03-15",
    "numerodossard": 42,
    "idclub": 1
  }'

# 3. Créer une fiche de notation (JUDGE requis)
curl -X POST http://localhost:3000/api/v1/fiches-notation/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cumulenote": 85,
    "appreciation": "Très bonne performance",
    "idcavalier": 1
  }'

# 4. Créer une épreuve (JUDGE requis)
curl -X POST http://localhost:3000/api/v1/epreuves/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Saut d obstacles",
    "description": "Épreuve technique de saut",
    "idfichenotation": 1
  }'
```

---

## 🔧 Configuration

Variables d'environnement requises :
```env
DATABASE_URL=postgresql://user:password@localhost:5432/equitrec
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3000
```

---

## 📝 Notes importantes

1. **Sécurité** : Tous les mots de passe sont hachés avec bcrypt
2. **Transactions** : Les suppressions utilisent des transactions pour maintenir l'intégrité
3. **Validation** : Toutes les entrées sont validées côté serveur
4. **Logs** : Les erreurs sont loggées pour faciliter le debugging
5. **Tests** : Suite de tests unitaires disponible avec `npm test`

---

*Documentation générée automatiquement - Version 1.0.0*