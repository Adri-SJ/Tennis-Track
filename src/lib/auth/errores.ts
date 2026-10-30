import { ZodError } from "zod";

/* Error con estado HTTP y mensaje en español para el usuario. */
export class ErrorHttp extends Error {
  constructor(
    public status: number,
    mensaje: string,
    public datos?: Record<string, unknown>
  ) {
    super(mensaje);
  }
}

/*
  Envuelve un Route Handler: convierte ErrorHttp y ZodError en
  { error } con su estado y oculta los errores desconocidos.
*/
export function manejarErrores<A extends unknown[]>(
  handler: (...args: A) => Promise<Response>
) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ErrorHttp) {
        return Response.json(
          { error: error.message, ...error.datos },
          { status: error.status }
        );
      }

      if (error instanceof ZodError) {
        return Response.json(
          { error: error.issues[0]?.message ?? "Datos no válidos" },
          { status: 400 }
        );
      }

      console.error(error);

      return Response.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  };
}

/* Lee el cuerpo JSON; un cuerpo vacío o roto cuenta como {}. */
export async function leerJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
