# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# NEXT_PUBLIC_* inlinées au build Next.js (+ remotePatterns dans next.config)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Copier uniquement les fichiers de dépendances d'abord (cache Docker)
COPY package*.json ./
RUN npm ci

# Copier le reste du code source
COPY . .

# Build Next.js (génère .next/standalone)
RUN npm run build

# Runtime stage — image minimale via output standalone
FROM node:20-alpine AS runner

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Assets publics + sortie standalone (deps tracées uniquement)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

CMD ["node", "server.js"]
