import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { puedeVer, type Rol } from "@/lib/permisos";
import { db } from "./db";
import { ErrorHttp } from "./errores";
import { COOKIE_SESION, leerToken } from "./jwt";

export type UsuarioSesion = {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
};

/*
  Verifica el JWT de la cookie y relee al usuario en la base: la
  sesión deja de valer en cuanto la cuenta se desactiva. Sin roles
  basta con estar activo; el superadmin pasa cualquier verificación.
*/
export async function requiereRol(...roles: Rol[]): Promise<UsuarioSesion> {
  const cookieStore = await cookies();
  const id = await leerToken(cookieStore.get(COOKIE_SESION)?.value);

  if (id === null) {
    throw new ErrorHttp(401, "Sesión no válida, vuelve a iniciar sesión");
  }

  const { rows } = await db().query<UsuarioSesion>(
    `SELECT id, nombre, correo, rol FROM usuarios
      WHERE id = $1 AND estado = 'activo'`,
    [id]
  );

  const usuario = rows[0];

  if (!usuario) {
    throw new ErrorHttp(401, "Tu cuenta ya no está activa");
  }

  if (
    roles.length > 0 &&
    usuario.rol !== "superadmin" &&
    !roles.includes(usuario.rol)
  ) {
    throw new ErrorHttp(403, "No tienes permiso para esta acción");
  }

  return usuario;
}

/* Sin sesión válida: borra la cookie y regresa al login. */
function irALogin(desde: string): never {
  redirect(`/api/auth/salir?desde=${encodeURIComponent(desde)}`);
}

/*
  Para páginas: devuelve el usuario y si su rol puede ver la ruta.
  Sin sesión válida redirige al login.
*/
export async function usuarioDePagina(
  ruta: string
): Promise<{ usuario: UsuarioSesion; permitido: boolean }> {
  try {
    const usuario = await requiereRol();

    return { usuario, permitido: puedeVer(usuario.rol, ruta) };
  } catch (error) {
    if (error instanceof ErrorHttp && error.status === 401) {
      irALogin(ruta);
    }

    throw error;
  }
}

/*
  Para Server Actions: devuelve un mensaje de error si el rol no
  puede usar el módulo de la ruta, o null si puede.
*/
export async function autorizarAccion(ruta: string): Promise<string | null> {
  try {
    const usuario = await requiereRol();

    return puedeVer(usuario.rol, ruta)
      ? null
      : "No tienes permiso para esta acción";
  } catch (error) {
    if (error instanceof ErrorHttp && error.status === 401) {
      irALogin(ruta);
    }

    throw error;
  }
}
