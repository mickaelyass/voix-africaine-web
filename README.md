# Voix Africaine — Frontend

Application React (Create React App, TypeScript + JavaScript) qui consomme l'API
FastAPI du dossier `../voix-africaine-api`.

## Configuration locale

L'URL de l'API est lue depuis `REACT_APP_API_URL` (fichier `.env`, à la racine
de ce projet). Pour un environnement **local** :

```env
REACT_APP_API_URL=http://localhost:8000
```

Un modèle est fourni : `cp .env.example .env`.

> ⚠️ **CORS** : l'API n'autorise que `http://localhost:3000` et
> `https://voixafricaine.netlify.app` (`app/middleware.py`). Si vous changez le
> port du frontend (`PORT=3001 npm start`), ajoutez l'origine correspondante
> côté backend, sinon le navigateur bloquera les requêtes.

## Démarrer l'ensemble (backend + frontend)

```bash
# Terminal 1 — API + MongoDB local
cd ../voix-africaine-api
env/bin/python -m scripts.init_db      # une seule fois : index + admin par défaut
./scripts/run_dev.sh                   # http://127.0.0.1:8000

# Terminal 2 — frontend
cd ../voix-africaine-web
npm install
npm start                              # http://localhost:3000
```

Compte administrateur créé par défaut : `admin@voixafricaine.com` / `Admin@Voix2026`
(voir `../voix-africaine-api/README.md`).

## Vérifier la liaison avec l'API

```bash
cd ../voix-africaine-api
env/bin/python -m scripts.smoke_test
```

## Scripts disponibles

| Commande | Effet |
|----------|-------|
| `npm start` | Serveur de développement sur <http://localhost:3000> |
| `npm run build` | Build de production dans `build/` |
| `npm test` | Tests (mode watch) |
| `npx tsc --noEmit` | Vérification des types TypeScript |

## Routes de l'application

| Route | Composant | Accès |
|-------|-----------|-------|
| `/` | `HomePage` | public |
| `/login` | `LoginPage` | public |
| `/register` | `RegisterPage` | public |
| `/dashboard` | `DashboardPage` (layout) | connecté |
| `/dashboard/ajouter-livre` | `AddLivrePage` | admin |
| `/dashboard/list-livre-public` | `ListeLivre` | connecté |
| `/dashboard/livre/:id` | `LivreDetail` | connecté |
| `/dashboard/livres/:livreId/ajouter-chapitre` | `AjoutChapitre` | admin |

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
