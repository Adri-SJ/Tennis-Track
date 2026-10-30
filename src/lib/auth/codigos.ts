import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { db } from "./db";
import { enviarCodigo } from "./correo";
import { ErrorHttp } from "./errores";

export type Proposito = "registro" | "recuperar";

const VIGENCIA_MIN = 15;
const ESPERA_REENVIO_S = 60;
const MAX_INTENTOS = 5;

function hashCodigo(correo: string, codigo: string): string {
  return createHash("sha256").update(`${correo}:${codigo}`).digest("hex");
}

/*
  Genera y envía un código nuevo. Respeta la espera entre envíos,
  invalida los anteriores y solo guarda si el correo salió.
*/
export async function emitirCodigo(
  correo: string,
  proposito: Proposito,
  datos: Record<string, unknown> | null = null
): Promise<void> {
  const { rows } = await db().query<{ espera: number }>(
    `SELECT CEIL($3 - EXTRACT(EPOCH FROM now() - max(creado_en)))::int AS espera
       FROM codigos_verificacion
      WHERE correo = $1 AND proposito = $2`,
    [correo, proposito, ESPERA_REENVIO_S]
  );

  const espera = rows[0]?.espera;

  if (espera && espera > 0) {
    throw new ErrorHttp(
      429,
      `Espera ${espera} segundos para pedir otro código`,
      { espera }
    );
  }

  const codigo = String(randomInt(0, 1_000_000)).padStart(6, "0");

  await enviarCodigo(correo, codigo, proposito);

  const cliente = await db().connect();

  try {
    await cliente.query("BEGIN");
    await cliente.query(
      `UPDATE codigos_verificacion SET usado_en = now()
        WHERE correo = $1 AND proposito = $2 AND usado_en IS NULL`,
      [correo, proposito]
    );
    await cliente.query(
      `INSERT INTO codigos_verificacion (correo, proposito, codigo_hash, datos, expira_en)
       VALUES ($1, $2, $3, $4, now() + make_interval(mins => $5))`,
      [correo, proposito, hashCodigo(correo, codigo), datos, VIGENCIA_MIN]
    );
    await cliente.query("COMMIT");
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
}

/*
  Comprueba el código vigente y lo marca como usado. El intento se
  cuenta antes de comparar, así nunca pasan de MAX_INTENTOS.
  Devuelve los datos guardados al emitirlo.
*/
export async function canjearCodigo(
  correo: string,
  proposito: Proposito,
  codigo: string
): Promise<Record<string, unknown> | null> {
  const { rows } = await db().query<{
    id: number;
    codigo_hash: string;
    datos: Record<string, unknown> | null;
  }>(
    `UPDATE codigos_verificacion SET intentos = intentos + 1
      WHERE id = (
        SELECT id FROM codigos_verificacion
         WHERE correo = $1 AND proposito = $2
           AND usado_en IS NULL AND expira_en > now()
         ORDER BY creado_en DESC
         LIMIT 1
      )
      AND intentos < $3
      RETURNING id, codigo_hash, datos`,
    [correo, proposito, MAX_INTENTOS]
  );

  const vigente = rows[0];

  if (!vigente) {
    throw new ErrorHttp(
      400,
      "El código venció o ya se usaron todos los intentos. Pide uno nuevo."
    );
  }

  const esperado = Buffer.from(vigente.codigo_hash, "hex");
  const recibido = Buffer.from(hashCodigo(correo, codigo), "hex");

  if (!timingSafeEqual(esperado, recibido)) {
    throw new ErrorHttp(400, "El código no es correcto");
  }

  const { rowCount } = await db().query(
    `UPDATE codigos_verificacion SET usado_en = now()
      WHERE id = $1 AND usado_en IS NULL`,
    [vigente.id]
  );

  if (!rowCount) {
    throw new ErrorHttp(400, "Este código ya se usó. Pide uno nuevo.");
  }

  return vigente.datos;
}
