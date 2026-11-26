import { SignJWT, jwtVerify } from "jose";

/*
  Token de sesión en una cookie httpOnly. Es deslizante: vence a los
  30 minutos sin actividad y cada petición lo renueva (proxy.ts). Nunca
  dura más de 16 h desde el inicio de sesión, aunque haya actividad.
  Lleva el id del usuario y la hora de inicio; el servidor además relee
  al usuario en la base.
*/

export const COOKIE_SESION = "tennistrack_sesion";

export const INACTIVIDAD_S = 30 * 60;

export const DURACION_MAXIMA_S = 16 * 60 * 60;

type Sesion = { id: number; inicio: number };

function clave(): Uint8Array {
  const secreto = process.env.JWT_SECRET;

  if (!secreto) {
    throw new Error("Falta JWT_SECRET en .env.local.");
  }

  return new TextEncoder().encode(secreto);
}

/* `inicio` (segundos) se conserva al renovar; sin él empieza una sesión nueva. */
export async function firmarToken(
  id: number,
  inicio = Math.floor(Date.now() / 1000)
): Promise<string> {
  return new SignJWT({ id, inicio })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${INACTIVIDAD_S}s`)
    .sign(clave());
}

async function leerSesion(token: string | undefined): Promise<Sesion | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, clave(), {
      algorithms: ["HS256"],
    });

    if (typeof payload.id !== "number" || typeof payload.inicio !== "number") {
      return null;
    }

    const ahora = Math.floor(Date.now() / 1000);

    return ahora - payload.inicio < DURACION_MAXIMA_S
      ? { id: payload.id, inicio: payload.inicio }
      : null;
  } catch {
    return null;
  }
}

export async function leerToken(
  token: string | undefined
): Promise<number | null> {
  return (await leerSesion(token))?.id ?? null;
}

/* Token nuevo con 30 minutos más, o null si la sesión ya no vale. */
export async function renovarToken(
  token: string | undefined
): Promise<string | null> {
  const sesion = await leerSesion(token);

  return sesion ? firmarToken(sesion.id, sesion.inicio) : null;
}

export const opcionesCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: INACTIVIDAD_S,
};
