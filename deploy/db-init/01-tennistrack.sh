#!/bin/sh
# Solo corre la primera vez que se crea el volumen de la base:
# crea el usuario y la base de cuentas de TennisTrack junto a la de Twenty.
set -e

psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  -v clave="$TENNISTRACK_DB_PASSWORD" <<'SQL'
CREATE ROLE tennistrack LOGIN PASSWORD :'clave';
CREATE DATABASE tennistrack OWNER tennistrack;
SQL
