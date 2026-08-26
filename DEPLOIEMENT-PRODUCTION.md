# Déploiement de GP-SUITE en production sur https://grosereplus.com

Guide pas à pas, adapté à l'architecture réelle du projet (vérifiée avant
d'écrire ce document — voir `docker-compose.yml`, `nginx/default.conf`,
`backend/.env.example`). Suivez les étapes dans l'ordre.

**Convention utilisée pour chaque étape** : ce qu'on fait → commande exacte →
dossier d'exécution → résultat attendu → comment vérifier → erreurs
fréquentes et solution.

**Règle d'or rappelée à chaque commande destructive** : aucune commande de ce
guide ne supprime vos données. Les commandes `docker compose down -v`,
`docker system prune -a` et `docker volume prune` ne sont **jamais**
utilisées ici — voir §12 pour comprendre pourquoi et comment nettoyer sans
danger si besoin.

---

## 0. Ce qui a déjà été adapté dans le projet pour ce domaine

Avant de commencer, sachez que ces fichiers ont déjà été mis à jour pour
`grosereplus.com` (vous n'avez rien à modifier dedans, sauf mention contraire) :

- `nginx/default.conf` — `server_name grosereplus.com www.grosereplus.com`,
  avec redirection `www.` → apex et redirection HTTP → HTTPS
- `docker-compose.yml` — port `443` activé, ports de développement
  (`3307:3306` pour MySQL, `5173:80` pour le frontend) commentés avec une
  note « À COMMENTER EN PRODUCTION »
- `backend/.env.production.example` — nouveau gabarit avec
  `CORS_ORIGIN=https://grosereplus.com` et `FRONTEND_URL=https://grosereplus.com`

---

## 1. Objectif et architecture

```text
                         INTERNET
                            │
                            ▼
                 https://grosereplus.com
                            │
                            ▼
                          NGINX  (seul service exposé : 80, 443)
                       /          \
                      ▼            ▼
                FRONTEND        BACKEND
              (frontend:80)   (backend:5000)
                                   │
                                   ▼
                                 MYSQL
                              (mysql:3306, interne uniquement)
```

Tout le trafic passe par **un seul domaine** : `https://grosereplus.com/` pour
le frontend, `https://grosereplus.com/api/v1/...` pour l'API. Aucun port
`5173`, `5000` ou `3307` n'est exposé publiquement.

---

## 2. Prérequis côté domaine et serveur

- Un nom de domaine `grosereplus.com` déjà acheté (registrar de votre choix)
- Un VPS Ubuntu (20.04 ou 22.04) avec une adresse IP publique fixe
- Un accès SSH root ou sudo à ce VPS

---

## 3. Configuration DNS

**Ce qu'on fait** : faire pointer le domaine vers l'IP du serveur.

Chez votre registrar (ou votre gestionnaire DNS, ex. Cloudflare), créez deux
enregistrements :

| Type | Nom | Valeur |
|------|-----|--------|
| A | `@` | `IP_PUBLIQUE_DU_VPS` |
| A | `www` | `IP_PUBLIQUE_DU_VPS` |

**Résultat attendu** : les deux enregistrements apparaissent dans l'interface
de votre registrar, statut « actif ».

**Comment vérifier que le DNS fonctionne** (depuis votre machine locale, pas
le serveur) :

```bash
dig +short grosereplus.com
dig +short www.grosereplus.com
```

**Résultat attendu** : chaque commande affiche `IP_PUBLIQUE_DU_VPS`, rien
d'autre.

⚠️ **Ne passez pas à l'étape HTTPS (§10) tant que ceci n'est pas vérifié.**
La propagation DNS peut prendre de quelques minutes à 24-48h selon le
registrar et le TTL configuré. Si `dig` ne renvoie rien ou une autre IP,
patientez et retestez — Certbot échouera systématiquement tant que le DNS
n'est pas propagé, puisqu'il vérifie le domaine en y faisant une requête
HTTP réelle.

**Vérification complémentaire, une fois le DNS propagé et Nginx démarré**
(§9) :

```bash
curl -I http://grosereplus.com
```

**Résultat attendu** : une réponse HTTP (301 vers https, ou 200), pas une
erreur de connexion.

---

## 4. Connexion SSH et mise à jour du serveur

**Ce qu'on fait** : se connecter et mettre le système à jour avant
d'installer quoi que ce soit.

```bash
ssh root@IP_PUBLIQUE_DU_VPS
```
*(ou `ssh votre_utilisateur@IP_PUBLIQUE_DU_VPS` si vous utilisez un compte
non-root avec sudo)*

```bash
apt update && apt upgrade -y
```

**Dossier d'exécution** : peu importe, cette commande est globale au système.

**Résultat attendu** : la commande se termine sans erreur ; éventuellement un
message demandant de redémarrer si le noyau a été mis à jour.

**Vérifier** : `apt list --upgradable` doit afficher une liste vide ou quasi
vide.

**Erreur fréquente** : `Could not get lock /var/lib/dpkg/lock` → un autre
processus `apt`/`unattended-upgrade` tourne déjà en tâche de fond ; attendez
une minute et réessayez, ou `ps aux | grep apt` pour identifier le processus.

---

## 5. Installation de Docker et Docker Compose

**Ce qu'on fait** : installer Docker Engine (qui inclut le plugin Compose v2
— la commande sera `docker compose`, sans tiret, pas l'ancien
`docker-compose`).

```bash
curl -fsSL https://get.docker.com | sh
```

**Dossier d'exécution** : indifférent.

**Résultat attendu** : le script installe `docker-ce`, `docker-ce-cli`,
`containerd.io`, `docker-compose-plugin`.

**Vérifier** :

```bash
docker --version
docker compose version
```

**Résultat attendu** : deux numéros de version s'affichent (ex. `Docker
version 27.x`, `Docker Compose version v2.x`).

Si vous vous connectez avec un utilisateur non-root, ajoutez-le au groupe
`docker` pour éviter de préfixer chaque commande par `sudo` :

```bash
usermod -aG docker $USER
```

puis déconnectez-vous/reconnectez-vous (`exit` puis `ssh` à nouveau) pour que
ça prenne effet.

**Erreur fréquente** : `permission denied while trying to connect to the
Docker daemon socket` → l'utilisateur n'a pas encore rejoint le groupe
`docker`, ou la session n'a pas été relancée après le `usermod`.

---

## 6. Pare-feu (UFW)

**Ce qu'on fait** : n'autoriser que les ports strictement nécessaires — SSH
pour l'administration, HTTP/HTTPS pour l'application. Tout le reste
(y compris MySQL et le backend) reste inaccessible depuis Internet car ils
ne sont même pas exposés par Docker (voir §11).

```bash
apt install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

**Dossier d'exécution** : indifférent.

**Résultat attendu** : `ufw enable` demande confirmation (`y`) puis affiche
`Firewall is active and enabled on system startup`.

**Vérifier** :

```bash
ufw status
```

**Résultat attendu** :

```text
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

⚠️ **Piège classique** : activez `ufw allow 22/tcp` **avant** `ufw enable`,
sinon vous risquez de vous couper vous-même l'accès SSH et de perdre l'accès
au serveur (sauf console de secours fournie par votre hébergeur VPS). L'ordre
ci-dessus est le bon.

**Erreur fréquente** : après `ufw enable`, votre session SSH se fige →
vous avez été déconnecté car le port 22 n'était pas autorisé avant
l'activation. Reconnectez-vous via la console web de votre hébergeur (pas
SSH) et corrigez avec `ufw allow 22/tcp`.

---

## 7. Installation du projet

**Ce qu'on fait** : cloner ou copier le projet sur le serveur, dans un
dossier dédié.

```bash
mkdir -p /var/www
cd /var/www
git clone <URL_DE_VOTRE_DEPOT_GIT> grosereplus
# --- ou, si vous transférez le zip fourni au lieu d'un dépôt Git ---
# depuis votre machine locale : scp gp-suite-deployable.zip root@IP_PUBLIQUE_DU_VPS:/var/www/
# puis sur le serveur :
# cd /var/www && unzip gp-suite-deployable.zip && mv gp-suite grosereplus
```

**Dossier d'exécution** : `/var/www`.

**Résultat attendu** : le dossier `/var/www/grosereplus` existe et contient
`docker-compose.yml`, `backend/`, `frontend/`, `nginx/`.

**Vérifier** :

```bash
cd /var/www/grosereplus && ls
```

**Erreur fréquente** : `git: command not found` → `apt install -y git` puis
relancer le clone.

---

## 8. Configuration du `.env` — DEUX fichiers, pas un seul

⚠️ **Point critique, source d'erreur classique en production** : ce projet
utilise **deux fichiers `.env` différents**, lus par deux mécanismes
totalement séparés :

| Fichier | Lu par | Sert à |
|---|---|---|
| `backend/.env` | L'application Node (dans le conteneur `backend`, via `env_file:`) | JWT, CORS, SMTP, et aussi la connexion à MySQL côté application |
| `.env` (racine, à côté de `docker-compose.yml`) | **Docker Compose lui-même**, pour résoudre les `${DB_NAME}`, `${DB_PASSWORD}` etc. utilisés dans `docker-compose.yml` | Initialiser MySQL avec les bons identifiants au premier démarrage |

**Si vous ne créez que `backend/.env`** (l'erreur naturelle à faire), Docker
Compose ne le lira jamais pour ses propres besoins — MySQL sera initialisé
avec les valeurs par défaut codées en dur dans `docker-compose.yml`
(`change_me_strong_password`), pendant que le backend essaiera de s'y
connecter avec le VRAI mot de passe que vous avez généré → échec
d'authentification (`Access denied for user`) dès le premier démarrage.

**Ce qu'on fait** : créer les deux fichiers, avec les **mêmes valeurs**
`DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_ROOT_PASSWORD` dans les deux.

```bash
cd /var/www/grosereplus
cp .env.production.example .env
cp backend/.env.production.example backend/.env
```

Générez les secrets un par un :

```bash
# Mot de passe MySQL applicatif — notez le résultat, vous le collerez à DEUX endroits
openssl rand -hex 24

# Mot de passe root MySQL — un résultat DIFFÉRENT du précédent, collé à deux endroits aussi
openssl rand -hex 24

# JWT_SECRET (uniquement dans backend/.env)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT_REFRESH_SECRET — relancez la commande, le résultat sera différent
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Éditez les deux fichiers (`nano .env` puis `nano backend/.env`) : collez le
mot de passe MySQL applicatif dans `DB_PASSWORD` **des deux fichiers**, le
mot de passe root dans `DB_ROOT_PASSWORD` **des deux fichiers**. Les secrets
JWT et la config SMTP ne vont, eux, que dans `backend/.env`.

Complétez aussi la section SMTP Gmail dans `backend/.env` (voir §14 pour la
procédure complète d'obtention du mot de passe d'application).

**Dossier d'exécution** : `/var/www/grosereplus`.

**Résultat attendu** : ni `.env` ni `backend/.env` ne contiennent plus de
valeur `<A_GENERER>` ni `<A_REMPLIR>`.

**Vérifier qu'aucun placeholder n'a été oublié** :

```bash
grep -n "A_GENERER\|A_REMPLIR" .env backend/.env
```

**Résultat attendu** : aucune ligne affichée (commande silencieuse).

**Vérifier que les deux fichiers sont bien synchronisés — l'étape qui évite
l'erreur décrite plus haut** :

```bash
diff <(grep -E '^DB_(NAME|USER|PASSWORD|ROOT_PASSWORD)=' .env | sort) \
     <(grep -E '^DB_(NAME|USER|PASSWORD|ROOT_PASSWORD)=' backend/.env | sort)
```

**Résultat attendu** : **aucune sortie** (commande silencieuse = les deux
fichiers concordent parfaitement). Si `diff` affiche des lignes précédées de
`<` ou `>`, corrigez le fichier en écart avant de continuer — ne passez pas
à l'étape suivante tant que cette commande n'est pas silencieuse.

⚠️ Ces deux fichiers restent **sur le serveur uniquement** — tous deux sont
dans `.gitignore` et ne doivent jamais être commités ni renvoyés par un
canal non chiffré (pas d'e-mail, pas de Slack en clair).

---

## 9. Premier démarrage Docker Compose (HTTP uniquement, avant le certificat)

**Ce qu'on fait** : démarrer MySQL, le backend et le frontend. **Pas encore
Nginx en HTTPS** — Nginx a besoin d'un certificat qui n'existe pas encore
(voir le problème de bootstrap expliqué au §10).

```bash
cd /var/www/grosereplus
docker compose up -d --build mysql backend frontend
```

**Dossier d'exécution** : `/var/www/grosereplus` (là où se trouve
`docker-compose.yml`).

**Résultat attendu** : Docker télécharge l'image MySQL, construit les images
`backend` et `frontend` (peut prendre plusieurs minutes la première fois),
puis affiche les 3 conteneurs démarrés.

**Vérifier** :

```bash
docker compose ps
```

**Résultat attendu** : `mysql` en état `Up (healthy)`, `backend` et
`frontend` en état `Up`.

```bash
docker compose logs backend --tail=30
```

**Résultat attendu** : pas d'erreur de connexion à MySQL (`ECONNREFUSED` ou
`Access denied` indiqueraient un problème de mot de passe — revérifiez
`DB_PASSWORD` dans `.env`).

**Erreur fréquente** : `mysql` reste `Up (unhealthy)` après plus d'une minute
→ regardez `docker compose logs mysql` ; c'est souvent un `DB_ROOT_PASSWORD`
ou `DB_PASSWORD` contenant un caractère spécial mal interprété par Docker
Compose (évitez `$`, `` ` `` et les guillemets dans les mots de passe générés).

---

## 10. Certificat HTTPS (Let's Encrypt / Certbot)

**Ce qu'on fait** : Nginx refuse de démarrer si les fichiers de certificat
qu'il référence (`ssl_certificate` dans `nginx/default.conf`) n'existent pas
— mais Certbot a besoin que Nginx tourne pour répondre au défi de validation
HTTP. Trois étapes pour sortir de ce cycle.

⚠️ **Ne commencez cette section que si le DNS est bien propagé (§3
vérifié)** — Certbot y fait une vraie requête HTTP et échouera sinon.

### Étape 1 — certificat temporaire auto-signé (pour permettre à Nginx de démarrer)

```bash
cd /var/www/grosereplus
docker compose run --rm --entrypoint sh certbot -c "
  mkdir -p /etc/letsencrypt/live/grosereplus.com &&
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/grosereplus.com/privkey.pem \
    -out /etc/letsencrypt/live/grosereplus.com/fullchain.pem \
    -subj '/CN=localhost'"

docker compose up -d nginx
```

**Résultat attendu** : `docker compose up -d nginx` démarre sans erreur.

**Vérifier** :

```bash
docker compose ps nginx
curl -Ik http://grosereplus.com
```

**Résultat attendu** : `nginx` est `Up` ; le `curl` renvoie une réponse
(redirection 301 vers https) — le `-k` ignore l'avertissement de certificat
auto-signé temporaire, normal à ce stade.

### Étape 2 — émission du vrai certificat

```bash
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d grosereplus.com -d www.grosereplus.com \
  --email VOTRE_ADRESSE@grosereplus.com --agree-tos --no-eff-email
```

Remplacez `VOTRE_ADRESSE@grosereplus.com` par une vraie adresse — Let's
Encrypt s'en sert pour vous prévenir en cas de problème de renouvellement.

**Résultat attendu** :

```text
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/grosereplus.com/fullchain.pem
```

**Erreur fréquente** : `Challenge failed` ou `Timeout` → le DNS n'est pas
encore propagé (retour au §3), ou le port 80 n'est pas accessible depuis
Internet (vérifiez `ufw status`, §6).

### Étape 3 — recharger Nginx avec le vrai certificat

```bash
docker compose exec nginx nginx -s reload
docker compose up -d certbot
```

**Résultat attendu** : aucune erreur ; `certbot` démarre en tâche de fond
pour le renouvellement automatique (toutes les 12h, ne renouvelle
effectivement que dans les 30 jours avant expiration).

**Vérifier** :

```bash
curl -I https://grosereplus.com
```

**Résultat attendu** : `HTTP/2 200`, sans avertissement de certificat.

Depuis votre navigateur, ouvrez `https://grosereplus.com` — le cadenas doit
être vert/valide, sans aucun avertissement.

### Vérifier que le renouvellement automatique fonctionne

```bash
docker compose run --rm --entrypoint certbot certbot renew --dry-run
```

**Résultat attendu** : `Congratulations, all simulated renewals succeeded`.
Cette commande simule un renouvellement sans modifier le vrai certificat —
sûre à exécuter à tout moment pour vérifier que tout est correctement
configuré.

---

## 11. Vérification de l'architecture finale

**Ce qu'on fait** : confirmer qu'aucun service interne n'est exposé, et que
tout passe par Nginx.

```bash
docker compose ps
```

**Résultat attendu** — regardez la colonne `PORTS` :

| Service | PORTS attendu |
|---|---|
| `nginx` | `0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp` |
| `backend` | *(vide — aucun port publié)* |
| `frontend` | *(vide, si vous avez bien commenté `5173:80` comme indiqué en §0)* |
| `mysql` | *(vide, si vous avez bien commenté `3307:3306`)* |
| `certbot` | *(vide)* |

Si `backend`, `frontend` ou `mysql` affichent encore un port, ouvrez
`docker-compose.yml`, commentez la ligne `ports:` correspondante (déjà fait
dans le projet livré, à confirmer si vous être reparti d'une version
antérieure), puis :

```bash
docker compose up -d
```

*(cette commande recrée uniquement les conteneurs dont la configuration a
changé — elle ne supprime aucune donnée, voir §12)*

**Vérifier depuis l'extérieur** (votre machine locale, pas le serveur) que
les ports internes sont bien fermés :

```bash
curl -m 5 http://IP_PUBLIQUE_DU_VPS:5000
curl -m 5 http://IP_PUBLIQUE_DU_VPS:3307
```

**Résultat attendu** : `curl: (28) Connection timed out` (ou refusée) pour
les deux — c'est le comportement voulu, ces ports ne doivent pas répondre
depuis Internet.

---

## 12. Comprendre le stockage Docker (avant de nettoyer quoi que ce soit)

Vous avez demandé à comprendre où Docker stocke les choses avant de nettoyer
— c'est la bonne approche, voici les réponses.

| Élément | Emplacement sur le serveur |
|---|---|
| Images construites/téléchargées | `/var/lib/docker/image/` et `/var/lib/docker/overlay2/` |
| Volumes nommés (vos données : `mysql_data`, `backend_uploads`, `backend_logs`, `certbot_conf`) | `/var/lib/docker/volumes/` |
| Cache de build BuildKit | `/var/lib/docker/buildkit/` |

**Pourquoi l'espace disque reste occupé après avoir supprimé le dossier du
projet** : `rm -rf /var/www/grosereplus` supprime le code source, **pas**
les images Docker déjà construites, ni les volumes (qui vivent dans
`/var/lib/docker`, complètement indépendant du dossier du projet), ni le
cache de build. C'est voulu — ça permet de recloner le projet et de
redémarrer sans tout retélécharger/reconstruire.

**Commandes destructives à connaître, et pourquoi ce guide ne vous les
recommande jamais automatiquement** :

| Commande | Effet | Recommandée ici ? |
|---|---|---|
| `docker compose down` | Arrête et supprime les **conteneurs**, garde les volumes | ✅ Sûre, utilisée si besoin de tout redémarrer proprement |
| `docker compose down -v` | Arrête tout **ET supprime les volumes** (donc **votre base MySQL, vos uploads, votre certificat HTTPS**) | ❌ Jamais dans ce guide |
| `docker system prune -a` | Supprime **toutes** les images non utilisées par un conteneur actif, y compris celles d'autres projets sur le même serveur | ❌ Jamais dans ce guide |
| `docker volume prune` | Supprime tous les volumes non attachés à un conteneur actif | ❌ Jamais dans ce guide |

**Nettoyer sans danger ce qui est réellement inutile** (images
intermédiaires de build, sans toucher aux volumes ni aux images en cours
d'utilisation) :

```bash
docker image prune -f
```

Cette commande ne supprime que les images `<none>` (résidus de builds
précédents), jamais une image utilisée par un conteneur actif ni un volume.

**Vérifier l'espace utilisé, par catégorie, avant de décider quoi que ce
soit** :

```bash
docker system df
```

**Résultat attendu** : un tableau `Images / Containers / Local Volumes /
Build Cache`, avec pour chaque ligne l'espace `RECLAIMABLE` (récupérable
sans danger) — c'est cette colonne qui vous dit ce qu'il est raisonnable de
nettoyer.

---

## 13. Migration et initialisation de la base de données

**Ce qu'on fait** : appliquer le schéma (tables) puis les données de
démarrage (rôles, comptes admin, contenu du site public), **sur la base
MySQL réelle, vide à ce stade** — MySQL a démarré avec une base vide car
aucun script d'initialisation n'est monté (voir la note en tête de
`backend/database/schema.sql` : ce fichier est un ancien instantané, non
utilisé — les migrations sont la seule source de vérité de ce projet).

```bash
cd /var/www/grosereplus
docker compose exec backend npx sequelize-cli db:migrate
docker compose exec backend npx sequelize-cli db:seed:all
```

**Dossier d'exécution** : `/var/www/grosereplus` (`docker compose exec` doit
être lancé depuis là où se trouve `docker-compose.yml`).

**Résultat attendu** : la première commande affiche une ligne `== ...
migrated` pour chacune des 59 migrations ; la seconde affiche 4 lignes
`== ... migrated` pour les 4 seeders.

**Vérifier** :

```bash
docker compose exec mysql mysql -u root -p"$(grep '^DB_ROOT_PASSWORD=' backend/.env | cut -d= -f2)" \
  -e "USE gp_suite; SHOW TABLES;" | wc -l
```

**Résultat attendu** : un nombre bien supérieur à 1 (le projet compte une
quarantaine de tables).

⚠️ **Comptes administrateurs réels** : le seeder `seed-roles-et-admin` crée
3 vrais comptes SUPER_ADMIN avec de vrais mots de passe (documentés en
commentaire dans le fichier seeder lui-même). **Connectez-vous immédiatement
avec l'un d'eux et changez son mot de passe** — voir §15.

---

## 14. Test de l'envoi des e-mails (Gmail SMTP)

**Ce qu'on fait** : obtenir un mot de passe d'application Google, puis
vérifier que l'envoi fonctionne réellement en production.

### Obtenir le mot de passe d'application

1. Le compte Google utilisé doit avoir la **validation en 2 étapes activée**
   (Compte Google → Sécurité → Validation en 2 étapes)
2. Rendez-vous sur <https://myaccount.google.com/apppasswords>
3. Créez un mot de passe d'application (nom libre, ex. « GP-Suite »)
4. Copiez le mot de passe généré (16 caractères, sans espaces) dans
   `SMTP_PASSWORD` du fichier `.env` (§8) — **pas** le mot de passe habituel
   du compte Gmail, qui ne fonctionnera pas pour du SMTP applicatif

```bash
cd /var/www/grosereplus
docker compose restart backend   # pour recharger le .env modifié
```

**Résultat attendu** : `backend` redémarre sans erreur.

### Tester l'envoi réel

Le moyen le plus simple : utiliser le flux « mot de passe oublié » du site
lui-même.

```bash
curl -X POST https://grosereplus.com/api/v1/auth/mot-de-passe-oublie \
  -H "Content-Type: application/json" \
  -d '{"email":"UN_VRAI_EMAIL_DE_TEST@exemple.com"}'
```

**Résultat attendu** : réponse JSON `{"success":true, ...}`, et un e-mail
reçu dans la boîte `UN_VRAI_EMAIL_DE_TEST@exemple.com` dans les secondes qui
suivent.

**Vérifier côté logs si rien n'arrive** :

```bash
docker compose logs backend --tail=50 | grep -i mail
```

**Erreurs fréquentes** :
- `Invalid login: 535-5.7.8` → mauvais mot de passe SMTP (vous avez utilisé
  le mot de passe du compte au lieu du mot de passe d'application)
- Aucune erreur dans les logs, mais rien ne part → certains hébergeurs VPS
  bloquent les ports SMTP sortants (25/465/587) par défaut ; testez
  `docker compose exec backend nc -zv smtp.gmail.com 587` — si ça échoue,
  contactez le support de votre hébergeur pour débloquer le port, ou basculez
  sur la méthode Brevo (API HTTPS, voir `backend/.env.example`) qui contourne
  ce blocage puisqu'elle passe par le port 443

---

## 15. Tests finaux

### Frontend

```bash
curl -I https://grosereplus.com
```

**Résultat attendu** : `HTTP/2 200`.

Ouvrez `https://grosereplus.com` dans un navigateur : la page d'accueil du
site vitrine doit s'afficher, avec le mega menu fonctionnel.

### API

```bash
curl https://grosereplus.com/api/v1/public/services | head -c 200
```

**Résultat attendu** : une réponse JSON avec des vrais services.

```bash
curl -I https://grosereplus.com/api-docs/
```

**Résultat attendu** : `HTTP/2 200` (documentation Swagger accessible).

### Redirection HTTP → HTTPS

```bash
curl -I http://grosereplus.com
```

**Résultat attendu** : `HTTP/1.1 301 Moved Permanently`, en-tête `Location:
https://grosereplus.com/`.

### www → apex

```bash
curl -Ik https://www.grosereplus.com
```

**Résultat attendu** : `301`, `Location: https://grosereplus.com/`.

### Connexion administrateur et changement de mot de passe

1. Ouvrez `https://grosereplus.com/connexion`
2. Connectez-vous avec l'un des 3 comptes du seeder (identifiants dans
   `backend/seeders/20260717000002-seed-roles-et-admin.js`)
3. Rendez-vous dans les paramètres du profil et **changez le mot de passe
   immédiatement** — ces identifiants sont dans le code source, donc
   potentiellement visibles par toute personne ayant accès au dépôt

### Logs — vérification finale

```bash
docker compose logs --tail=50
```

**Résultat attendu** : pas d'erreur en boucle ; les 5 services (`mysql`,
`backend`, `frontend`, `nginx`, `certbot`) tournent normalement.

---

## Récapitulatif — commandes de maintenance courante

```bash
cd /var/www/grosereplus

# Voir l'état des services
docker compose ps

# Voir les logs en direct
docker compose logs -f backend

# Redémarrer un service après modification du .env
docker compose restart backend

# Mettre à jour le code (nouvelle version) sans perdre les données
git pull
docker compose up -d --build

# Appliquer de nouvelles migrations après une mise à jour
docker compose exec backend npx sequelize-cli db:migrate
```
