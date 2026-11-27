/*
  Roles y qué puede ver cada uno. Se usa en el servidor (páginas,
  Server Actions, API) y en el cliente (menú), así que no importa
  nada de servidor.

  El administrador entra a todo. El superadministrador puede lo mismo
  y además no aparece ante los administradores normales: no ven su
  cuenta ni pueden modificarla ni asignar ese rol. El entrenador solo consulta sus
  grupos y alumnos, pasa lista, evalúa a sus alumnos y ve el
  inventario, donde puede solicitar material; qué grupos son suyos se
  revisa en cada página.
*/

export const ROLES = ["entrenador", "admin", "superadmin"] as const;

export type Rol = (typeof ROLES)[number];

export const NOMBRE_ROL: Record<Rol, string> = {
  entrenador: "Entrenador",
  admin: "Administrador",
  superadmin: "Superadministrador",
};

const RUTAS_ENTRENADOR = [
  /^\/(alumnos|grupos)(\/(?!nuevo$)[^/]+)?$/,
  /^\/horario$/,
  /^\/asistencia$/,
  /^\/desarrollo$/,
  /^\/inventario$/,
];

export function esAdministrador(rol: Rol | null): boolean {
  return rol === "admin" || rol === "superadmin";
}

export function esSuperadmin(rol: Rol | null): boolean {
  return rol === "superadmin";
}

/* Roles que puede dar quien gestiona cuentas. */
export function rolesAsignables(rol: Rol | null): Rol[] {
  return esSuperadmin(rol) ? [...ROLES] : ["entrenador", "admin"];
}

export function puedeVer(rol: Rol | null, ruta: string): boolean {
  if (!rol) {
    return false;
  }

  return (
    esAdministrador(rol) ||
    RUTAS_ENTRENADOR.some((patron) => patron.test(ruta))
  );
}
