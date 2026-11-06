import type { NextRequest } from "next/server";
import { getGrupos } from "@/lib/api";
import { db } from "@/lib/auth/db";
import { ErrorHttp, leerJson, manejarErrores } from "@/lib/auth/errores";
import { cuentaGestionable } from "@/lib/auth/gestion";
import { requiereRol } from "@/lib/auth/servidor";
import { esquemaGruposEntrenador } from "@/lib/auth/validacion";

/* Reemplaza los grupos asignados a un entrenador. */
export const PUT = manejarErrores(
  async (request: NextRequest, ctx: RouteContext<"/api/usuarios/[id]/grupos">) => {
    const actor = await requiereRol("admin");
    const { grupos } = esquemaGruposEntrenador.parse(await leerJson(request));
    const cuenta = await cuentaGestionable(actor, (await ctx.params).id);

    if (cuenta.rol !== "entrenador") {
      throw new ErrorHttp(409, "Solo los entrenadores tienen grupos asignados");
    }

    const existentes = new Set((await getGrupos()).map((grupo) => grupo.id));

    if (grupos.some((grupo) => !existentes.has(grupo))) {
      throw new ErrorHttp(400, "Uno de los grupos ya no existe");
    }

    const cliente = await db().connect();

    try {
      await cliente.query("BEGIN");
      await cliente.query(
        "DELETE FROM grupos_entrenadores WHERE usuario_id = $1",
        [cuenta.id]
      );
      await cliente.query(
        `INSERT INTO grupos_entrenadores (usuario_id, grupo_id)
         SELECT $1, unnest($2::text[])
         ON CONFLICT DO NOTHING`,
        [cuenta.id, grupos]
      );
      await cliente.query("COMMIT");
    } catch (error) {
      await cliente.query("ROLLBACK");
      throw error;
    } finally {
      cliente.release();
    }

    return Response.json({ ok: true });
  }
);
