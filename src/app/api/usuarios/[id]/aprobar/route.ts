import type { NextRequest } from "next/server";
import { db } from "@/lib/auth/db";
import { ErrorHttp, leerJson, manejarErrores } from "@/lib/auth/errores";
import { cuentaGestionable } from "@/lib/auth/gestion";
import { requiereRol } from "@/lib/auth/servidor";
import { esquemaAprobar } from "@/lib/auth/validacion";

export const POST = manejarErrores(
  async (request: NextRequest, ctx: RouteContext<"/api/usuarios/[id]/aprobar">) => {
    const actor = await requiereRol("admin");
    const { rol } = esquemaAprobar.parse(await leerJson(request));
    const cuenta = await cuentaGestionable(actor, (await ctx.params).id, rol);

    if (cuenta.estado !== "pendiente") {
      throw new ErrorHttp(409, "Esta cuenta ya no está pendiente");
    }

    await db().query(
      `UPDATE usuarios
          SET estado = 'activo', rol = $1, aprobado_por = $2, aprobado_en = now()
        WHERE id = $3`,
      [rol, actor.id, cuenta.id]
    );

    return Response.json({ ok: true });
  }
);
