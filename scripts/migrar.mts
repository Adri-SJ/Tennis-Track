/*
  Aplica en orden las migraciones de migraciones/*.sql que aún
  no estén registradas en la tabla migraciones_aplicadas.
  Uso: npm run migrar
*/
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import pg from "pg";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Sin .env.local se usan las variables del entorno.
}

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL en .env.local.");
  process.exit(1);
}

const carpeta = join(process.cwd(), "migraciones");
const cliente = new pg.Client({ connectionString: process.env.DATABASE_URL });

await cliente.connect();

try {
  await cliente.query(`
    CREATE TABLE IF NOT EXISTS migraciones_aplicadas (
      nombre      text PRIMARY KEY,
      aplicada_en timestamptz NOT NULL DEFAULT now()
    )
  `);

  const { rows } = await cliente.query<{ nombre: string }>(
    "SELECT nombre FROM migraciones_aplicadas"
  );
  const aplicadas = new Set(rows.map((fila) => fila.nombre));

  const archivos = (await readdir(carpeta))
    .filter((archivo) => /^\d+_.+\.sql$/.test(archivo))
    .sort();

  let nuevas = 0;

  for (const archivo of archivos) {
    if (aplicadas.has(archivo)) {
      continue;
    }

    const sql = await readFile(join(carpeta, archivo), "utf8");

    await cliente.query("BEGIN");

    try {
      await cliente.query(sql);
      await cliente.query(
        "INSERT INTO migraciones_aplicadas (nombre) VALUES ($1)",
        [archivo]
      );
      await cliente.query("COMMIT");
    } catch (error) {
      await cliente.query("ROLLBACK");
      throw new Error(`Falló ${archivo}: ${(error as Error).message}`);
    }

    console.log(`Aplicada ${archivo}`);
    nuevas++;
  }

  console.log(
    nuevas ? `Listo: ${nuevas} migración(es) nueva(s).` : "La base ya está al día."
  );
} finally {
  await cliente.end();
}
