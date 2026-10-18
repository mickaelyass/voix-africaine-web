# Voix Africaine — Frontend

Application React (Create React App) qui consomme l'API FastAPI du dépôt
**`voix-africaine-api`**.

## Configuration

L'URL de l'API est lue depuis `REACT_APP_API_URL` (fichier `.env` local, non
versionné) :

```bash
cp .env.example .env
# .env → REACT_APP_API_URL=http://localhost:8000
```

> ⚠️ **CORS** : l'API n'autorise que `http://localhost:3000` et l'origine du
> front déployé (`app/middleware.py` côté API). Tout autre port/origine doit
> être ajouté côté backend, sinon le navigateur bloquera les requêtes.

## Démarrage (backend + frontend)

```bash
# Terminal 1 — API + MongoDB local
cd ../voix-africaine-api
env/bin/python -m scripts.init_db   # une seule fois : index + admin
env/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 — frontend
cd ../voix-africaine-web
npm install
npm start                            # http://localhost:3000
```

Compte administrateur : créé par l'API au premier démarrage à partir des
variables `DEFAULT_ADMIN_*` de son `.env` (voir `../voix-africaine-api/readme.md`).

## Scripts

| Commande | Effet |
|----------|-------|
| `npm start` | serveur de développement <http://localhost:3000> |
| `npm run build` | build de production → `build/` |
| `npm test` | tests (mode watch) |
| `npx tsc --noEmit` | vérification des types TypeScript |

## Routes

| Route | Composant | Accès |
|-------|-----------|-------|
| `/` | `HomePage` | public |
| `/login` | `LoginPage` | public |
| `/register` | `RegisterPage` | public |
| `/dashboard` | `DashboardPage` (layout) | connecté |
| `/dashboard/ajouter-livre` | `AddLivrePage` | admin |
| `/dashboard/list-livre-public` | `ListeLivre` | connecté |
| `/dashboard/livre/:id` | `LivreDetail` | connecté |
| `/dashboard/livres/:livreId/ajouter-chapitre` | `AjoutChapitre` | connecté |
| `/dashboard/utilisateurs` | `UsersPage` | connecté |
| `/dashboard/utilisateurs/:id` | `UserDetailPage` | connecté |

## Déploiement

Build statique (`npm run build` → `build/`) à déployer sur l'hébergeur de
votre choix. Renseigner `REACT_APP_API_URL` dans le dashboard de
l'hébergeur **au moment du build** (variable figée dans le bundle) — aucun
fichier `.env` n'est envoyé (voir `.gitignore`).
