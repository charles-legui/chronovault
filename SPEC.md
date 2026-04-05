# ChronoVault — Spécification du projet

## 1. Vision du projet

Créer un portail web moderne permettant à un utilisateur de :

- créer et gérer ses albums photo et vidéo ;
- téléverser, organiser, renommer, déplacer et supprimer ses médias ;
- visualiser ses albums sous forme de galerie ;
- consulter un média en détail ;
- rechercher et filtrer les contenus ;
- préparer à terme le partage d’albums, les permissions et les commentaires.

Le projet sera développé **par petites étapes**, avec une priorité initiale sur :

1. l’interface graphique ;
2. l’expérience utilisateur ;
3. les composants visuels réutilisables ;
4. une structure de projet propre et extensible.

L’assistant de développement principal est **Claude Code**.  
Le stack imposé est :

- **Node.js**
- **TypeScript**
- **GraphQL**
- **Vue.js**
- **MongoDB**
- **PostgreSQL**
- **Docker**
- **Devcontainer**

---

## 2. Principes de travail avec Claude Code

Toujours travailler de manière :

- incrémentale ;
- modulaire ;
- testable ;
- lisible ;
- orientée composants réutilisables.

### Règles de base

- Ne jamais essayer de construire tout le produit en une seule étape.
- Commencer par une UI statique propre avant la logique métier complète.
- Préférer des composants Vue petits et clairs.
- Utiliser TypeScript strict.
- Séparer clairement :
  - UI / composants ;
  - logique d’état ;
  - appels API ;
  - types partagés ;
  - backend métier ;
  - configuration infra.

---

## 3. Découpage par petites étapes

### Étape 1 — Fondation UI
Objectif :
- créer la structure frontend ;
- définir layout global ;
- créer palette visuelle, typographie, spacing ;
- réaliser pages statiques principales.

Livrables :
- App shell ;
- barre latérale ;
- barre supérieure ;
- page Dashboard ;
- page Albums ;
- page Album détail ;
- composants de cartes média.

### Étape 2 — Système de design minimal
Objectif :
- créer composants graphiques réutilisables.

Livrables :
- boutons ;
- champs de recherche ;
- cards ;
- modales ;
- dropdowns ;
- badges ;
- onglets ;
- grille responsive galerie.

### Étape 3 — Données mockées
Objectif :
- brancher la UI sur des données fictives typées.

Livrables :
- faux albums ;
- faux médias ;
- stores/composables ;
- navigation UI réaliste.

### Étape 4 — Backend minimal
Objectif :
- créer API GraphQL de base.

Livrables :
- schéma GraphQL ;
- types TypeScript ;
- modules backend ;
- CRUD albums ;
- CRUD médias.

### Étape 5 — Stockage réel
Objectif :
- intégrer MongoDB et PostgreSQL avec rôles clairs.

---

## 4. Répartition des technologies

### Frontend
- **Vue.js 3** : interface utilisateur.
- **TypeScript** : typage strict.
- **Vue Router** : navigation.
- **Pinia** : gestion d’état UI et données.
- **Apollo Client** : communication GraphQL.
- **CSS variables + design tokens** ou **Vuetify/Tailwind** selon choix de départ.

### Recommandation
Pour avancer vite sur le GUI :
- soit **Vuetify** si priorité à la productivité UI ;
- soit **Tailwind CSS** si priorité à la liberté graphique.

Par défaut, pour ce projet, privilégier :
- **Vue 3 + TypeScript + Pinia + Vue Router + Apollo Client + Tailwind CSS**

### Backend
- **Node.js + TypeScript**
- **GraphQL API**
- architecture modulaire ;
- validation claire des entrées ;
- services séparés des resolvers.

### Base de données
Utilisation proposée :

- **PostgreSQL** : comptes utilisateurs, rôles, permissions, partages, métadonnées relationnelles.
- **MongoDB** : documents souples liés aux albums, médias, tags, préférences UI, journaux techniques ou structures évolutives.

### Répartition conseillée
PostgreSQL :
- users
- sessions
- roles
- permissions
- shared_albums
- invitations

MongoDB :
- albums
- mediaItems
- mediaMetadata
- tags
- comments (si modèle souple)
- activity logs

### Infra / environnement
- **Docker** : exécution locale homogène.
- **Docker Compose** : orchestration locale.
- **Devcontainer** : environnement de développement reproductible.
- **pnpm** recommandé pour un monorepo propre.

---

## 5. Architecture générale proposée

Monorepo conseillé :

```text
photo-portal/
├─ CLAUDE.md
├─ package.json
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
├─ .gitignore
├─ .env.example
├─ docker-compose.yml
├─ .devcontainer/
│  ├─ devcontainer.json
│  └─ Dockerfile
├─ apps/
│  ├─ web/
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  ├─ vite.config.ts
│  │  └─ src/
│  │     ├─ main.ts
│  │     ├─ App.vue
│  │     ├─ router/
│  │     ├─ stores/
│  │     ├─ layouts/
│  │     ├─ views/
│  │     ├─ components/
│  │     ├─ composables/
│  │     ├─ services/
│  │     ├─ graphql/
│  │     ├─ types/
│  │     ├─ assets/
│  │     └─ styles/
│  └─ api/
│     ├─ package.json
│     ├─ tsconfig.json
│     └─ src/
│        ├─ index.ts
│        ├─ server/
│        ├─ schema/
│        ├─ resolvers/
│        ├─ modules/
│        │  ├─ auth/
│        │  ├─ users/
│        │  ├─ albums/
│        │  └─ media/
│        ├─ services/
│        ├─ repositories/
│        ├─ db/
│        │  ├─ mongo/
│        │  └─ postgres/
│        ├─ types/
│        ├─ utils/
│        └─ config/
├─ packages/
│  ├─ shared/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ types/
│  │     ├─ constants/
│  │     ├─ validators/
│  │     └─ graphql/
│  └─ ui/
│     ├─ package.json
│     └─ src/
│        ├─ components/
│        ├─ tokens/
│        └─ styles/
└─ docs/
   ├─ architecture.md
   ├─ ui-guidelines.md
   ├─ graphql-schema-notes.md
   └─ roadmap.md
```

---

## 6. Rôle des dossiers et fichiers

### Racine
- `CLAUDE.md` : guide projet + stratégie de prompts pour Claude Code.
- `package.json` : scripts globaux du monorepo.
- `pnpm-workspace.yaml` : déclaration des workspaces.
- `tsconfig.base.json` : configuration TypeScript partagée.
- `.env.example` : variables d’environnement de référence.
- `docker-compose.yml` : services locaux (web, api, mongo, postgres).

### `.devcontainer/`
- `devcontainer.json` : configuration VS Code / environnement conteneurisé.
- `Dockerfile` : image de développement.

### `apps/web`
Frontend Vue.

- `src/main.ts` : point d’entrée.
- `src/App.vue` : racine UI.
- `src/router/` : routes.
- `src/stores/` : Pinia stores.
- `src/layouts/` : layouts globaux.
- `src/views/` : pages.
- `src/components/` : composants UI métier.
- `src/composables/` : logique réutilisable.
- `src/services/` : appels API / services frontend.
- `src/graphql/` : queries, mutations, fragments.
- `src/types/` : types frontend.
- `src/assets/` : images, icônes, mocks.
- `src/styles/` : styles globaux, tokens CSS.

### `apps/api`
Backend Node.js GraphQL.

- `src/index.ts` : démarrage serveur.
- `src/schema/` : schéma GraphQL.
- `src/resolvers/` : resolvers.
- `src/modules/` : organisation par domaine.
- `src/services/` : logique métier.
- `src/repositories/` : accès aux données.
- `src/db/mongo/` : connexion et modèles MongoDB.
- `src/db/postgres/` : connexion et accès PostgreSQL.
- `src/types/` : types backend.
- `src/config/` : configuration applicative.

### `packages/shared`
Code partagé.

- `types/` : types communs.
- `constants/` : constantes métier.
- `validators/` : validation réutilisable.
- `graphql/` : types ou helpers communs GraphQL.

### `packages/ui`
Bibliothèque UI interne.

- `components/` : composants graphiques réutilisables.
- `tokens/` : couleurs, spacing, radius, ombres.
- `styles/` : styles partagés.

### `docs`
Documentation courte du projet.

---

## 7. Pages GUI à créer en premier

1. **Dashboard**
   - résumé albums ;
   - derniers médias ;
   - accès rapide aux actions.

2. **Albums**
   - grille d’albums ;
   - recherche ;
   - filtre ;
   - bouton de création.

3. **Album détail**
   - couverture ;
   - informations album ;
   - grille photo/vidéo ;
   - tri ;
   - vue mosaïque.

4. **Media viewer**
   - affichage grand format ;
   - métadonnées ;
   - navigation précédent / suivant.

5. **Upload**
   - zone drag & drop ;
   - progression ;
   - aperçu avant envoi.

---

## 8. Système graphique minimal recommandé

Définir dès le début :

- palette de couleurs ;
- typographie ;
- grille d’espacement ;
- rayons de bordure ;
- ombres ;
- états hover / focus / active ;
- icônes cohérentes.

### Ambiance visuelle recommandée
- style moderne ;
- sobre ;
- lumineux ;
- orienté galerie média ;
- cartes larges ;
- beaucoup d’espace blanc ;
- hiérarchie visuelle nette.

### Tokens UI à prévoir
- `color-primary`
- `color-secondary`
- `color-surface`
- `color-border`
- `color-text`
- `color-muted`
- `radius-sm/md/lg/xl`
- `space-1` à `space-8`
- `shadow-sm/md/lg`

---

## 9. Premiers prompts pour Claude Code — GUI et éléments graphiques

### Prompt 1 — Initialisation frontend
```text
Crée la structure initiale de l’application frontend Vue 3 + TypeScript + Vite.
Ajoute Vue Router, Pinia et Tailwind CSS.
Prépare une architecture claire avec les dossiers layouts, views, components, stores, services, graphql, composables, types et styles.
Ajoute un AppLayout principal avec sidebar et topbar.
Le code doit être propre, modulaire et prêt pour extension.
```

### Prompt 2 — Design tokens
```text
Mets en place un système de design minimal pour le portail photo/vidéo.
Crée des tokens de couleurs, espacements, rayons, ombres et styles de typographie.
Ajoute un fichier de styles globaux et propose une direction visuelle moderne, claire et élégante pour une galerie média.
Le résultat doit être simple, cohérent et facile à réutiliser dans tous les composants Vue.
```

### Prompt 3 — Layout principal
```text
Crée le layout principal du portail avec :
- une sidebar à gauche ;
- une topbar en haut ;
- une zone centrale responsive.
La sidebar doit contenir Dashboard, Albums, Favorites, Upload, Settings.
La topbar doit inclure une barre de recherche, une zone profil et un bouton d’ajout.
Utilise Vue 3 + TypeScript + Tailwind.
```

### Prompt 4 — Page Albums
```text
Crée une page Albums statique élégante pour un portail photo/vidéo.
Ajoute :
- un en-tête ;
- une barre de recherche ;
- des filtres ;
- un bouton "Nouvel album" ;
- une grille responsive de cartes album.
Chaque carte doit afficher couverture, titre, nombre d’éléments et date de mise à jour.
Utilise des données mockées typées.
```

### Prompt 5 — Carte Album
```text
Crée un composant AlbumCard.vue réutilisable.
Props attendues :
- id
- title
- coverUrl
- mediaCount
- updatedAt
- isShared
Le composant doit être visuellement moderne, accessible, responsive et prêt pour intégration dans une galerie d’albums.
```

### Prompt 6 — Vue détail album
```text
Crée une page AlbumDetailView.vue statique.
Ajoute :
- bannière/couverture album ;
- titre et description ;
- actions principales ;
- filtres d’affichage ;
- grille de médias.
Prévois cartes différentes pour photo et vidéo.
Le design doit évoquer un portail média premium mais simple.
```

### Prompt 7 — Carte média
```text
Crée un composant MediaCard.vue pour photo et vidéo.
Le composant doit afficher :
- miniature ;
- type de média ;
- durée si vidéo ;
- titre optionnel ;
- menu d’actions.
Ajoute les états hover, focus et sélection.
Utilise TypeScript avec props clairement typées.
```

### Prompt 8 — Visionneuse média
```text
Crée une interface de visionneuse média en Vue 3.
Elle doit inclure :
- aperçu principal ;
- miniatures secondaires ;
- panneau latéral de métadonnées ;
- navigation précédent/suivant ;
- style moderne et sobre.
Commence par une version purement statique avec données mockées.
```

### Prompt 9 — Upload UI
```text
Crée une page ou un composant d’upload de médias.
Ajoute :
- zone drag & drop ;
- liste des fichiers sélectionnés ;
- progression ;
- miniatures ;
- états succès/erreur.
Commence par une version frontend statique sans backend.
```

### Prompt 10 — Bibliothèque UI interne
```text
Crée les premiers composants UI réutilisables du portail :
- BaseButton
- BaseInput
- BaseCard
- BaseModal
- BaseBadge
- BaseDropdown
Range-les dans un package ou dossier UI dédié.
Le style doit être cohérent avec un portail média moderne.
```

---

## 10. Premiers prompts pour Claude Code — structure backend

### Prompt 11 — API de base
```text
Crée la structure initiale du backend Node.js + TypeScript + GraphQL.
Organise le code par modules : auth, users, albums, media.
Sépare schema, resolvers, services, repositories et config.
Le résultat doit être minimal, propre et prêt à accueillir MongoDB et PostgreSQL.
```

### Prompt 12 — Types partagés
```text
Crée un package shared contenant les types communs du projet pour albums, médias, utilisateurs et pagination.
Les types doivent pouvoir être utilisés par le frontend Vue et le backend Node.js.
Utilise TypeScript strict et une structure claire.
```

### Prompt 13 — Modèles métier initiaux
```text
Propose les modèles métier initiaux pour :
- User
- Album
- MediaItem
- Tag
- SharedAlbum
Précise quels modèles doivent vivre dans PostgreSQL et lesquels dans MongoDB.
Donne des interfaces TypeScript courtes mais complètes.
```

---

## 11. Fichiers à préparer dès le départ

### Racine
- `README.md` : démarrage rapide.
- `CLAUDE.md` : instructions de travail avec Claude Code.
- `.env.example` : variables nécessaires.
- `docker-compose.yml` : stack locale.
- `pnpm-workspace.yaml` : monorepo.

### Frontend
- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/main.css`
- `apps/web/src/layouts/AppLayout.vue`
- `apps/web/src/views/DashboardView.vue`
- `apps/web/src/views/AlbumsView.vue`
- `apps/web/src/views/AlbumDetailView.vue`
- `apps/web/src/components/albums/AlbumCard.vue`
- `apps/web/src/components/media/MediaCard.vue`
- `apps/web/src/components/ui/`

### Backend
- `apps/api/src/index.ts`
- `apps/api/src/schema/index.ts`
- `apps/api/src/resolvers/index.ts`
- `apps/api/src/modules/albums/`
- `apps/api/src/modules/media/`
- `apps/api/src/db/mongo/connection.ts`
- `apps/api/src/db/postgres/connection.ts`

### Shared
- `packages/shared/src/types/media.ts`
- `packages/shared/src/types/album.ts`
- `packages/shared/src/types/user.ts`

---

## 12. Contraintes à rappeler à Claude Code

Toujours demander à Claude Code de :

- générer du code court, propre et modulaire ;
- éviter les dépendances inutiles ;
- typer explicitement les props et retours ;
- séparer les mocks de la logique réelle ;
- préparer le code pour une évolution progressive ;
- ne pas mélanger backend, UI et logique métier ;
- commenter seulement ce qui est utile ;
- proposer des fichiers complets lorsqu’un composant est demandé.

---

## 13. Première mission recommandée

Ordre de démarrage conseillé :

1. initialiser monorepo ;
2. créer frontend Vue ;
3. poser design tokens ;
4. créer layout global ;
5. créer page Albums ;
6. créer AlbumCard et MediaCard ;
7. seulement ensuite commencer le backend minimal.

---

## 14. Résultat attendu du MVP visuel

À la fin de la première phase, on doit avoir :

- un portail visuellement crédible ;
- une navigation claire ;
- une galerie d’albums élégante ;
- une page détail album ;
- des composants UI réutilisables ;
- des données mockées bien typées ;
- une base solide pour brancher GraphQL ensuite.
