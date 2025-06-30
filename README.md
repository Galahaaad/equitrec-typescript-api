# API Equitrec - Documentation

API REST pour la gestion des compétitions équestres avec système de notation, évaluation et **authentification QR Code sécurisée** pour les juges.

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
  - [🆕 Compétitions](#routes-compétitions)
  - [🆕 Juges](#routes-juges)
  - [🆕 QR Code Authentication](#routes-qr-code)
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
- **SUPER_ADMIN** (idrole: 1) : Accès complet + gestion QR Codes
- **GÉRANT** (idrole: 2) : Gestion intermédiaire
- **JUGE** (idrole: 3) : Gestion des notations et épreuves + authentification QR

### 🆕 Authentification QR Code :
Les juges peuvent s'authentifier via QR Code pour les compétitions :
1. **Admin génère** un QR Code spécifique à la compétition
2. **QR Code valide** uniquement le jour de la compétition
3. **Scan & Auth** : authentification instantanée pour 24h
4. **Sécurité** : JWT avec vérification assignation juge/compétition

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
  idepreuve: number;
  nomcavalier?: string;
  prenomcavalier?: string;
  nomclub?: string;
  titre?: string;
}
```

### Epreuve
```typescript
{
  idepreuve: number;
  titre: string;
  description: string;
  idjuge: number;
  nomjuge?: string;
  prenomjuge?: string;
}
```

### 🆕 Competition
```typescript
{
  idcompetition: number;
  datecompetition: Date;
  idutilisateur: number;
  nomutilisateur?: string;
  prenomutilisateur?: string;
}
```

### 🆕 Juge
```typescript
{
  idjuge: number;
  nomjuge: string;
  prenomjuge: string;
  codepin?: string;
}
```

### 🆕 QR Code Data
```typescript
{
  qrToken: string;
  judgeId: number;
  competitionId: number;
  competitionDate: string;
  expiresAt: Date;
}
```

### 🆕 Niveau
```typescript
{
  idniveau: number;
  libelle: string;
  description: string;
}
```

### 🆕 Critere
```typescript
{
  idcritere: number;
  libelle: string;
  idniveau: number;
  libelleniveau?: string;
  descriptionniveau?: string;
}
```

### 🆕 Categorie
```typescript
{
  idcategorie: number;
  libelle: string;
  notefinal: number;
}
```

### 🆕 Materiel
```typescript
{
  idmateriel: number;
  libelle: string;
}
```

### 🆕 Caracteristique
```typescript
{
  idcaracteristique: number;
  libelle: string;
  description: string;
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
      "idepreuve": 1,
      "nomcavalier": "Martin",
      "prenomcavalier": "Sophie",
      "nomclub": "Club Équestre de Paris",
      "titre": "Bordure Maraîchère en Selle"
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

#### GET `/fiches-notation/epreuve/:epreuveId`
Récupère les fiches de notation d'une épreuve

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `epreuveId` (number)

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
  "idcavalier": 1,
  "idepreuve": 1
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
    "idcavalier": 1,
    "idepreuve": 1
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
  "idcavalier": 2,
  "idepreuve": 1
}
```

#### DELETE `/fiches-notation/:id`
Suppression d'une fiche de notation

**Pré-requis :** Token JWT + Rôle JUDGE  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

**⚠️ Note :** La suppression utilise une transaction pour nettoyer les références dans la table `contenir`.

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
      "idjuge": 1,
      "nomjuge": "Yazbek",
      "prenomjuge": "Rachel"
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

#### GET `/epreuves/juge/:jugeId`
Récupère les épreuves d'un juge

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `jugeId` (number)

#### POST `/epreuves/create`
Création d'une nouvelle épreuve

**Pré-requis :** Token JWT + Rôle JUDGE  
**Headers :** `Authorization: Bearer <token>`  
**Body :**
```json
{
  "titre": "Dressage libre",
  "description": "Épreuve de dressage avec musique et chorégraphie libre",
  "idjuge": 1
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
    "idjuge": 1
  },
  "message": "Épreuve créée avec succès"
}
```

**Validation :**
- `titre` : requis, max 100 caractères
- `description` : requise, max 500 caractères
- `idjuge` : requis, doit exister

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
  "idjuge": 2
}
```

#### DELETE `/epreuves/:id`
Suppression d'une épreuve

**Pré-requis :** Token JWT + Rôle JUDGE  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

**⚠️ Note :** La suppression utilise une transaction pour nettoyer les références dans la table `detenir`.

---

### 🆕 Routes Compétitions

#### GET `/competitions`
Liste toutes les compétitions

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "idcompetition": 1,
      "datecompetition": "2024-02-15T00:00:00.000Z",
      "idutilisateur": 1,
      "nomutilisateur": "Admin",
      "prenomutilisateur": "System"
    }
  ],
  "message": "Compétitions récupérées avec succès"
}
```

#### GET `/competitions/:id`
Récupère une compétition par ID

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

#### GET `/competitions/:id/judges`
Récupère une compétition avec ses juges assignés

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "idcompetition": 1,
    "datecompetition": "2024-02-15T00:00:00.000Z",
    "juges": [
      {
        "idjuge": 1,
        "nomjuge": "Dubois",
        "prenomjuge": "Marie",
        "hasUserAccount": true,
        "idutilisateur": 5
      }
    ]
  }
}
```

#### POST `/competitions/create`
Création d'une nouvelle compétition

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`  
**Body :**
```json
{
  "datecompetition": "2024-03-15",
  "idutilisateur": 1
}
```

#### PUT `/competitions/:id`
Mise à jour d'une compétition

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

#### DELETE `/competitions/:id`
Suppression d'une compétition

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

**⚠️ Note :** La suppression utilise une transaction pour nettoyer les références dans les tables `juger` et `participer`.

#### POST `/competitions/:id/assign-judge`
Assigner un juge à une compétition

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`  
**Body :**
```json
{
  "judgeId": 1
}
```

#### DELETE `/competitions/:competitionId/judges/:judgeId`
Retirer un juge d'une compétition

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`

---

### 🆕 Routes Juges

#### GET `/judges`
Liste tous les juges

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "idjuge": 1,
      "nomjuge": "Dubois",
      "prenomjuge": "Marie"
    }
  ],
  "message": "Juges récupérés avec succès"
}
```

#### GET `/judges/:id`
Récupère un juge par ID

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

#### GET `/judges/:id/competitions`
Récupère un juge avec ses compétitions assignées

**Pré-requis :** Token JWT valide  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

#### POST `/judges/create`
Création d'un nouveau juge

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`  
**Body :**
```json
{
  "nomjuge": "Martin",
  "prenomjuge": "Pierre"
}
```

#### PUT `/judges/:id`
Mise à jour d'un juge

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

#### DELETE `/judges/:id`
Suppression d'un juge

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `id` (number)

---

### 🆕 Routes QR Code Authentication

#### POST `/qr/generate`
Génération d'un QR Code pour un juge spécifique

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`  
**Body :**
```json
{
  "competitionId": 1,
  "judgeId": 1
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "qrData": "{\"token\":\"...\",\"competition\":1,\"judge\":1,\"date\":\"2024-02-15\"}",
    "judgeInfo": {
      "idjuge": 1,
      "nomjuge": "Dubois",
      "prenomjuge": "Marie"
    },
    "competitionInfo": {
      "idcompetition": 1,
      "datecompetition": "2024-02-15T00:00:00.000Z"
    },
    "expiresAt": "2024-02-15T23:59:59.999Z"
  },
  "message": "QR Code généré avec succès"
}
```

#### POST `/qr/generate/bulk/:competitionId`
Génération en masse des QR Codes pour une compétition

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `competitionId` (number)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "competitionId": 1,
    "qrCodes": [
      {
        "success": true,
        "data": { /* QR Code data for each judge */ }
      }
    ],
    "count": 3
  },
  "message": "3 QR Code(s) généré(s) avec succès"
}
```

#### POST `/qr/validate`
Validation d'un QR Code par un juge

**Pré-requis :** Aucun (route publique)  
**Body :**
```json
{
  "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "permanentToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "idutilisateur": 5,
      "nomutilisateur": "Dubois",
      "prenomutilisateur": "Marie",
      "username": "marie.dubois",
      "idjuge": 1,
      "idrole": 2
    },
    "competition": {
      "idcompetition": 1,
      "datecompetition": "2024-02-15T00:00:00.000Z"
    },
    "message": "Authentification réussie pour la compétition du 2024-02-15"
  }
}
```

**Codes d'erreur spécifiques :**
- `401` : QR Code expiré ou invalide
- `403` : QR Code utilisable uniquement le jour de la compétition
- `400` : Juge non assigné à cette compétition

#### GET `/qr/status/:competitionId`
Statut des QR Codes pour une compétition

**Pré-requis :** Token JWT + Rôle SUPER_ADMIN  
**Headers :** `Authorization: Bearer <token>`  
**Paramètres :** `competitionId` (number)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "competition": {
      "idcompetition": 1,
      "datecompetition": "2024-02-15T00:00:00.000Z",
      "isToday": false
    },
    "judges": [
      {
        "idjuge": 1,
        "nomjuge": "Dubois",
        "prenomjuge": "Marie",
        "canGenerateQR": true,
        "qrGenerationStatus": "ready"
      }
    ],
    "summary": {
      "totalJudges": 3,
      "eligibleForQR": 2,
      "canGenerateQR": true
    }
  }
}
```

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

# 3. Créer une épreuve (JUGE requis)
curl -X POST http://localhost:3000/api/v1/epreuves/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Bordure Maraîchère en Selle",
    "description": "Épreuve pour démo",
    "idjuge": 1
  }'

# 4. Créer une fiche de notation (JUGE requis)
curl -X POST http://localhost:3000/api/v1/fiches-notation/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cumulenote": 10,
    "appreciation": "Très bon cavalier, bonne technique.",
    "isvalidate": true,
    "idcavalier": 1,
    "idepreuve": 1
  }'
```

### 🆕 Workflow complet QR Code pour une compétition
```bash
# 1. Créer une compétition (SUPER_ADMIN requis)
curl -X POST http://localhost:3000/api/v1/competitions/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "datecompetition": "2024-03-15",
    "idutilisateur": 1
  }'

# 2. Créer et assigner des juges (SUPER_ADMIN requis)
curl -X POST http://localhost:3000/api/v1/judges/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomjuge": "Dubois",
    "prenomjuge": "Marie"
  }'

curl -X POST http://localhost:3000/api/v1/competitions/1/assign-judge \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"judgeId": 1}'

# 3. Vérifier le statut QR de la compétition
curl -X GET http://localhost:3000/api/v1/qr/status/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Générer tous les QR Codes pour la compétition
curl -X POST http://localhost:3000/api/v1/qr/generate/bulk/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Le jour J : juge valide son QR Code (route publique)
curl -X POST http://localhost:3000/api/v1/qr/validate \
  -H "Content-Type: application/json" \
  -d '{
    "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'

# 6. Juge utilise le token permanent pour accéder aux fonctionnalités
curl -X GET http://localhost:3000/api/v1/fiches-notation \
  -H "Authorization: Bearer PERMANENT_TOKEN_FROM_QR_VALIDATION"
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
6. **🆕 QR Code** : Authentification sécurisée avec JWT competition-based
7. **🆕 Competition Management** : Gestion complète des compétitions et assignations
8. **🆕 Judge Management** : CRUD complet pour les juges avec relations
9. **🆕 Security** : QR Codes valides uniquement le jour de compétition
10. **🆕 Scalability** : Génération en masse et stateless architecture
11. **🆕 New Schema** : Épreuves liées aux juges, fiches de notation liées aux épreuves

---

*Documentation générée automatiquement - Version 2.0.0* 🆕