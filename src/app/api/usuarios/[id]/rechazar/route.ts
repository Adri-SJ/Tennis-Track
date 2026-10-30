import type { NextRequest } from "next/server";
import { db } from "@/lib/auth/db";
import { ErrorHttp, manejarErrores } from "@/lib/auth/errores";
import { cuentaGestionable } from "@/lib/auth/gestion";
import { requiereRol } from "@/lib/auth/servidor";

export const POST = manejarErrores(
  async (_request: NextRequest, ctx: RouteContext<"/api/usuarios/[id]/rechazar">) => {
    const actor = await requiereRol("admin");
    const cuenta = await cuentaGestionable(actor, (await ctx.params).id);

    if (cuenta.estado !== "pendiente") {
      throw new ErrorHttp(409, "Esta cuenta ya no está pendiente");
    }

    await db().query(
      "UPDATE usuarios SET estado = 'rechazado' WHERE id = $1",
      [cuenta.id]
    );

    return Response.json({ ok: true });
  }
);
