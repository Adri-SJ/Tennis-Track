import "server-only";
import { ErrorHttp } from "./errores";

/*
  Límite de intentos en memoria por IP (ventana fija). Basta para
  un solo servidor; con varias instancias habría que moverlo a la base.
*/
const ventanas = new Map<string, { inicio: number; cuenta: number }>();

export function ipDe(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

export function limitarIntentos(
  clave: string,
  maximo: number,
  ventanaMs: number
): void {
  const ahora = Date.now();
  const actual = ventanas.get(clave);

  if (!actual || ahora - actual.inicio >= ventanaMs) {
    ventanas.set(clave, { inicio: ahora, cuenta: 1 });

    if (ventanas.size > 10_000) {
      for (const [otra, ventana] of ventanas) {
        if (ahora - ventana.inicio >= ventanaMs) {
          ventanas.delete(otra);
        }
      }
    }

    return;
  }

  actual.cuenta++;

  if (actual.cuenta > maximo) {
    throw new ErrorHttp(429, "Demasiados intentos, espera un minuto");
  }
}

/*
  Espera entre envíos para correos sin cuenta, para que «Recuperar
  contraseña» responda igual exista o no el correo.
*/
const ultimosEnvios = new Map<string, number>();

export function esperarReenvioSinCuenta(clave: string, segundos: number): void {
  const ahora = Date.now();
  const anterior = ultimosEnvios.get(clave);

  if (anterior && ahora - anterior < segundos * 1000) {
    const espera = Math.ceil((segundos * 1000 - (ahora - anterior)) / 1000);

    throw new ErrorHttp(
      429,
      `Espera ${espera} segundos para pedir otro código`,
      { espera }
    );
  }

  ultimosEnvios.set(clave, ahora);
}
