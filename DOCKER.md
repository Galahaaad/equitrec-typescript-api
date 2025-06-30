# 🐳 Guide Docker - API Equitrec

## 🎯 Vue d'ensemble

Cette API est entièrement conteneurisée avec Docker pour faciliter le développement, les démos et le déploiement.

## 🏗️ Architecture

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   API Node.js   │  │  PostgreSQL DB  │  │   Redis Cache   │
│   Port: 3000    │  │   Port: 5432    │  │   Port: 6379    │
│                 │  │                 │  │   (optionnel)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌─────────────────┐
                    │ Docker Network  │
                    │ equitrec-network│
                    └─────────────────┘
```

## 🚀 Démarrage rapide

### Développement
```bash
# Lancer l'environnement complet de développement
docker-compose -f docker-compose.dev.yml up -d

# L'API sera accessible sur http://localhost:3001
# PostgreSQL sur localhost:5433

# ⚡ Hashage automatique des mots de passe
# Les mots de passe sont automatiquement hashés avec bcrypt au démarrage
```

### Production
```bash
# Lancer l'environnement de production
docker-compose up -d

# L'API sera accessible sur http://localhost:3000
# PostgreSQL sur localhost:5432
```

## 📋 Commandes utiles

### Gestion des services
```bash
# Voir le statut des conteneurs
docker-compose ps

# Voir les logs en temps réel
docker-compose logs -f api

# Redémarrer un service
docker-compose restart api

# Arrêter tous les services
docker-compose down
```

### Développement
```bash
# Rebuilder après changement de code
docker-compose -f docker-compose.dev.yml build api-dev

# Accéder au shell du conteneur API
docker-compose exec api-dev sh

# Lancer les tests
docker-compose exec api-dev npm test
```

### Base de données
```bash
# Accéder à PostgreSQL (dev)
docker-compose -f docker-compose.dev.yml exec postgres-dev psql -U dev_user -d equitrec_dev

# Accéder à PostgreSQL (prod)
docker-compose exec postgres psql -U equitrec_user -d equitrec

# Hasher manuellement les mots de passe (si nécessaire)
docker-compose -f docker-compose.dev.yml exec api-dev npm run hash-passwords

# Sauvegarder la base
docker-compose exec postgres pg_dump -U equitrec_user equitrec > backup.sql

# Restaurer la base
docker-compose exec -T postgres psql -U equitrec_user equitrec < backup.sql
```

## 🔧 Configuration

### Variables d'environnement
Les variables sont définies dans `docker-compose.yml` :

```yaml
environment:
  NODE_ENV: production
  PORT: 3000
  DB_HOST: postgres
  DB_PORT: 5432
  DB_NAME: equitrec
  DB_USER: equitrec_user
  DB_PASSWORD: equitrec_password
  JWT_SECRET: your-super-secret-jwt-key
```

### Ports utilisés
- **3000** : API en production
- **3001** : API en développement
- **5432** : PostgreSQL production
- **5433** : PostgreSQL développement
- **6379** : Redis (optionnel)

## 🏥 Health Checks

Les services incluent des health checks automatiques :

### API
```bash
# Test manuel du health check
curl http://localhost:3000/api/v1/health
```

### PostgreSQL
```bash
# Vérifier la connexion DB
docker-compose exec postgres pg_isready -U equitrec_user
```

## 📊 Monitoring

### Logs structurés
```bash
# Logs de l'API avec timestamps
docker-compose logs -f api | grep "$(date '+%Y-%m-%d')"

# Logs d'erreurs uniquement
docker-compose logs api 2>&1 | grep ERROR
```

### Métriques conteneurs
```bash
# Utilisation ressources
docker stats

# Espace disque des volumes
docker system df
```

## 🔒 Sécurité

### Bonnes pratiques implémentées
- ✅ Utilisateur non-root dans les conteneurs
- ✅ Images Alpine minimales
- ✅ Secrets via variables d'environnement
- ✅ Réseau Docker isolé
- ✅ Health checks configurés

### Variables sensibles
**⚠️ IMPORTANT** : Changez ces valeurs en production :
- `JWT_SECRET`
- `POSTGRES_PASSWORD`
- `POSTGRES_USER`

## 🚀 Déploiement

### Environnements multiples
```bash
# Staging
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### CI/CD avec Docker
```yaml
# Exemple GitHub Actions
- name: Build and push Docker image
  run: |
    docker build -t equitrec-api:${{ github.sha }} .
    docker push equitrec-api:${{ github.sha }}
```

## 🧹 Maintenance

### Nettoyage
```bash
# Supprimer les conteneurs arrêtés
docker container prune

# Supprimer les images non utilisées
docker image prune

# Nettoyage complet (ATTENTION: supprime tout)
docker system prune -a --volumes
```

### Sauvegarde volumes
```bash
# Sauvegarder les données PostgreSQL
docker run --rm -v equitrec-ts-api_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restaurer les données
docker run --rm -v equitrec-ts-api_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 🐛 Troubleshooting

### Problèmes courants

#### Port déjà utilisé
```bash
# Trouver le processus utilisant le port 3000
lsof -i :3000
sudo kill -9 <PID>
```

#### Problème de connexion DB
```bash
# Vérifier que PostgreSQL est prêt
docker-compose logs postgres

# Recréer le volume de base de données
docker-compose down -v
docker-compose up -d
```

#### Build échoué
```bash
# Nettoyer le cache Docker
docker builder prune

# Rebuild sans cache
docker-compose build --no-cache
```

### Logs de debug
```bash
# Activer les logs détaillés
export COMPOSE_LOG_LEVEL=DEBUG
docker-compose up
```

## 📈 Performance

### Optimisations incluses
- **Multi-stage build** : Image finale minimale
- **Layer caching** : Build rapide
- **Health checks** : Détection proactive des problèmes
- **Resource limits** : Utilisation mémoire contrôlée

### Métriques recommandées
- Temps de réponse API
- Utilisation mémoire conteneurs
- Connexions DB actives
- Taille des logs

---

**💡 Tip** : Consultez toujours `Context.md` pour comprendre l'architecture de l'API avant de travailler avec Docker.