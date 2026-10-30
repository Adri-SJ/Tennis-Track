/*
  Roles y qué puede ver cada uno. Se usa en el servidor (páginas,
  Server Actions, API) y en el cliente (menú), así que no importa
  nada de servidor.

  Admin y superadmin entran a todo; este mapa solo define a los
  demás roles. Ajustarlo aquí cuando el cliente confirme los permisos.
*/

export const ROLES = ["entrenador", "recepcion", "admin", "superadmin"] as const;

export type Rol = (typeof ROLES)[number];

export const NOMBRE_ROL: Record<Rol, string> = {
  entrenador: "Entrenador",
  recepcion: "Recepción",
  admin: "Administrador",
  superadmin: "Superadministrador",
};

/* Roles que el admin puede asignar; el superadmin además asigna admin. */
export const ROLES_ASIGNABLES_ADMIN: Rol[] = ["entrenador", "recepcion"];
export const ROLES_ASIGNABLES_SUPERADMIN: Rol[] = [
  "entrenador",
  "recepcion",
  "admin",
];

type Regla = { patron: RegExp; roles: Rol[] };

/* Se evalúan en orden; gana la primera que coincide. */
const REGLAS: Regla[] = [
  // Altas y ediciones de alumnos y grupos: solo recepción.
  {
    patron: /^\/(alumnos|grupos)\/(nuevo|[^/]+\/(editar|cambiar-grupo))$/,
    roles: ["recepcion"],
  },
  { patron: /^\/$/, roles: ["entrenador", "recepcion"] },
  { patron: /^\/alumnos(\/|$)/, roles: ["entrenador", "recepcion"] },
  { patron: /^\/grupos(\/|$)/, roles: ["entrenador", "recepcion"] },
  { patron: /^\/horario(\/|$)/, roles: ["entrenador", "recepcion"] },
  { patron: /^\/inscripciones(\/|$)/, roles: ["recepcion"] },
  { patron: /^\/asistencia(\/|$)/, roles: ["entrenador"] },
  { patron: /^\/desarrollo(\/|$)/, roles: ["entrenador"] },
  { patron: /^\/pagos(\/|$)/, roles: ["recepcion"] },
  { patron: /^\/prospectos(\/|$)/, roles: ["recepcion"] },
  { patron: /^\/inventario(\/|$)/, roles: ["recepcion"] },
  { patron: /^\/cuentas(\/|$)/, roles: [] },
];

export function esAdministrador(rol: Rol | null): boolean {
  return rol === "admin" || rol === "superadmin";
}

export function puedeVer(rol: Rol | null, ruta: string): boolean {
  if (!rol) {
    return false;
  }

  if (esAdministrador(rol)) {
    return true;
  }

  const regla = REGLAS.find(({ patron }) => patron.test(ruta));

  return regla ? regla.roles.includes(rol) : false;
}
