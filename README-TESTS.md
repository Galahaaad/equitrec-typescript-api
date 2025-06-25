# Tests pour l'API EquiTrec

## Configuration

### Prérequis
- PostgreSQL installé et en cours d'exécution
- Base de données de test configurée

### Première installation
1. Installer les dépendances de test :
```bash
npm install
```

2. Configurer la base de données de test :
```bash
npm run test:setup
```

3. Copier et configurer les variables d'environnement :
```bash
cp .env.test .env.test.local
# Modifier les valeurs selon votre configuration PostgreSQL
```

## Lancement des tests

### Tests unitaires et d'intégration
```bash
# Lancer tous les tests
npm test

# Tests en mode watch (redémarre automatiquement)
npm run test:watch

# Tests avec rapport de couverture
npm run test:coverage
```

## Structure des tests

```
tests/
├── setup.ts                                    # Configuration globale des tests
├── database/
│   └── setup-test-db.sql                      # Script de création de la DB de test
├── services/
│   └── ficheNotationService.test.ts           # Tests unitaires du service
└── controllers/
    └── ficheNotationController.test.ts        # Tests d'intégration du contrôleur
```

## Tests implémentés

### FicheNotationService
- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ Validation des données d'entrée
- ✅ Gestion des erreurs
- ✅ **Logique de transaction** pour la suppression
- ✅ Test du rollback en cas d'erreur
- ✅ Vérification de la nullification des références

### FicheNotationController
- ✅ Tests HTTP pour tous les endpoints
- ✅ Validation des codes de statut
- ✅ Gestion des erreurs spécifiques (404, 400, 500)
- ✅ Tests des paramètres invalides

## Points clés testés

### Logique de suppression avec transaction
Les tests vérifient que lors de la suppression d'une fiche :
1. Les références dans `epreuve` sont nullifiées (pas supprimées)
2. Les liens `contenir` sont supprimés
3. La fiche elle-même est supprimée
4. **En cas d'erreur : rollback complet**

### Réutilisation des éléments de configuration
Les tests confirment que critères, matériel et caractéristiques restent disponibles après suppression d'une fiche.

## Base de données de test

La base `equitrec_test` est isolée de la production et nettoyée entre chaque test pour garantir l'indépendance des tests.

## Commandes utiles

```bash
# Nettoyer la base de test
psql -U postgres -d equitrec_test -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Recréer la structure
npm run test:setup

# Voir les logs détaillés
npm test -- --verbose
```