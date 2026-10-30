import { manejarErrores } from "@/lib/auth/errores";
import { requiereRol } from "@/lib/auth/servidor";

export const GET = manejarErrores(async () => {
  const { id, nombre, rol } = await requiereRol();

  return Response.json({ id, nombre, rol });
});
