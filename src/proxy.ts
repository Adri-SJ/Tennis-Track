import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, opcionesCookie, renovarToken } from "@/lib/auth/jwt";

/*
  Verificación optimista: solo revisa la firma del JWT. La revisión
  real (cuenta activa y rol) la hacen las páginas, las Server Actions
  y la API contra la base. La API responde sus propios 401 en JSON.

  Cada página o acción con sesión válida renueva la cookie otros 30
  minutos: así la sesión solo vence por inactividad.
*/

/* Rutas de la API que cuentan como actividad (el latido de la app). */
const API_QUE_RENUEVA = ["/api/auth/yo"];

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const renovado = await renovarToken(request.cookies.get(COOKIE_SESION)?.value);

  const conRenovacion = (respuesta: NextResponse) => {
    if (renovado) {
      respuesta.cookies.set(COOKIE_SESION, renovado, opcionesCookie);
    }

    return respuesta;
  };

  if (pathname.startsWith("/api/")) {
    return API_QUE_RENUEVA.includes(pathname)
      ? conRenovacion(NextResponse.next())
      : NextResponse.next();
  }

  if (pathname === "/login") {
    return renovado
      ? NextResponse.redirect(new URL("/", request.nextUrl))
      : NextResponse.next();
  }

  if (!renovado) {
    const url = new URL("/login", request.nextUrl);

    if (pathname !== "/") {
      url.searchParams.set("desde", `${pathname}${search}`);
    }

    return NextResponse.redirect(url);
  }

  /* AppLayout usa la ruta para decidir si el rol puede ver la página. */
  const headers = new Headers(request.headers);

  headers.set("x-ruta", pathname);

  return conRenovacion(NextResponse.next({ request: { headers } }));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[a-z0-9]+$).*)"],
};
