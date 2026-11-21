#!/bin/sh
# Restaura el respaldo de Twenty en la base "default" del servidor.
# Antes: deja twenty.dump (y, si hay, la carpeta twenty-archivos) en deploy/respaldo/.
# Uso, desde deploy/:  ./restaurar-twenty.sh
set -e
cd "$(dirname "$0")"

if [ ! -f respaldo/twenty.dump ]; then
  echo "Falta deploy/respaldo/twenty.dump" >&2
  exit 1
fi

echo "Deteniendo Twenty y el panel (la base sigue arriba)…"
docker compose stop server worker panel 2>/dev/null || true
docker compose up -d --wait db redis

echo "Reemplazando la base de Twenty con el respaldo…"
docker compose exec -T db dropdb -U postgres --if-exists --force default
docker compose exec -T db createdb -U postgres default
# Sin --exit-on-error: avisos por extensiones o permisos no detienen la restauración.
docker compose exec -T db pg_restore -U postgres -d default \
  --no-owner --no-privileges /respaldo/twenty.dump || true

if [ -d respaldo/twenty-archivos ]; then
  echo "Copiando archivos subidos (adjuntos y fotos)…"
  docker compose create server
  docker compose cp respaldo/twenty-archivos/. \
    server:/app/packages/twenty-server/.local-storage/
  # docker cp deja los archivos con el dueño de tu equipo; Twenty corre como "node".
  docker compose run --rm --no-deps -u root --entrypoint sh server -c \
    'chown -R node:node /app/packages/twenty-server/.local-storage && find /app/packages/twenty-server/.local-storage -name .DS_Store -delete'
fi

echo "Levantando todo…"
docker compose up -d --build

echo "Listo. Revisa que Twenty arranque con: docker compose logs -f server"
