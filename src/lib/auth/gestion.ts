import "server-only";
import { ErrorHttp } from "./errores";
import type { UsuarioSesion } from "./servidor";
import { buscarPorId, type UsuarioCompleto } from "./usuarios";
import { esSuperadmin, rolesAsignables, type Rol } from "@/lib/permisos";

/*
  Nadie se modifica a sí mismo: así siempre queda al menos un
  administrador activo, el que hace el cambio.

  Para un administrador normal, las cuentas de superadministrador no
  existen (404) y no puede asignar ese rol.
*/
export async function cuentaGestionable(
  actor: UsuarioSesion,
  idTexto: string,
  rolNuevo?: Rol | null
): Promise<UsuarioCompleto> {
  const id = Number(idTexto);
  const cuenta = Number.isInteger(id) ? await buscarPorId(id) : null;

  if (!cuenta || (esSuperadmin(cuenta.rol) && !esSuperadmin(actor.rol))) {
    throw new ErrorHttp(404, "No existe esa cuenta");
  }

  if (rolNuevo && !rolesAsignables(actor.rol).includes(rolNuevo)) {
    throw new ErrorHttp(403, "No puedes asignar ese rol");
  }

  if (cuenta.id === actor.id) {
    throw new ErrorHttp(403, "No puedes modificar tu propia cuenta");
  }

  return cuenta;
}
