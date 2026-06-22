# GardenMate — front

Dashboard de suivi d'arrosage : affiche, pour chaque plante du jardin, quand
l'arroser (plan de soin ajusté météo / saison), et permet d'ajouter, arroser et
retirer des plantes. Client de l'API [`gardenmate_api`](https://github.com/KylianGERMAIN/gardenmate_api).

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS 4** + composants shadcn/Base UI
- **pnpm**
- Auth par access/refresh tokens (rotation), session restaurée via `useSyncExternalStore`
- Déployé sur **Vercel** ; API sur **Render**

## Développement

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

L'app tape l'API de prod par défaut. Pour pointer ailleurs, créer `.env.local` :

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

À défaut, l'URL par défaut est définie dans `src/lib/api.ts`.

## Scripts

```bash
pnpm dev      # serveur de dev (Turbopack)
pnpm build    # build de production
pnpm start    # sert le build
pnpm lint     # ESLint
```

## Déploiement

Push sur `main` → build et déploiement automatiques sur Vercel (preset Next.js,
zéro config). Définir `NEXT_PUBLIC_API_URL` dans les variables d'environnement
du projet Vercel.
