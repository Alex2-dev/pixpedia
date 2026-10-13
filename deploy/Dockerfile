# Images de production de Pixpedia (API, worker, front statique).
# Construites depuis la racine du monorepo : docker compose -f docker-compose.prod.yml build

FROM node:22-bookworm-slim AS deps
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile
COPY tsconfig.base.json ./
COPY packages packages
COPY apps apps

# Front : build statique sous le sous-chemin /pixpedia/
FROM deps AS web-build
ENV VITE_BASE=/pixpedia/
RUN pnpm --filter @pixpedia/web build

FROM nginx:1.27.3-alpine AS web
COPY deploy/nginx.web.conf /etc/nginx/conf.d/default.conf
COPY --from=web-build /repo/apps/web/dist /usr/share/nginx/html/pixpedia

# API, worker et migrations : TypeScript exécuté par tsx (pas d'étape de build)
FROM deps AS node
ENV NODE_ENV=production
USER node
CMD ["node_modules/.bin/tsx", "apps/api/src/server.ts"]
