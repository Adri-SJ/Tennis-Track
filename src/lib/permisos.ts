/*
  Roles y qué puede ver cada uno. Se usa en el servidor (páginas,
  Server Actions, API) y en el cliente (menú), así que no importa
  nada de servidor.

  El administrador entra a todo. El entrenador solo consulta sus
  grupos y alumnos, pasa lista y ve el inventario, donde puede
  solicitar material; qué grupos son suyos se revisa en cada página.
*/

export const ROLES = ["entrenador", "admin"] as const;

export type Rol = (typeof ROLES)[number];

export const NOMBRE_ROL: Record<Rol, string> = {
  entrenador: "Entrenador",
  admin: "Administrador",
};

const RUTAS_ENTRENADOR = [
  /^\/(alumnos|grupos)(\/(?!nuevo$)[^/]+)?$/,
  /^\/horario$/,
  /^\/asistencia$/,
  /^\/inventario$/,
];

export function esAdministrador(rol: Rol | null): boolean {
  return rol === "admin";
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
