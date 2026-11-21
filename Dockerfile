# Imagen del panel de TennisTrack (Next.js en modo standalone).
# La usa deploy/docker-compose.yml; al arrancar aplica las migraciones
# de la base de cuentas y luego levanta el servidor.

FROM node:24-alpine AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS construccion
WORKDIR /app
COPY --from=dependencias /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# api.ts exige estas variables al cargarse; los valores reales llegan
# al arrancar el contenedor y no quedan en la imagen.
RUN TWENTY_API_URL=http://twenty.invalid TWENTY_API_KEY=solo-para-construir \
    npm run build

FROM node:24-alpine AS ejecucion
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 tennistrack && adduser -S -u 1001 -G tennistrack tennistrack
COPY --from=construccion --chown=tennistrack:tennistrack /app/.next/standalone ./
COPY --from=construccion --chown=tennistrack:tennistrack /app/.next/static ./.next/static
COPY --from=construccion --chown=tennistrack:tennistrack /app/public ./public
COPY --from=construccion --chown=tennistrack:tennistrack /app/migraciones ./migraciones
COPY --from=construccion --chown=tennistrack:tennistrack /app/scripts ./scripts
# Los scripts (migrar, admin) usan pg y bcryptjs; Next ya deja pg en
# node_modules, pero bcryptjs lo integra en su propio código.
COPY --from=construccion --chown=tennistrack:tennistrack /app/node_modules/bcryptjs ./node_modules/bcryptjs
USER tennistrack
EXPOSE 3000
CMD ["sh", "-c", "node scripts/migrar.mts && node server.js"]
