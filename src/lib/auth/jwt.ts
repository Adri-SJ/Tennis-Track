import { SignJWT, jwtVerify } from "jose";

/*
  Token de sesión: solo lleva { id } y vence en 16 h. Vive en una
  cookie httpOnly. Lo usan el proxy (verificación optimista) y el
  servidor, que además relee al usuario en la base.
*/

export const COOKIE_SESION = "tennistrack_sesion";

export const DURACION_SESION_S = 16 * 60 * 60;

function clave(): Uint8Array {
  const secreto = process.env.JWT_SECRET;

  if (!secreto) {
    throw new Error("Falta JWT_SECRET en .env.local.");
  }

  return new TextEncoder().encode(secreto);
}

export async function firmarToken(id: number): Promise<string> {
  return new SignJWT({ id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACION_SESION_S}s`)
    .sign(clave());
}

export async function leerToken(
  token: string | undefined
): Promise<number | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, clave(), {
      algorithms: ["HS256"],
    });

    return typeof payload.id === "number" ? payload.id : null;
  } catch {
    return null;
  }
}

export const opcionesCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: DURACION_SESION_S,
};
