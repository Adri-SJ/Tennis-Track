import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { COOKIE_SESION } from "@/lib/auth/jwt";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_SESION);

  return Response.json({ ok: true });
}

/*
  Lo usa el servidor cuando la sesión ya no vale (cuenta desactivada,
  token vencido): borra la cookie y lleva al login.
*/
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const desde = request.nextUrl.searchParams.get("desde") ?? "";

  cookieStore.delete(COOKIE_SESION);

  redirect(
    desde.startsWith("/") && !desde.startsWith("//") && desde !== "/"
      ? `/login?desde=${encodeURIComponent(desde)}`
      : "/login"
  );
}
