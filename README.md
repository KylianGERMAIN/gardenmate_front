# GardenMate Frontend

Application React pour la gestion de votre jardin personnel.

## Configuration

1. Installer les dépendances :
```bash
npm install
```

2. Créer un fichier `.env` à la racine du projet (copier `.env.example`) :
```bash
REACT_APP_API_URL=http://localhost:5000
```

3. Démarrer l'application en mode développement :
```bash
npm start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

## Structure du projet

```
src/
├── components/      # Composants réutilisables
├── contexts/        # Contextes React (Auth, etc.)
├── pages/           # Pages de l'application
├── services/        # Services API (auth, users, plants)
├── types/           # Types TypeScript
├── utils/           # Utilitaires
└── config/          # Configuration (API endpoints)
```

## Fonctionnalités

- 🔐 Authentification avec JWT (login, refresh token)
- 🌱 Gestion des plantes personnelles
- 📚 Catalogue des plantes disponibles
- 💧 Suivi de l'arrosage
- 👤 Gestion des utilisateurs (admin)

## Scripts disponibles

- `npm start` - Démarre l'application en mode développement
- `npm test` - Lance les tests
- `npm run build` - Construit l'application pour la production
