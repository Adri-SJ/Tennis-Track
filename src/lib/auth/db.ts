import "server-only";
import { Pool } from "pg";

/*
  Conexión a la base de usuarios. Se guarda en globalThis para que
  la recarga en caliente de desarrollo no abra un pool por cada cambio.
*/
const global = globalThis as unknown as { poolTennisTrack?: Pool };

function crearPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("Falta DATABASE_URL en .env.local.");
  }

  return new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
}

export function db(): Pool {
  global.poolTennisTrack ??= crearPool();

  return global.poolTennisTrack;
}
