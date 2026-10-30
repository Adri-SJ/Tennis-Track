/*
  Llamadas a la API desde el navegador. La sesión viaja en la cookie
  httpOnly, así que aquí no se maneja ningún token.
*/

export class ErrorApi extends Error {
  constructor(
    mensaje: string,
    public status: number,
    public datos: Record<string, unknown> = {}
  ) {
    super(mensaje);
  }
}

/* true mientras el panel está abierto con sesión (lo marca SesionProvider). */
let haySesion = false;

export function marcarSesion(valor: boolean): void {
  haySesion = valor;
}

export async function api<T = Record<string, unknown>>(
  ruta: string,
  { method = "GET", body }: { method?: string; body?: unknown } = {}
): Promise<T> {
  let respuesta: Response;

  try {
    respuesta = await fetch(ruta, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ErrorApi("Sin conexión con el servidor", 0);
  }

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    if (respuesta.status === 401 && haySesion) {
      window.dispatchEvent(new Event("sesion-expirada"));
    }

    throw new ErrorApi(
      typeof datos.error === "string" ? datos.error : "Error inesperado",
      respuesta.status,
      datos
    );
  }

  return datos as T;
}

/* localStorage puede fallar (modo privado, bloqueado): nunca rompe la app. */
const CLAVE_CORREO = "tennistrack.correo";

export function correoGuardado(): string {
  try {
    return localStorage.getItem(CLAVE_CORREO) ?? "";
  } catch {
    return "";
  }
}

export function guardarCorreo(correo: string): void {
  try {
    localStorage.setItem(CLAVE_CORREO, correo);
  } catch {
    // Sin almacenamiento solo se pierde la comodidad de recordarlo.
  }
}
