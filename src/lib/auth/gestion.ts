import "server-only";
import { ErrorHttp } from "./errores";
import type { UsuarioSesion } from "./servidor";
import { buscarPorId, type UsuarioCompleto } from "./usuarios";

/*
  Nadie se modifica a sí mismo: así siempre queda al menos un
  administrador activo, el que hace el cambio.
*/
export async function cuentaGestionable(
  actor: UsuarioSesion,
  idTexto: string
): Promise<UsuarioCompleto> {
  const id = Number(idTexto);
  const cuenta = Number.isInteger(id) ? await buscarPorId(id) : null;

  if (!cuenta) {
    throw new ErrorHttp(404, "No existe esa cuenta");
  }

  if (cuenta.id === actor.id) {
    throw new ErrorHttp(403, "No puedes modificar tu propia cuenta");
  }

  return cuenta;
}
