import "server-only";
import {
  ROLES_ASIGNABLES_ADMIN,
  ROLES_ASIGNABLES_SUPERADMIN,
  type Rol,
} from "@/lib/permisos";
import { ErrorHttp } from "./errores";
import type { UsuarioSesion } from "./servidor";
import { buscarPorId, type UsuarioCompleto } from "./usuarios";

export function rolesAsignables(actor: UsuarioSesion): Rol[] {
  return actor.rol === "superadmin"
    ? ROLES_ASIGNABLES_SUPERADMIN
    : ROLES_ASIGNABLES_ADMIN;
}

/*
  Reglas de gestión: nadie se modifica a sí mismo, el superadmin es
  intocable y solo el superadmin modifica o asigna administradores.
*/
export async function cuentaGestionable(
  actor: UsuarioSesion,
  idTexto: string,
  nuevoRol?: Rol
): Promise<UsuarioCompleto> {
  const id = Number(idTexto);
  const cuenta = Number.isInteger(id) ? await buscarPorId(id) : null;

  if (!cuenta) {
    throw new ErrorHttp(404, "No existe esa cuenta");
  }

  if (cuenta.id === actor.id) {
    throw new ErrorHttp(403, "No puedes modificar tu propia cuenta");
  }

  if (cuenta.rol === "superadmin") {
    throw new ErrorHttp(403, "La cuenta del superadmin no se puede modificar");
  }

  if (cuenta.rol === "admin" && actor.rol !== "superadmin") {
    throw new ErrorHttp(
      403,
      "Solo el superadmin puede modificar a un administrador"
    );
  }

  if (nuevoRol && !rolesAsignables(actor).includes(nuevoRol)) {
    throw new ErrorHttp(403, "No puedes asignar ese rol");
  }

  return cuenta;
}
