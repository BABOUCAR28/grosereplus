# ── Étape 1 : dépendances de production ────────────────────────
FROM node:20-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./

# Installation robuste pour la production
RUN npm install --omit=dev --no-audit --no-fund --legacy-peer-deps

# ── Étape 2 : image finale ─────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /usr/src/app

# Installer wget pour le healthcheck (NÉCESSAIRE pour le déploiement)
RUN apk add --no-cache wget

# Copier les dépendances
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copier le code source
COPY . .

# Créer les dossiers et permissions
RUN mkdir -p uploads logs && chown -R node:node /usr/src/app

# Changer pour l'utilisateur node (sécurité)
USER node

# Healthcheck pour la production
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget -qO- http://localhost:5000/health || exit 1

EXPOSE 5000

# Démarrer l'application
CMD ["node", "src/server.js"]