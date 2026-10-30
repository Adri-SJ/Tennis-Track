import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, leerToken } from "@/lib/auth/jwt";

/*
  Verificación optimista: solo revisa la firma del JWT. La revisión
  real (cuenta activa y rol) la hacen las páginas, las Server Actions
  y la API contra la base. La API responde sus propios 401 en JSON.
*/
export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const conSesion =
    (await leerToken(request.cookies.get(COOKIE_SESION)?.value)) !== null;

  if (pathname === "/login") {
    return conSesion
      ? NextResponse.redirect(new URL("/", request.nextUrl))
      : NextResponse.next();
  }

  if (!conSesion) {
    const url = new URL("/login", request.nextUrl);

    if (pathname !== "/") {
      url.searchParams.set("desde", `${pathname}${search}`);
    }

    return NextResponse.redirect(url);
  }

  /* AppLayout usa la ruta para decidir si el rol puede ver la página. */
  const headers = new Headers(request.headers);

  headers.set("x-ruta", pathname);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[a-z0-9]+$).*)"],
};
