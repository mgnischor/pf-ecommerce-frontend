# Production image of the pf-ecommerce storefront (mirrors backend Dockerfile quality bars).
#
#   docker build --build-arg VERSION=1.0.0 --build-arg REVISION=$(git rev-parse HEAD) -t ecommerce-storefront:1.0.0 .
#   docker run --rm -p 8080:8080 ecommerce-storefront:1.0.0
#
# Base images are pinned by tag; pin tag AND digest once Renovate/Dependabot is wired
# (backend pins both; see TODO below). Rebuild at least monthly to pick up base patches.
# TODO(frontend-infra): pin base images by digest and add Renovate/Dependabot (backend parity).

# -------------------------------------------------------------------------------------------------
# Stage 1: build. The SDK, caches, and sources never reach the final image.
# -------------------------------------------------------------------------------------------------
FROM node:24.16.0-alpine AS build

WORKDIR /src

# Restore has its own layer, keyed only on the files that define the dependency graph.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . ./
RUN npm run build:ci

# -------------------------------------------------------------------------------------------------
# Stage 2: runtime. Static files served by nginx as non-root, read-only friendly.
# -------------------------------------------------------------------------------------------------
FROM nginx:1.29.1-alpine AS runtime

ARG VERSION=0.0.0-dev
ARG REVISION=unknown
ARG CREATED=unknown
ARG SOURCE=https://github.com/mgnischor/pf-ecommerce-frontend

LABEL org.opencontainers.image.title="pf-ecommerce-storefront" \
      org.opencontainers.image.description="Storefront of the pf-ecommerce platform (Angular)" \
      org.opencontainers.image.source="${SOURCE}" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}" \
      org.opencontainers.image.created="${CREATED}"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist/pf-ecommerce-frontend/browser /usr/share/nginx/html

# nginx unprivileged variant listens on 8080 and runs as non-root already on alpine? Keep explicit.
USER nginx
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
