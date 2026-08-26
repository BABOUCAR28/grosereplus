# GP-SUITE — Site vitrine & plateforme de gestion intégrée du cabinet GROSERE PLUS

Projet unique (Front-End React + Back-End Node.js/Express + MySQL) qui réunit :

1. **Le site vitrine public** du cabinet GROSERE PLUS — accessible sans compte, optimisé SEO,
   présentant le cabinet, ses services, ses secteurs, son équipe, ses réalisations et son blog.
2. **La plateforme de gestion interne** (back-office), réservée aux comptes authentifiés, pour
   digitaliser les activités du cabinet : projets, consultants, clients, partenaires, contrats,
   missions, études, formations, documents, rapports, finances, logistique, véhicules, RH,
   suivi-évaluation, indicateurs, notifications et paiements.

## Site vitrine public — contenu dynamique, piloté depuis le back-office

Toutes les pages ci-dessous sont accessibles sans authentification, avec en-tête sticky, boutons
WhatsApp/appel flottants, et balises SEO par page (`react-helmet-async`) :

| Page | Route | Contenu |
|---|---|---|
| Accueil (hero, stats, mission, services, secteurs, réalisations, témoignages, FAQ) | `/` | mixte |
| À propos (mission, vision, valeurs, Manager Général) | `/a-propos` | statique |
| Nos Services (métiers détaillés) | `/nos-services` | **dynamique** |
| Nos Secteurs d'intervention | `/nos-secteurs` | **dynamique** |
| Notre Équipe (Manager Général + consultants seniors) | `/notre-equipe` | **dynamique** |
| Réalisations (études de cas) | `/realisations` | **dynamique** |
| Actualités / Blog (liste + détail article) | `/actualites`, `/actualites/:slug` | **dynamique** |
| Contact (formulaire réel, Google Maps, FAQ) | `/nous-contacter` | statique + formulaire réel |

### Contenu dynamique : consultants, réalisations, actualités, témoignages, services, secteurs, identité du site

Ces types de contenu sont lus **en direct depuis la base de données** via des endpoints
publics dédiés (`GET /api/v1/public/...`, sans authentification), et gérés depuis le back-office :

- **Consultants** et **Réalisations** réutilisent les tables existantes (`consultants`, `projets`) :
  une migration (`20260726000001-add-champs-visibilite-site-public.js`) leur ajoute des champs
  *publics* dédiés (`poste_public`, `bio_publique`, `resume_public`) strictement séparés des champs
  de gestion interne (TJM, budget, coordonnées...), plus un booléen `visible_site_public`
  (**`false` par défaut** — un enregistrement n'apparaît jamais publiquement tant qu'un admin ne
  l'a pas explicitement activé). Ce toggle est gérable directement depuis les pages **Consultants**
  et **Projets** du back-office (bouton "Visible / Masqué").
- **Actualités**, **Témoignages**, **Services** et **Secteurs** sont des tables dédiées
  (`actualites`, `temoignages`, `services_vitrine`, `secteurs_vitrine`), chacune avec sa propre
  interface de gestion dans le back-office : **Administration → Actualités**, **→ Témoignages**,
  **→ Services (site public)** et **→ Secteurs (site public)**, accessibles aux rôles
  SUPER_ADMIN/ADMIN. Un enregistrement reste en brouillon (`publie: false`) jusqu'à publication
  explicite — même logique d'opt-in que pour les consultants/réalisations.
- Pour les **Services**, les livrables se saisissent comme une liste texte (une ligne par
  livrable) et sont convertis en tableau côté endpoint public
  (`public.controller.js#getServices`).
- **Valeurs du cabinet** et **Manager Général** sont désormais éditables depuis **Paramètres →
  Site public — Identité**, sans nouvelle table : ils réutilisent la table clé/valeur générique
  `parametres` (clés `site_valeurs` et `site_manager_general`, en JSON). L'endpoint public
  `GET /public/identite-site` (`public.controller.js#getIdentiteSite`) ne lit **que** ces deux
  clés — jamais l'intégralité de la table, qui pourrait un jour contenir des réglages internes
  (identifiants SMTP, par exemple). Tant qu'aucune valeur n'a été enregistrée, des valeurs de
  repli raisonnables s'affichent (le site reste présentable dès la première installation).

Le contrôleur public (`backend/src/controllers/public.controller.js`) ne sélectionne **jamais** les
champs de gestion interne, quel que soit le contenu de la requête — testé explicitement (voir
`tests/integration/sitePublic.test.js`, `tests/integration/vitrineCatalogue.test.js` et
`tests/integration/identiteSite.test.js`, 35 tests au total : absence de fuite du TJM, du budget,
d'un mot de passe SMTP fictif, 404 générique pour un brouillon non publié afin de ne pas laisser
deviner son existence, RBAC sur la création/modification/suppression, etc.).

Le frontend consomme ces endpoints via `frontend/src/api/public.api.js` et un hook générique
`useDonneesPubliques` (`frontend/src/hooks/`) gérant chargement/erreur/absence de contenu.

### Ce qui reste figé dans le code (assumé, pas un oubli)

Seuls les coordonnées de contact (`SITE`, dans `contenuVitrine.js`) et la FAQ restent définis en
dur côté frontend : il s'agit d'informations qui changent rarement et pour lesquelles une
interface de gestion dédiée n'apporterait pas grand-chose à ce stade. Ils peuvent être rendus
dynamiques selon le même schéma (table + endpoint public + page de gestion) si le besoin se
confirme. Les photographies par défaut (`frontend/src/data/imagesStock.js`) restent des visuels
libres de droit à remplacer par de vraies photos.

Le formulaire de contact public réutilise l'endpoint backend existant `POST /contact` (déjà
fonctionnel, avec envoi d'email réel ou repli `mailto` si le service SMTP n'est pas configuré).

Une brochure institutionnelle réelle (`frontend/public/brochure-grosere-plus.pdf`, générée avec
reportlab) est téléchargeable depuis l'Accueil, la page À propos et le pied de page.

### Vérification des pages publiques (smoke test SSR)

Comme cette application est une SPA React/Vite sans rendu serveur, un simple `npm run build` ne
garantit pas qu'une page s'exécute sans erreur au runtime (composant `undefined`, prop manquante,
etc.) — il valide seulement que le code se compile. Un script dédié charge chacune des 9 pages
publiques via le pipeline de transformation de Vite et les rend réellement avec
`renderToStaticMarkup`, pour détecter ce genre d'erreurs avant mise en production. Les pages dont
le contenu est dynamique s'y affichent dans leur état de chargement initial (le `useEffect` de
récupération des données ne s'exécute pas en rendu serveur), ce qui est le comportement attendu :


```bash
cd frontend
npm run smoke-test
```

### À personnaliser avant mise en production

- Coordonnées réelles si besoin de les changer (`frontend/src/data/contenuVitrine.js`, objet `SITE`)
- Consultants, réalisations, actualités et témoignages : se gèrent désormais depuis le back-office
  (voir section précédente), plus depuis le code — rien à modifier dans les fichiers source pour
  publier du contenu réel
- Contenu réel du Manager Général (`MANAGER_GENERAL` dans `contenuVitrine.js`) — reste statique
- Vraies photos de projets/articles à défaut d'`image_url` renseignée lors de la création d'une
  réalisation ou d'un article (sinon, repli automatique sur une photo libre de droit)
- Brochure PDF définitive (mise en page plus riche si souhaité)
- Newsletter : formulaire fonctionnel côté interface, mais non branché à un service d'emailing
  (Mailchimp, Brevo...) — voir le `TODO` dans `NewsletterForm.jsx`

## Structure du dépôt

```
gp-suite/
├── .github/workflows/    # CI GitHub Actions (backend + frontend + docker)
├── backend/              # API REST Node.js/Express + Sequelize (MySQL)
│   ├── src/
│   │   ├── config/         # configuration DB / app / sequelize-cli
│   │   ├── models/         # modèles Sequelize
│   │   ├── controllers/    # logique métier
│   │   ├── routes/         # routes REST (annotées Swagger/OpenAPI)
│   │   ├── middlewares/    # auth JWT, RBAC, erreurs, audit, upload
│   │   ├── docs/           # génération du spec OpenAPI
│   │   └── utils/          # jwt, logger, réponses API, politique de mot de passe
│   ├── database/            # schema.sql (DDL complet) + seed.sql
│   ├── migrations/          # migrations Sequelize CLI (versioning du schéma)
│   ├── seeders/              # seeders Sequelize CLI (rôles, admin, paramètres)
│   ├── tests/                # tests Jest/Supertest
│   └── Dockerfile
├── frontend/              # Application React + Tailwind + Axios (site vitrine + back-office)
│   ├── src/
│   │   ├── api/             # clients Axios par ressource
│   │   ├── context/         # AuthContext (JWT, RBAC front)
│   │   ├── routes/           # ProtectedRoute
│   │   ├── layouts/          # AppLayout (back-office) + SiteLayout (site vitrine public)
│   │   ├── data/              # contenuVitrine.js, imagesStock.js (contenu du site public)
│   │   ├── hooks/             # useRevealOnScroll (animations au scroll, sans dépendance lourde)
│   │   ├── components/
│   │   │   ├── public/          # composants du site vitrine (en-tête, pied de page, cartes, FAQ...)
│   │   │   └── ...              # Modales, formulaires réutilisables du back-office
│   │   └── pages/            # Accueil, À propos, Nos Services, Nos Secteurs, Notre Équipe,
│   │       │                    Réalisations, Actualités (+détail), Nous contacter (site public)
│   │       │                    + Connexion, Tableau de bord, Projets, Consultants, Clients,
│   │       │                    Études, Contrats, Finances, RH, Documents, Rapports... (back-office)
│   │   └── public/            # brochure PDF, robots.txt, sitemap.xml
│   └── Dockerfile
├── nginx/
│   └── default.conf       # reverse proxy Front/Back + en-têtes de sécurité
└── docker-compose.yml
```

## Démarrage rapide (Docker)

```bash
# 1. Configuration (le fichier backend/.env livré fonctionne déjà pour Docker,
#    DB_HOST=mysql par défaut — éditez-le pour vos vrais identifiants SMTP/Brevo
#    et vos secrets JWT si besoin, voir "Envoi d'e-mail réel" plus haut)

# 2. Construire et démarrer tous les services (MySQL, backend, frontend, nginx)
docker compose up -d --build

# 3. Vérifier que tout tourne (les 4 services doivent être "Up", mysql "healthy")
docker compose ps

# 4. Appliquer le schéma et peupler la base (rôles, 3 comptes admin réels,
#    contenu de démonstration du site public) — à faire une seule fois
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:seed
```

- Site & Front-End : http://localhost **ou** http://localhost:5173 (les deux fonctionnent de
  façon identique — le second est utile si le port 80 est déjà occupé sur la machine, ex. IIS ou
  Skype sous Windows)
- API : http://localhost/api/v1 (ou :5173/api/v1)
- Documentation Swagger : http://localhost/api-docs (ou :5173/api-docs)
- MySQL exposé sur le port **3307** (pas 3306, pour éviter un conflit avec un MySQL déjà installé
  localement)

**Suivre les logs en direct** (utile pour diagnostiquer l'envoi d'e-mail — cherchez les lignes
`[mailer] ...`) :
```bash
docker compose logs -f backend
```

**Tout arrêter** :
```bash
docker compose down        # garde les données de la base
docker compose down -v     # supprime aussi le volume MySQL (repart de zéro)
```

## Démarrage en développement (sans Docker)

**Backend**
```bash
cd backend
cp .env.example .env
npm install
npm run dev              # nodemon sur http://localhost:5000

npx sequelize-cli db:migrate     # applique tout le schéma (migrations/) — seule méthode utilisée en pratique
npx sequelize-cli db:seed:all    # rôles, comptes admin, contenu de démonstration du site public
```

**Frontend**
```bash
cd frontend
npm install
npm run dev               # Vite sur http://localhost:5173
```

## Interface globale d'administration

Les rôles `SUPER_ADMIN` et `ADMIN` disposent d'une section dédiée dans la barre latérale
(« Administration »), invisible pour les autres rôles :

- **`/administration`** — Vue d'ensemble : agrège en temps réel des indicateurs de 7 modules
  (projets en cours, consultants disponibles/total, clients, contrats actifs, factures impayées,
  paiements en attente, utilisateurs actifs) via des appels API parallèles (`Promise.all`), avec
  accès rapide vers chaque module métier. Chaque échec partiel (ex. droits insuffisants sur un
  module) est isolé et n'empêche pas l'affichage des autres indicateurs.
- **`/administration/utilisateurs`** — Gestion complète des comptes : création (avec sélection du
  rôle depuis le référentiel réel `/api/v1/roles`, nouvellement exposé), filtrage par rôle,
  activation/désactivation en un clic.

Le référentiel des rôles (`GET /api/v1/roles`, réservé SUPER_ADMIN/ADMIN) a été ajouté à cette
occasion pour alimenter dynamiquement le formulaire de création d'utilisateur — testé
(`tests/integration/roles.test.js`, 2/2).

## Modules backend disponibles

| Module | Statut | Endpoints |
|---|---|---|
| Authentification (JWT + refresh + verrouillage + reset mot de passe) | ✅ Complet | `/api/v1/auth/*` |
| Utilisateurs | ✅ Complet | `/api/v1/utilisateurs` |
| Rôles (référentiel RBAC) | ✅ Complet | `/api/v1/roles` |
| Consultants | ✅ Complet | `/api/v1/consultants` |
| Clients | ✅ Complet | `/api/v1/clients` |
| Projets (+ partenaires, indicateurs) | ✅ Complet | `/api/v1/projets` |
| Missions (+ affectation consultants) | ✅ Complet | `/api/v1/missions` |
| Documents (GED, upload/download) | ✅ Complet | `/api/v1/documents` |
| Rapports (workflow de validation) | ✅ Complet | `/api/v1/rapports` |
| Contrats | ✅ Complet | `/api/v1/contrats` |
| Formations | ✅ Complet | `/api/v1/formations` |
| Notifications | ✅ Complet | `/api/v1/notifications` |
| Véhicules (+ entretiens) | ✅ Complet | `/api/v1/vehicules` |
| Finances (budgets, dépenses, factures, paiements) | ✅ Complet | `/api/v1/finances/*` |
| Logistique (matériel, réservations) | ✅ Complet | `/api/v1/logistique/*` |
| Ressources humaines (employés, congés, évaluations) | ✅ Complet | `/api/v1/rh/*` |
| Suivi-évaluation (cadre logique, indicateurs, missions d'évaluation) | ✅ Complet | `/api/v1/suivi-evaluation/*` |
| Études socio-économiques | ✅ Complet | `/api/v1/etudes` |
| Ateliers | ✅ Complet | `/api/v1/ateliers` |
| Événements | ✅ Complet | `/api/v1/evenements` |
| Compétences (référentiel + association consultants) | ✅ Complet | `/api/v1/competences` |
| Paramètres généraux | ✅ Complet | `/api/v1/parametres` |
| Journal d'audit (consultation, filtres, pagination) | ✅ Complet | `/api/v1/logs-audit` |

## Interface d'administration globale (frontend)

Les rôles `SUPER_ADMIN` et `ADMIN` disposent d'un espace d'administration dédié, distinct du
tableau de bord standard, et **sont redirigés automatiquement vers cet espace dès la connexion** :

- **`/administration`** (`AdminApercuGlobal.jsx`) — vue d'ensemble transverse à tous les modules :
  KPI cliquables (projets en cours, disponibilité des consultants, clients, contrats actifs,
  factures impayées, paiements en attente, utilisateurs actifs) agrégés en un seul écran, avec
  un panneau d'accès rapide vers chaque module de la plateforme.
- **`/administration/utilisateurs`** (`AdminUtilisateurs.jsx`) — gestion des comptes : création,
  filtrage par rôle (référentiel RBAC chargé dynamiquement depuis `/api/v1/roles`), activation/
  désactivation.
- **`/parametres`** (`Parametres.jsx`) — trois onglets réels : Sécurité (2FA), Référentiels
  (paramètres système clé/valeur), Journal d'audit (consultation paginée et filtrable du
  `logs_audit`, avec listes d'entités/actions peuplées dynamiquement).

**Correctif apporté à cette itération** : le flux de connexion ne gérait pas le défi de double
authentification (un compte avec la 2FA active recevait un `challengeToken` de l'API mais
l'interface l'ignorait silencieusement, rendant la reconnexion impossible après activation de la
2FA). `Connexion.jsx` gère désormais les deux étapes (mot de passe puis code TOTP/code de
récupération) via `AuthContext.confirmerLogin2fa`, avec redirection vers `/administration` ou
`/tableau-de-bord` selon le rôle. Vérifié par un nouveau build frontend réussi et la suite
backend complète (118/118 tests toujours au vert après la modification).

## Comptes et rôles

Les rôles disponibles (table `roles`) : `SUPER_ADMIN`, `ADMIN`, `CHEF_PROJET`, `CONSULTANT`,
`CLIENT`, `PARTENAIRE`, `LOGISTICIEN`, `COMPTABLE`.

Trois comptes `SUPER_ADMIN` réels sont créés par le seeder Sequelize
`seeders/20260717000002-seed-roles-et-admin.js` (mots de passe hachés via bcrypt à l'exécution,
jamais stockés en clair en base) : `grosereplus@gmail.com`, `corisene2013@gmail.com` et
`senebaboucar49@gmail.com` — les mêmes adresses déjà utilisées comme destinataires du formulaire
de contact public (`src/constants/contact.js`). ⚠️ Voir l'avertissement de sécurité en tête de ce
fichier de seeder : ces mots de passe sont de vrais mots de passe, à ne jamais exposer dans un
dépôt public. Vérifié par connexion réelle via `POST /auth/login` contre chacun des trois comptes.

## Documentation API (Swagger/OpenAPI)

32 endpoints sont annotés en JSDoc `@openapi` (Authentification, Utilisateurs, Consultants, Clients,
Projets, Missions, Documents, Rapports, Contrats, Formations, Notifications) et générés
automatiquement par `swagger-jsdoc`. Vérifié par génération effective du spec :
`node -e "console.log(Object.keys(require('./src/docs/swagger.js').paths))"` → 32 chemins.

Accessible sur `/api-docs` une fois le serveur démarré.

## Migrations Sequelize CLI

En complément de `database/schema.sql` (DDL de référence, à titre de documentation — voir
l'avertissement en tête de ce fichier), le projet utilise les **migrations Sequelize CLI** comme
**seule source de vérité appliquée en pratique**, en local comme en Docker :

```bash
cd backend
npx sequelize-cli db:migrate           # applique le schéma complet (migrations/)
npx sequelize-cli db:seed:all          # rôles, compte admin, paramètres de base, ET contenu
                                        # de démonstration du site public (déjà publié — voir ci-dessous)
npx sequelize-cli db:migrate:undo:all  # annule toutes les migrations
```

Le seeder `20260727000001-seed-contenu-vitrine.js` peuple le site public avec du contenu réel et
déjà publié (9 services, 13 secteurs, 3 témoignages, 2 articles, les valeurs du cabinet et la
présentation du Manager Général) : **une installation fraîche affiche un site complet dès le
premier démarrage**, plutôt qu'une coquille vide en attendant qu'un admin recrée tout à la main.
Tout reste ensuite librement modifiable depuis le back-office. Vérifié par une exécution réelle
des migrations et seeders contre une vraie base SQLite fichier (pas seulement `sequelize.sync`
comme le fait la suite de tests), puis interrogation en direct de chaque endpoint public via un
serveur démarré pour de vrai.

- **50 migrations granulaires** dans `migrations/` (une par table, plus les contraintes de clé
  étrangère différées et les index de performance en fichiers séparés), classées par ordre de
  dépendances : `20260717000001-create-roles.js` → ... → `20260717000050-add-index-logs-audit.js`.
  Les colonnes `created_at`/`updated_at`, communes à la quasi-totalité des tables, sont
  factorisées dans `migrations/_helpers/columnsPartagees.js` plutôt que dupliquées 40 fois.
- `seeders/20260717000002-seed-roles-et-admin.js` : rôles RBAC, compte SUPER_ADMIN, paramètres
  par défaut.
- **Bug pré-existant trouvé et corrigé pendant la granularisation** : la migration
  `20260718000001-add-account-lockout-fields.js` tentait d'ajouter les colonnes
  `tentatives_echouees` et `verrouille_jusqua` à la table `utilisateurs` — alors que ces deux
  colonnes étaient déjà présentes dans la création initiale de la table. Cette migration aurait
  échoué (« duplicate column ») sur toute base fraîchement migrée, en MySQL comme ailleurs ; le
  bug n'avait jamais été détecté car la suite de tests construit son schéma via
  `sequelize.sync()` et non via les migrations. Migration supprimée (les colonnes existent déjà
  dès `create-utilisateurs`).
- **Vérifié de bout en bout** contre une base SQLite temporaire (hors suite de tests, en plus de
  celle-ci) : `db:migrate` (50/50 migrations, dans l'ordre), `db:migrate:status`, puis
  `db:migrate:undo:all` (50/50 annulations, ordre inverse) — sans erreur.
- Configuration CLI validée : `npx sequelize-cli db:migrate:status` charge correctement
  `.sequelizerc` et `src/config/sequelize-cli.config.js` (l'échec de connexion observé en sandbox
  est attendu en l'absence de MySQL, et disparaît sous `docker compose`).

## Tests

Deux niveaux de tests, avec une stratégie volontairement pragmatique :

- **Tests unitaires** (`tests/*.test.js`) : JWT, RBAC, politique de mot de passe, TOTP/2FA, codes de
  récupération — aucune base de données requise.
- **Tests d'intégration** (`tests/integration/*.test.js`) : exercent l'API réelle de bout en bout
  (Express + Sequelize + contrôleurs + middlewares RBAC) contre une **base SQLite en mémoire**,
  recréée intégralement avant chaque fichier de test (`tests/setup/database.js`) — sans nécessiter
  de serveur MySQL. Couvrent notamment :
  - `projets.test.js` (10 tests) : création, RBAC par rôle, filtres, 404, mise à jour de statut,
    suppression réservée au SUPER_ADMIN
  - `missions.test.js` (6 tests) : création avec affectation multiple de consultants en une requête,
    **vérification réelle que les notifications sont créées en base** pour chaque consultant affecté,
    changement de statut, affectation d'un consultant supplémentaire
  - `finances.test.js` (8 tests) : budget, ligne budgétaire, **mise à jour automatique du montant
    consommé** après une dépense, facture, **passage automatique d'une facture à "payée"** après
    paiement, validation de paiement
  - `documents.test.js` (7 tests) : upload multipart réel avec écriture sur disque, filtre par
    projet/type, **téléchargement avec vérification du contenu binaire**, rejet d'un type de fichier
    non autorisé (`.exe`), suppression
  - `rh.test.js` (8 tests) : création de fiche employé, RBAC, demande de congé, refus/approbation
    par rôle, évaluation annuelle, cohérence des relations (congés, évaluations) sur la fiche
  - `contrats.test.js` (6 tests) : création, RBAC, filtres, détail, transitions de statut
    (brouillon → signé → actif)
  - `formations.test.js` (5 tests) : RBAC, création avec formateur assigné, filtre par projet, détail
  - `suiviEvaluation.test.js` (7 tests) : cadre logique, indicateur, **historique multi-périodes des
    valeurs réalisées**, mission d'évaluation avec recommandations
  - `logistique.test.js` (6 tests) : matériel, réservation, **rejet réel d'une réservation dépassant
    le stock disponible** (409 STOCK_INSUFFISANT)
  - `vehicules.test.js` (6 tests) : RBAC, création, **passage automatique en "en_entretien"** après
    déclaration d'un entretien, retour à "disponible"
  - `etudes.test.js` (8 tests) : couvre le module **Études socio-économiques, identifié dans
    l'analyse des besoins initiale mais dont le contrôleur/routes n'avaient jamais été implémentés**
    — combler cette lacune (modèle, contrôleur, routes créés à cette occasion) puis la valider par
    ces tests fait partie du travail de cette itération
  - `ateliers.test.js` (4 tests), `evenements.test.js` (5 tests), `competences.test.js` (4 tests,
    dont l'idempotence de création via `findOrCreate`)
  - `notifications.test.js` (7 tests, nouveau) : étanchéité stricte entre comptes (un utilisateur
    ne peut ni lister ni marquer comme lue la notification d'un autre — vérifié par un 404 et non
    un 200 filtré, pour ne pas laisser fuiter l'existence de la ressource), filtre `lu=false`,
    marquage individuel et marquage groupé (`lu-tout`) sans effet de bord sur les autres comptes

```bash
cd backend
npm test              # exécute toute la suite (unitaires + intégration), 186/186 tests passants
```

Le dialecte de base de données est configurable (`DB_DIALECT` dans `.env`/`.env.test`) : `mysql` en
production/développement, `sqlite` pour les tests (voir `src/config/database.js`). Cette bascule a
permis de faire passer un test qui échouait structurellement depuis le début du projet (nécessitant
une vraie connexion MySQL absente du sandbox) : il s'exécute désormais réellement et passe.

## Intégration continue (CI)

`.github/workflows/ci.yml` exécute à chaque push/PR :
1. **backend-tests** : service MySQL 8 réel, migrations Sequelize, seeders, vérification syntaxique
   de tous les fichiers, puis la suite Jest complète.
2. **frontend-build** : `npm ci` + `npm run build` (Vite).
3. **docker-build** : build des images Docker backend et frontend (dépend des deux jobs précédents).

Le fichier YAML a été validé (`yaml.safe_load`) et reproduit les commandes déjà testées
manuellement dans ce projet (migrations, seeders, tests).

## Envoi d'e-mail réel (formulaire de contact)

Le formulaire de contact public (`POST /api/v1/contact`) envoie un e-mail réel aux trois adresses
de l'administration (`grosereplus@gmail.com`, `corisene2013@gmail.com`, `senebaboucar49@gmail.com`,
définies dans `backend/src/constants/contact.js`), avec le message du visiteur et son adresse en
`Reply-To` (répondre directement au visiteur depuis la boîte mail suffit).

**Le code ne ment jamais sur le résultat de l'envoi** : `src/utils/mailer.js` ne renvoie
`{ envoye: true }` que si l'envoi a réellement réussi (API Brevo ou SMTP selon le mode actif). En
cas d'absence de configuration ou d'échec technique (identifiants refusés, expéditeur non
vérifié...), l'API répond **503** (pas un faux 200) et le contrôleur ne prétend jamais qu'un
e-mail est parti alors que ce n'est pas le cas — vérifié explicitement par `tests/mailer.test.js`
(12 tests, les deux modes) et `tests/contact.test.js` (7 tests, dont le comportement exact en cas
d'échec).

### Deux méthodes de configuration possibles

`mailer.js` détecte automatiquement laquelle utiliser : si `BREVO_API_KEY` est renseignée, elle
est **prioritaire** (les variables `SMTP_*` sont alors ignorées).

**Méthode recommandée — API Brevo (HTTPS)** : ne peut pas être bloquée par un hébergeur qui filtre
les ports SMTP sortants (25/465/587) — un blocage réel et fréquent sur les hébergeurs cloud
grand public, invisible dans les logs applicatifs (la requête reste juste bloquée). L'API Brevo
passe par HTTPS/443, presque jamais filtré :

```bash
BREVO_API_KEY=xkeysib-votre-cle-api          # Paramètres > SMTP & API > API Keys, sur brevo.com
BREVO_SENDER_EMAIL=contact@grosereplus.sn    # doit être un expéditeur VÉRIFIÉ dans Brevo
```

⚠️ Important : Brevo distingue **clé API** (`xkeysib-...`, pour son API REST — c'est cette
variable-ci) et **clé SMTP** (générée séparément, uniquement pour la méthode SMTP ci-dessous).
Utiliser la clé API comme mot de passe SMTP échoue systématiquement (erreur 535) — Brevo le
documente explicitement. L'adresse dans `BREVO_SENDER_EMAIL` (ou `SMTP_FROM`) doit également être
un expéditeur *vérifié* dans le compte Brevo (Paramètres > Expéditeurs), sans quoi l'API répond
400.

**Méthode alternative — SMTP classique** (Gmail, ou Brevo en mode « SMTP relay ») :

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.compte@gmail.com
SMTP_PASSWORD=xxxxxxxxxxxxxxxx        # mot de passe d'application, PAS le mot de passe du compte
SMTP_FROM="GP-Suite <votre.compte@gmail.com>"
```

Avec Gmail, `SMTP_PASSWORD` **doit** être un *mot de passe d'application* (16 caractères, généré
sur https://myaccount.google.com/apppasswords), jamais le mot de passe habituel du compte —
Gmail refuse systématiquement l'authentification SMTP avec un mot de passe normal dès que la
validation en 2 étapes est active. C'est la cause la plus fréquente d'un e-mail Gmail qui « ne
part pas » : **le blocage vient alors de Gmail lui-même, avant même que le code n'entre en jeu**.

Ces deux variables (`backend/.env`) sont **vides par défaut** — sans elles, le formulaire
fonctionne toujours côté visiteur mais aucun e-mail ne part réellement (503 renvoyé).

### Si l'e-mail n'arrive toujours pas malgré une configuration correcte

1. **Regarder la réponse HTTP réelle du formulaire**, pas seulement l'interface : 200 = envoi
   confirmé par le fournisseur ; 503 = l'e-mail n'est **pas** parti (le corps de la réponse
   contient `error.code` : `SMTP_NON_CONFIGURE`, `EXPEDITEUR_MANQUANT` ou `ECHEC_ENVOI`).
2. **Regarder les logs du backend** : chaque tentative écrit une ligne `[mailer] ...` — succès
   silencieux (rien d'anormal), ou un message donnant la cause exacte (identifiants refusés,
   expéditeur non vérifié, hôte injoignable, etc.).
3. **Vérifier le dossier spam/indésirables** du destinataire — un envoi *techniquement réussi*
   peut être filtré par le fournisseur mail du destinataire ; ce n'est pas un blocage côté
   application mais un filtrage côté réception.
4. **En SMTP uniquement** : vérifier que le serveur qui héberge le backend autorise le trafic
   sortant sur le port 587/465 — certains hébergeurs le bloquent par défaut. C'est justement ce
   que la méthode API Brevo permet d'éviter entièrement.
5. **Limite d'envoi** : Gmail standard ~500 e-mails/jour ; Brevo gratuit 300/jour — largement
   suffisant pour un formulaire de contact, à garder en tête si le volume augmente.

## Bug réel trouvé en production (démarrage sur MySQL)

Lors d'un premier démarrage réel sur MySQL (hors de cet environnement de développement, qui ne
dispose que de SQLite), le serveur plantait au démarrage :

```
error: Impossible de démarrer le serveur : Specified key was too long; max key length is 767 bytes
```

**Cause** : les colonnes `slug` des nouvelles tables (`actualites`, `services_vitrine`,
`secteurs_vitrine`) étaient déclarées en `STRING(255) unique: true`. Avec le jeu de caractères
`utf8mb4` (4 octets par caractère) et l'ancien format de ligne InnoDB par défaut sur certaines
installations MySQL/MariaDB, un index ne peut pas dépasser 767 octets — or 255 caractères × 4
octets = 1020 octets, largement au-dessus de la limite. C'est un problème bien connu de
l'écosystème MySQL (la même raison pour laquelle Laravel utilise `191` comme longueur de chaîne
par défaut pour les colonnes indexées).

**Pourquoi ce bug n'a pas été détecté avant** : toute la suite de tests d'intégration tourne sur
SQLite (choix assumé — voir « Tests » plus haut — pour ne pas exiger d'installation MySQL locale),
qui n'impose aucune limite de ce type. Le bug était donc invisible aux 181 tests automatisés
jusqu'à un démarrage réel sur un vrai serveur MySQL.

**Correctif** : les trois colonnes `slug` concernées sont passées de `STRING(255)` à `STRING(191)`
(764 octets en utf8mb4, sous la limite de 767) — dans les migrations concernées **et** les modèles
Sequelize correspondants (les deux doivent rester synchronisés). Un garde-fou a été ajouté pour que
cette classe de bug ne puisse plus jamais revenir silencieusement :
`tests/garantiesLongueurColonnes.test.js` analyse statiquement le texte de tous les fichiers de
`migrations/` et `src/models/` et fait échouer la suite si une colonne unique `STRING`/`CHAR` de
plus de 191 caractères est un jour réintroduite — y compris sans disposer d'un vrai serveur MySQL
pour le vérifier. Vérifié en réintroduisant temporairement le bug : le garde-fou l'a bien détecté
et expliqué avant d'être annulé.

## Bug réel trouvé en production (page d'accueil : crash au chargement des témoignages)

Une fois le serveur démarré sur MySQL (bug précédent corrigé), le site plantait dans le
navigateur au chargement de l'Accueil :

```
Uncaught TypeError: Cannot read properties of undefined (reading 'message')
    at Temoignages (Temoignages.jsx:24:92)
```

**Cause** : le hook générique `useDonneesPubliques` ne déballait qu'un seul niveau de la réponse
Axios (`res.data?.data`), alors que les endpoints de liste du backend (`/public/consultants`,
`/public/realisations`, `/public/actualites`, `/public/temoignages`, `/public/services`,
`/public/secteurs`) renvoient tous `{ success, message, data: { data: [...] } }` — la même
convention à double emballage que suit déjà tout le reste du back-office (voir par exemple
`Consultants.jsx` : `data.data?.data`). Avec un seul niveau déballé, `donnees` valait
`{ data: [...] }` (un objet) plutôt que le tableau lui-même. `temoignages.length` valait alors
`undefined`, la vérification « liste vide » (`erreur || temoignages.length === 0`) ne se
déclenchait jamais, et `temoignages[index % undefined]` renvoyait `undefined` → plantage sur
`.message`. Le même défaut affectait silencieusement (plantage identique, ou `.map is not a
function`) sept composants au total : Accueil, Nos Services, Nos Secteurs, Notre Équipe,
Réalisations, Actualités et Témoignages.

**Pourquoi ce bug n'a pas été détecté avant** : le smoke test SSR (`smoke-test-ssr.mjs`) rend
chaque page une seule fois avec `renderToStaticMarkup`, qui n'exécute jamais les `useEffect` — les
pages s'y affichaient donc systématiquement dans leur état de *chargement initial* (tableau vide
par défaut), sans jamais atteindre le code qui accède aux données une fois arrivées. Un test
« qui ne plante pas en SSR » ne garantit donc rien sur le rendu une fois les données chargées côté
client — la faille méthodologique a été corrigée (voir ci-dessous), pas seulement le bug lui-même.

**Correctif** : `useDonneesPubliques` déballe désormais deux niveaux par défaut
(`res.data?.data?.data`), cohérent avec la convention déjà en place ailleurs dans le projet ; un
troisième paramètre optionnel (`extraire`) permet de personnaliser ce comportement pour les
endpoints qui ne suivent pas ce schéma (ex. `/public/identite-site`, qui renvoie un objet direct
`{ valeurs, managerGeneral }` plutôt qu'une liste).

Un nouveau script, **`frontend/scripts/smoke-test-donnees-reelles.mjs`** (`npm run
smoke-test-donnees`), comble la lacune méthodologique identifiée ci-dessus : il démarre un vrai
DOM (jsdom), monte chaque page publique, laisse réellement le `useEffect` s'exécuter contre un
vrai backend (pointé via `API_BASE_URL`), attend la résolution des requêtes, **puis** vérifie que
le contenu réel (ex. le texte exact d'un témoignage seedé) apparaît sans erreur console — exactement
le scénario qui a fait planter le navigateur. Intégré à la CI (`frontend-build`), qui démarre
désormais un vrai serveur backend contre un vrai MySQL de test avant de l'exécuter. Vérifié : les
7 pages passent, y compris le texte exact du témoignage qui provoquait le plantage.

## Bug réel trouvé en production (migrations impossibles à lancer dans Docker)

En préparant les instructions de démarrage Docker, `sequelize-cli` s'est révélé absent de l'image
Docker de production : le `Dockerfile` du backend installe les dépendances avec
`npm install --omit=dev`, alors que `sequelize-cli` était classé en `devDependencies` dans
`package.json`. Résultat : `docker compose exec backend npm run db:migrate` aurait échoué avec
« command not found », rendant impossible d'appliquer le schéma ou de peupler la base dans un
déploiement Docker — sans lien avec l'e-mail, mais bloquant tout aussi sûrement le démarrage réel
du site.

**Correctif** : `sequelize-cli` déplacé vers `dependencies`. Vérifié en reproduisant exactement la
commande du `Dockerfile` (`npm install --omit=dev`) puis en confirmant que `npx sequelize-cli
--version` fonctionne — avant le correctif, cette même vérification échouait.

## Bug réel trouvé en production (`ERROR: Duplicate column name` au premier `db:migrate`)

En testant le démarrage Docker en conditions réelles, la migration
`20260726000001-add-champs-visibilite-site-public` échouait systématiquement avec
`ERROR: Duplicate column name 'poste_public'`, alors que les 50 migrations précédentes
s'appliquaient sans problème.

**Cause** : `src/server.js` appelait `sequelize.sync({ alter: true })` au démarrage en mode
développement (`NODE_ENV=development`, la valeur par défaut de `backend/.env`) — ce mécanisme
introspecte les modèles Sequelize et modifie directement le schéma pour qu'il corresponde,
**indépendamment des migrations**. Comme `docker compose up` démarre le conteneur backend (donc
exécute ce `sync()`) **avant** que l'utilisateur ne lance manuellement `db:migrate`, les colonnes
`poste_public`/`bio_publique`/`visible_site_public` étaient déjà créées par `sync()` dès le premier
démarrage du conteneur. La migration correspondante, qui ne sait pas que `sync()` est passé par
là (`SequelizeMeta` ne le trace pas), tentait alors de créer les mêmes colonnes une seconde fois.

Faire cohabiter `sequelize.sync()` et des migrations Sequelize-CLI est un anti-pattern connu de
l'écosystème : les deux mécanismes doivent être mutuellement exclusifs, jamais utilisés ensemble
sur un même projet.

**Correctif** : `sequelize.sync()` retiré de `server.js`. Les migrations Sequelize-CLI sont
désormais la seule source de vérité pour le schéma, en développement comme en production. Vérifié
en relançant le cycle complet (migrate → seed → démarrage serveur → connexion réelle) sans le
`sync()` : plus aucun conflit possible par construction. ⚠️ Si votre base MySQL a déjà été touchée
par l'ancien comportement (schéma partiellement modifié par `sync()`, `SequelizeMeta` incohérent
avec le schéma réel), le plus sûr est de repartir d'une base vierge :
`docker compose down -v && docker compose up -d --build`, puis `db:migrate` et `db:seed`.

## Fonctionnalité manquante trouvée (création de consultant impossible depuis l'interface)

La page **Consultants** du back-office n'affichait que la liste des consultants existants, sans
aucun moyen d'en créer un : ni bouton, ni formulaire, ni modale. Un consultant n'est pas une entité
autonome (`Consultant` référence obligatoirement un `Utilisateur` existant via `utilisateur_id`),
donc « créer un consultant » suppose en réalité deux opérations liées : créer le compte de
connexion (rôle CONSULTANT), puis créer le profil consultant associé (spécialité, TJM).

**Ajouté** : une modale « Nouveau consultant » (bouton en haut de la page) qui enchaîne les deux
appels API dans le bon ordre (création de l'utilisateur, récupération de son identifiant, création
du profil consultant lié), avec le rôle CONSULTANT résolu dynamiquement depuis `/roles` plutôt que
codé en dur. Vérifié par un test de bout en bout via de vraies requêtes HTTP contre un vrai
serveur : création réussie, consultant visible dans la liste, **et connexion réelle réussie avec
les identifiants du compte fraîchement créé**.

## Bug réel trouvé en production (l'écran de connexion affiche toujours « Une erreur est survenue »)

Même après correction des problèmes précédents, l'écran de connexion affichait systématiquement le
message générique « Une erreur est survenue, veuillez réessayer. » — jamais le vrai motif
(identifiants invalides, compte verrouillé...), ce qui rendait tout diagnostic impossible depuis
l'interface.

**Cause** : l'intercepteur de réponse Axios (`frontend/src/api/axios.js`) traitait **tout** 401
comme une session expirée à rafraîchir automatiquement — y compris un 401 renvoyé par
`/auth/login` lui-même en cas de mauvais mot de passe. Un échec de connexion déclenchait alors une
tentative de rafraîchissement vouée à l'échec (aucun `refreshToken` n'existe avant une première
connexion réussie), elle-même suivie d'une redirection forcée (`window.location.href =
'/connexion'`) — vers la page où l'utilisateur se trouvait déjà. Cette redirection interrompait le
traitement de la réponse avant que le vrai message d'erreur ("Identifiants invalides.") n'atteigne
le composant `Connexion.jsx`, qui retombait sur son message de repli générique.

**Correctif** : les endpoints d'authentification eux-mêmes (`/auth/login`, `/auth/login-2fa`,
`/auth/refresh`, `/auth/inscription`) sont désormais explicitement exclus de la logique de
rafraîchissement automatique — un 401 sur ces routes remonte tel quel, avec son vrai message.
Un nouveau script, **`frontend/scripts/smoke-test-intercepteur-auth.mjs`** (`npm run
smoke-test-auth`, intégré à la CI), simule un 401 sur `/auth/login` et vérifie qu'aucun refresh
n'est tenté et que le vrai message d'erreur remonte intact — **vérifié en réintroduisant
temporairement le bug pour confirmer que le test le détecte** (passe de 0 à 1 tentative de refresh
détectée, test qui échoue comme attendu).

Une erreur réseau pure (backend injoignable, CORS bloqué, routage nginx cassé — le cas où aucune
réponse HTTP n'est reçue du tout) déclenche désormais aussi un `console.error` explicite dans la
console du navigateur, pour un diagnostic immédiat sans avoir à fouiller les logs serveur.

## Bug réel trouvé en production (`POST /api/v1/auth/login` → 405 en accès direct au frontend)

En accédant au site via le port exposé directement par le conteneur `frontend` (ex. `:5173`,
pratique quand le port 80 est déjà pris sur la machine hôte — fréquent sous Windows avec IIS,
Skype, etc.) plutôt que via le reverse-proxy `nginx` (port 80), toute tentative de connexion
échouait avec `POST http://localhost:5173/api/v1/auth/login 405 (Not Allowed)`.

**Cause** : `frontend/nginx.conf` (le Nginx interne au conteneur `frontend`, qui sert les fichiers
statiques du build React) ne savait faire qu'une seule chose : servir des fichiers, avec un repli
SPA (`try_files ... /index.html`) pour le routage côté client. Il n'avait **aucune règle pour
`/api/`** — seul le Nginx du service `nginx` (le reverse-proxy, port 80) proxie les appels API vers
le backend. Une requête `POST /api/v1/auth/login` reçue par le Nginx du conteneur `frontend`
tombait donc sur le repli SPA, qui tente de servir `index.html` — une ressource statique — via la
méthode `POST`, refusée par Nginx (405).

**Correctif** : `frontend/nginx.conf` proxie désormais lui aussi `/api/` et `/api-docs/` vers
`backend:5000` (résolution par nom de service sur le réseau Docker `gp-suite-network`), avec
exactement les mêmes règles que le reverse-proxy. **Les deux points d'entrée fonctionnent
maintenant de façon identique** : `http://localhost` (port 80, via `nginx`) et
`http://localhost:5173` (accès direct au conteneur `frontend`, utile en secours ou en débogage).
Vérifié en reproduisant le bug avec un faux serveur backend local : confirmé 405 avec l'ancienne
configuration, requête correctement transmise au backend avec la nouvelle.

`docker-compose.yml` mis à jour en conséquence : port MySQL déplacé sur `3307` (évite un conflit
avec un MySQL local déjà installé), port `5173` exposé sur le conteneur `frontend` pour cet accès
de secours, et le port direct du `backend` retiré (désormais joignable uniquement via le réseau
Docker interne — ni nécessaire ni souhaitable de l'exposer en plus sur l'hôte, les deux Nginx
proxient déjà correctement vers lui).

## Sécurité

- **Authentification** : JWT (access token courte durée + refresh token httpOnly/secure/SameSite),
  mots de passe hachés avec BCrypt (coût 12).
- **Double authentification (2FA/TOTP)** (`src/utils/totp.js`, via `speakeasy` + `qrcode`) :
  - `POST /auth/2fa/setup` génère un secret + QR code à scanner (Google Authenticator, Authy...)
  - `POST /auth/2fa/confirm` active la 2FA après vérification d'un premier code, et génère
    **8 codes de récupération à usage unique** (affichés une seule fois, hachés en base SHA-256)
  - Une fois activée, `POST /auth/login` renvoie un `challengeToken` au lieu des tokens finaux ;
    `POST /auth/login-2fa` les délivre après vérification du code TOTP **ou d'un code de
    récupération** (fenêtre de tolérance ±30s pour le TOTP)
  - `POST /auth/2fa/backup-codes/regenerate` régénère un nouveau lot (invalide les précédents)
  - `POST /auth/2fa/disable` désactive la 2FA et purge les codes de récupération
  - Testé unitairement (`tests/totp.test.js` 4/4, `tests/otpBackupCodes.test.js` 4/4)
  - Interface frontend dédiée (`components/Configuration2FA.jsx`, onglet Paramètres > Sécurité),
    avec affichage des codes de récupération à l'activation
- **Politique de mot de passe** (`src/utils/passwordPolicy.js`) : 10 caractères minimum, majuscule,
  minuscule, chiffre, caractère spécial, rejet des mots de passe courants/prévisibles. Appliquée en
  middleware de route (`POST /utilisateurs`, `POST /auth/reset-password`) et en défense en
  profondeur dans `utilisateur.controller.js`. Testée unitairement (`tests/passwordPolicy.test.js`,
  5/5 tests passants).
- **Verrouillage de compte** après 5 échecs de connexion consécutifs (15 minutes), en complément du
  rate limiting global (colonnes `tentatives_echouees` / `verrouille_jusqua` sur `utilisateurs`).
- **Réinitialisation de mot de passe** : `POST /auth/forgot-password` puis `POST /auth/reset-password`
  (réponse générique pour éviter l'énumération de comptes).
- **RBAC** appliqué à chaque route sensible (middleware `checkRole`).
- **Protections OWASP** : Helmet (en-têtes HTTP), xss-clean, rate limiting, requêtes paramétrées via
  Sequelize (anti-injection SQL).
- **Journal d'audit** (`logs_audit`) pour toutes les actions sensibles (y compris les événements 2FA).
- **Hygiène du dépôt** (audit du 27/07/2026) : `backend/.env` contenait auparavant de vrais secrets
  JWT générés (au lieu de placeholders) et était livré tel quel avec le code — remplacé par des
  valeurs explicitement « à changer », identiques au format de `.env.example`. Un `.gitignore`
  racine a été ajouté (absent jusqu'ici) pour empêcher qu'un futur `.env` réel, `node_modules`, ou
  des uploads/logs applicatifs ne se retrouvent un jour committés.

## Validation effectuée

- ✅ Syntaxe vérifiée sur les 128 fichiers JS du backend (`node --check`), incluant migrations, seeders et tests
- ✅ `app.js` se charge sans erreur runtime (modèles, routes, middlewares importés correctement)
- ✅ Suite de tests Jest/Supertest : **186/186 tests passent (100 %)**, répartis en tests unitaires
  (JWT, RBAC, politique de mot de passe, TOTP/2FA, codes de récupération, **module d'envoi
  d'e-mail**, **garde-fou longueur de colonnes MySQL**) et **21 suites d'intégration bout-en-bout**
  couvrant l'ensemble des modules fonctionnels (Projets, Missions, Finances, Documents, RH,
  Contrats, Formations, Suivi-évaluation, Logistique, Véhicules, Études, Ateliers, Événements,
  Compétences, Journal d'audit, Notifications, **Site public**, **Catalogue vitrine — Services &
  Secteurs**,
  **Identité du site public**, **Formulaire de contact**) contre une vraie base
  SQLite en mémoire
- ✅ **`multer` mis à jour de la branche 1.x (vulnérable) vers `^2.2.0`** (patchée) sans changement
  d'API côté `upload.middleware.js` — vérifié par la suite `documents.test.js` (upload multipart,
  rejet de type de fichier non autorisé, téléchargement binaire), toujours au vert après la
  migration
- ✅ `npm run build` du frontend Vite toujours réussi après mise à jour des dépendances
- ✅ **Code-splitting par route** (`React.lazy` + `Suspense`, `App.jsx`) : le chunk JS initial est
  passé de ~735 kB à **223 kB** (gzip : 75 kB) ; chaque page devient son propre chunk chargé à la
  demande à la navigation, avec un `PageLoader` comme fallback pendant le téléchargement
- ✅ `npm run build` du frontend React réussit sans erreur (Vite + Tailwind), y compris la page de
  détail projet en onglets, le composant de configuration 2FA et le **visualiseur de journal
  d'audit paginé et filtrable** dans Paramètres
- ✅ Génération du spec OpenAPI vérifiée (dont les 5 endpoints 2FA et les 2 endpoints du journal d'audit)
- ✅ `npx sequelize-cli db:migrate:status` charge correctement la configuration CLI
- ✅ Syntaxe YAML du workflow CI validée
- ✅ Dossier de conception converti en `.docx` (pandoc → LibreOffice), rendu vérifié page par page
  (37 pages). Les 8 diagrammes UML (Mermaid) ont été rendus en véritables images PNG via
  `mermaid-cli` (Puppeteer + Chrome headless) et insérés dans le document, chacun avec sa légende
  ("Figure N — ..."). **Correction appliquée** : une première version laissait 5 diagrammes
  (rapport hauteur/largeur élevé) s'étirer jusqu'à 50 cm de haut faute de contrainte de hauteur ;
  corrigé en calculant explicitement, pour chaque image, des dimensions width/height (en cm)
  contraignant chacune à un gabarit maximal de 15 × 20 cm tout en conservant les proportions.
  Vérifié par extraction des dimensions réelles en EMU du `document.xml` généré (toutes ≤ 15 cm de
  large et ≤ 20 cm de haut) et par analyse statistique des pages rendues (4 à 8 % de pixels
  non-blancs par page de figure, confirmant un contenu graphique réel).

## Documentation complète

Le dossier de conception complet (analyse des besoins, 23 modules détaillés, diagrammes UML,
dictionnaire de données, architecture, sécurité, planning) est fourni séparément dans le document
`GROSERE_PLUS_Conception_Plateforme.md`.

## Mise en HTTPS (Let's Encrypt)

`nginx/default.conf` sert désormais un bloc `80` (redirection + défi ACME) et un bloc `443`
(TLS 1.2/1.3, HSTS) pointant vers `/etc/nginx/ssl/live/<domaine>/{fullchain,privkey}.pem` — le
même chemin que celui utilisé par Certbot dans `/etc/letsencrypt`. `docker-compose.yml` monte un
volume partagé `certbot_conf` entre `nginx` (lecture seule) et un service `certbot` dédié au
renouvellement automatique (`certbot renew` toutes les 12 h), ainsi qu'un volume `certbot_webroot`
pour le défi HTTP.

**Problème classique de bootstrap** : Nginx refuse de démarrer si les fichiers de certificat
référencés dans `ssl_certificate` n'existent pas encore — or Certbot a besoin que Nginx tourne pour
répondre au défi HTTP. Procédure en trois étapes pour sortir de ce cycle, une fois le DNS du
domaine pointé vers le serveur :

```bash
# 1. Certificat auto-signé temporaire, juste pour permettre à Nginx de démarrer
domain=gp-suite.groserplus.sn
docker compose run --rm --entrypoint sh certbot -c "
  mkdir -p /etc/letsencrypt/live/$domain &&
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/$domain/privkey.pem \
    -out /etc/letsencrypt/live/$domain/fullchain.pem \
    -subj '/CN=localhost'"

docker compose up -d nginx

# 2. Émission du vrai certificat (remplace le certificat temporaire)
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d $domain --email admin@grosereplus.sn --agree-tos --no-eff-email

# 3. Recharger Nginx pour prendre en compte le certificat définitif
docker compose exec nginx nginx -s reload
docker compose up -d certbot   # démarre la boucle de renouvellement automatique
```

Le service `certbot` renouvelle ensuite le certificat de façon autonome ; aucune intervention
manuelle n'est requise tant que le conteneur tourne.

## Prochaines étapes suggérées

1. Améliorer encore la mise en page du `.docx` (styles de titres personnalisés, page de garde).
2. Le reste des vulnérabilités `npm audit` concerne exclusivement des dépendances de
   développement/test (sqlite3, tar, jest — transitives) sans exposition en production ; à
   surveiller mais non bloquant.
3. Envisager une migration vers un framework avec rendu serveur (Next.js, ou SSR Vite) si un
   référencement SEO maximal (contenu déjà présent dans le HTML avant exécution du JavaScript)
   devient une priorité pour le site vitrine — l'architecture SPA actuelle reste bien indexable
   par les moteurs modernes (qui exécutent le JavaScript) mais n'offre pas de contenu pré-rendu.

> Le site vitrine public est intégré au frontend existant (voir section dédiée en tête de
> document), toutes les pages métier prévues (Logistique, Véhicules, Suivi-évaluation, Finances,
> RH, Études, Contrats) sont implémentées côté frontend et routées, le module Notifications
> dispose de sa propre suite de tests d'intégration, le HTTPS/Let's Encrypt est configuré de bout
> en bout, le bundle frontend est découpé par route, et les migrations Sequelize sont désormais
> granulaires (une par table) et vérifiées de bout en bout contre une base réelle.
