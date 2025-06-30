# 🎯 Context.md - Référence complète de l'API Equitrec

> **Fichier de contexte permanent** - Toutes les informations essentielles pour comprendre rapidement le projet et ses spécificités

---

## 📋 **Vue d'ensemble du projet**

### **Identité du projet**
- **Nom**: equitrec-ts-api
- **Description**: API REST pour la gestion des compétitions équestres avec système de notation et authentification QR Code sécurisée
- **Version**: 2.0.0 (avec fonctionnalités QR Code)
- **Langage**: TypeScript avec Node.js
- **Base URL**: `http://localhost:3000/api/v1`

### **Contexte métier**
- **Domaine**: Compétitions équestres
- **Utilisateurs**: Administrateurs, Juges, Utilisateurs (lecture seule)
- **Workflow principal**: Création compétition → Assignation juges → QR Code → Notation → Validation

---

## 🏗️ **Architecture technique**

### **Stack technologique**
```json
{
  "runtime": "Node.js",
  "framework": "Express.js",
  "language": "TypeScript (strict)",
  "database": "PostgreSQL",
  "auth": "JWT + QR Code system",
  "testing": "Jest",
  "security": "bcrypt + helmet + cors"
}
```

### **Structure des dossiers (IMPORTANTE)**
```
src/
├── app.ts                 # Configuration Express principale
├── server.ts             # Point d'entrée du serveur
├── config/
│   ├── database.ts       # Configuration PostgreSQL + Pool
│   └── index.ts          # Variables d'environnement
├── controllers/          # Contrôleurs HTTP (8 fichiers)
│   ├── authController.ts
│   ├── qrCodeController.ts  # ⭐ Innovation QR Code
│   ├── cavalierController.ts
│   ├── clubController.ts
│   ├── epreuveController.ts
│   └── ficheNotationController.ts
├── models/               # Modèles de données TypeScript
│   ├── User.ts
│   ├── Competition.ts    # ⭐ Nouveau modèle
│   ├── QRSession.ts      # ⭐ Innovation QR
│   ├── FicheNotation.ts
│   ├── Cavalier.ts
│   ├── Club.ts
│   ├── Epreuve.ts
│   └── Juge.ts           # ⭐ Nouveau modèle
├── services/             # Logique métier (8 services)
│   ├── authService.ts
│   ├── qrCodeService.ts  # ⭐ Service principal QR
│   ├── competitionService.ts
│   ├── jugeService.ts
│   └── [autres services]
├── middlewares/          # Middlewares de sécurité
│   ├── auth.ts           # JWT + Autorisation par rôles
│   └── index.ts
├── routes/               # Définition des routes API
│   ├── qr.ts            # ⭐ Routes QR Code
│   ├── auth.ts
│   └── [autres routes]
└── types/
    └── index.ts          # Types globaux TypeScript
```

---

## 🔐 **Système d'authentification (CRITIQUE)**

### **Rôles utilisateur**
```typescript
enum UserRoles {
  SUPER_ADMIN = 1,  // Gestion complète + QR Code
  JUDGE = 2,        // Notation + QR Auth  // ⚠️ ATTENTION: Dans le code c'est role = 3
  USER = 3          // Lecture seule       // ⚠️ ATTENTION: Dans le code c'est role = 2
}
```

**⚠️ IMPORTANT**: Il y a une incohérence dans la documentation vs code :
- README dit JUDGE = 2, mais le code utilise role = 3 pour JUDGE
- Toujours vérifier `src/middlewares/auth.ts` pour les valeurs réelles

### **Système QR Code (INNOVATION MAJEURE)**
```typescript
// Workflow QR Code
1. Admin génère QR pour juge/compétition spécifique
2. QR contient JWT avec payload competition-based
3. QR valide UNIQUEMENT le jour de la compétition
4. Validation QR → génération token permanent 24h
5. Token permanent pour accès API normal
```

**Fichiers clés QR Code**:
- `src/services/qrCodeService.ts` - Logique principale
- `src/controllers/qrCodeController.ts` - Endpoints HTTP
- `src/routes/qr.ts` - Routes publiques/privées

---

## 📊 **Modèle de données (ESSENTIEL)**

### **Entités principales**
```sql
-- Tables principales par ordre d'importance
1. utilisateur (users + auth)
2. competition (événements)
3. juge (juges certifiés)
4. cavalier (participants)
5. club (organisations)
6. fichenotation (résultats)
7. epreuve (sous-épreuves)
8. juger (relation juge-competition) -- TABLE DE LIAISON CRITIQUE
```

### **Relations critiques**
```typescript
// Relations à retenir absolument
User.idjuge -> Juge.idjuge          // User peut être juge
User.idrole -> Role.idrole          // Système de permissions
Competition ↔ Juge (via table juger) // Assignation juges
FicheNotation -> Cavalier           // Notes par cavalier
Epreuve -> FicheNotation           // Épreuves dans une fiche
```

### **Schéma base de données**
- **Fichier**: `SQL/BddProjet32.sql`
- **Commandes de test**: Scripts dans `tests/database/`
- **Pool de connexions**: Configuré dans `src/config/database.ts`

---

## 🛣️ **API Endpoints (RÉFÉRENCE RAPIDE)**

### **Authentication**
```
POST /auth/register     # Inscription
POST /auth/login        # Connexion classique
GET  /auth/profile      # Profil utilisateur
```

### **QR Code System (INNOVATION)**
```
POST /qr/generate                    # Générer QR juge/compétition [SUPER_ADMIN]
POST /qr/generate/bulk/:competitionId # Tous QR d'une compétition [SUPER_ADMIN]
POST /qr/validate                    # Valider QR Code [PUBLIC]
GET  /qr/status/:competitionId       # Statut QR compétition [SUPER_ADMIN]
```

### **Compétitions**
```
GET    /competitions           # Liste [ALL]
POST   /competitions/create    # Créer [SUPER_ADMIN]
GET    /competitions/:id/judges # Avec juges assignés [ALL]
POST   /competitions/:id/assign-judge # Assigner juge [SUPER_ADMIN]
DELETE /competitions/:competitionId/judges/:judgeId # Retirer juge [SUPER_ADMIN]
```

### **Autres endpoints principaux**
```
# Juges
GET  /judges                   # Liste juges
POST /judges/create           # Créer juge [SUPER_ADMIN]
GET  /judges/:id/competitions # Compétitions du juge

# Cavaliers & Clubs
GET  /cavaliers               # Liste cavaliers
GET  /clubs                   # Liste clubs
POST /cavaliers/create        # [SUPER_ADMIN]

# Notation
GET  /fiches-notation         # Fiches de notation
POST /fiches-notation/create  # Créer fiche [JUDGE]
GET  /epreuves               # Épreuves
POST /epreuves/create        # Créer épreuve [JUDGE]
```

---

## 🔧 **Configuration & Environnement**

### **Variables d'environnement requises**
```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=equitrec
DB_USER=username
DB_PASSWORD=password
DB_SSL=false

# JWT
JWT_SECRET=your-secret-key

# App
NODE_ENV=development
PORT=3000
```

### **Scripts NPM essentiels**
```json
{
  "dev": "nodemon src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "test": "jest --config jest.config.simple.js",
  "test:integration": "jest",
  "test:setup": "psql -U postgres -f tests/database/setup-test-db.sql"
}
```

### **Configuration TypeScript**
- **Strict mode activé**
- **Target**: ES2020
- **Output**: `./dist`
- **Source maps** activées pour debug

---

## 🚨 **Points d'attention critiques**

### **Sécurité**
1. **Mots de passe**: Toujours hachés avec bcrypt (salt rounds: 10)
2. **JWT Tokens**: Expiration 24h par défaut
3. **QR Codes**: Validation temporelle stricte (jour J uniquement)
4. **CORS**: Configuré pour React Native (`localhost:4200`)
5. **Middlewares**: `authenticateToken`, `requireJudgeRole`, `requireSuperAdmin`

### **Base de données**
1. **Transactions**: Utilisées pour suppressions cascade
2. **Pool de connexions**: Max 20, timeout 2s
3. **Requêtes préparées**: Protection injection SQL
4. **Contraintes FK**: Intégrité référentielle stricte

### **Gestion d'erreurs**
1. **Middleware global**: Dans `app.ts`
2. **Logs structurés**: Console.error avec contexte
3. **Codes HTTP**: Respectent les standards REST
4. **Format réponse**: `{success: boolean, message: string, data?: any}`

---

## 🔍 **Patterns de recherche rapide**

### **Pour trouver rapidement dans le code**
```bash
# Fonctionnalité QR Code
grep -r "qr" src/ --include="*.ts"

# Gestion des rôles
grep -r "role\|Role" src/middlewares/

# Modèles de données
ls src/models/

# Routes spécifiques
ls src/routes/

# Services métier
ls src/services/

# Configuration DB
cat src/config/database.ts
```

### **Fichiers à consulter selon le besoin**
```
# Comprendre l'auth → src/middlewares/auth.ts + src/services/authService.ts
# QR Code system → src/services/qrCodeService.ts + src/controllers/qrCodeController.ts
# Modèle spécifique → src/models/[Entity].ts
# Logic métier → src/services/[entity]Service.ts
# Routes API → src/routes/[entity].ts
# Configuration → src/config/
# Documentation → README.md (1100+ lignes)
```

---

## 📈 **Historique des développements**

### **Fonctionnalités récentes (commits)**
```
270094b - CORS React Native
305ef83 - Fix JWT QR Code
1b951a7 - QR Code TypeScript fixes
3dc9266 - QR Code API endpoints
8fe8a4e - Système QR sécurisé
1e33191 - Gestion des juges
c5eabf4 - Gestion compétitions
```

### **Évolution du projet**
1. **Phase 1**: API basique (auth, CRUD)
2. **Phase 2**: Système de notation (fiches, épreuves)
3. **Phase 3**: ⭐ **Innovation QR Code** (authentification révolutionnaire)
4. **Phase 4**: Gestion compétitions complète
5. **Actuel**: Optimisations et corrections TypeScript

---

## 🎯 **Cas d'usage types**

### **Workflow complet standard**
```typescript
// 1. Admin crée compétition
POST /competitions/create { datecompetition: "2024-03-15", idutilisateur: 1 }

// 2. Admin assigne juges
POST /competitions/1/assign-judge { judgeId: 1 }

// 3. Admin génère QR codes
POST /qr/generate/bulk/1

// 4. Jour J - Juge scanne QR
POST /qr/validate { qrToken: "jwt_token..." }
// → Retourne permanent token

// 5. Juge utilise token permanent
Authorization: Bearer permanent_token
POST /fiches-notation/create { ... }
```

### **Tests rapides**
```bash
# Vérifier API active
curl http://localhost:3000/api/v1/health

# Test auth
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

---

## 🔮 **Roadmap & Extensions**

### **Prochaines étapes identifiées**
1. **Interface admin web** (React/Vue)
2. **App mobile juges** (React Native + QR scanner)
3. **Dashboard analytics** compétitions
4. **Notifications temps réel** (WebSockets)
5. **Export PDF** résultats
6. **API versioning** (v2)

### **Améliorations techniques**
1. **Rate limiting** sur endpoints QR
2. **Cache Redis** pour performances
3. **Monitoring** (Prometheus/Grafana)
4. **Docker** containerisation
5. **CI/CD** pipeline

---

## 💡 **Tips pour développement rapide**

### **Démarrage rapide nouvelle feature**
1. Créer model dans `src/models/`
2. Implémenter service dans `src/services/`
3. Créer controller dans `src/controllers/`
4. Ajouter routes dans `src/routes/`
5. Mettre à jour middlewares si besoin
6. Tests dans `tests/`

### **Debug commun**
- **Erreur JWT**: Vérifier `JWT_SECRET` et format token
- **Erreur DB**: Vérifier pool connexions et variables env
- **Erreur QR**: Vérifier date compétition et assignation juge
- **Erreur rôles**: Vérifier valeurs exactes dans `auth.ts`

---

**🎯 Ce fichier Context.md doit être consulté en premier dans chaque session pour une compréhension immédiate et complète du projet.**