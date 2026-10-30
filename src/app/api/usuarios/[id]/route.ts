import type { NextRequest } from "next/server";
import { db } from "@/lib/auth/db";
import { ErrorHttp, leerJson, manejarErrores } from "@/lib/auth/errores";
import { cuentaGestionable } from "@/lib/auth/gestion";
import { requiereRol } from "@/lib/auth/servidor";
import { esquemaActualizarUsuario } from "@/lib/auth/validacion";

/* Cambia el rol o activa/desactiva una cuenta ya aprobada. */
export const PATCH = manejarErrores(
  async (request: NextRequest, ctx: RouteContext<"/api/usuarios/[id]">) => {
    const actor = await requiereRol("admin");
    const { rol, estado } = esquemaActualizarUsuario.parse(
      await leerJson(request)
    );
    const cuenta = await cuentaGestionable(actor, (await ctx.params).id, rol);

    if (cuenta.estado !== "activo" && cuenta.estado !== "inactivo") {
      throw new ErrorHttp(409, "Primero aprueba o rechaza esta cuenta");
    }

    await db().query(
      `UPDATE usuarios
          SET rol = COALESCE($1, rol), estado = COALESCE($2, estado)
        WHERE id = $3`,
      [rol ?? null, estado ?? null, cuenta.id]
    );

    return Response.json({ ok: true });
  }
);
