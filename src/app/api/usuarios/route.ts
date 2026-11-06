import { getGrupos } from "@/lib/api";
import { db } from "@/lib/auth/db";
import { manejarErrores } from "@/lib/auth/errores";
import { requiereRol } from "@/lib/auth/servidor";
import { ROLES } from "@/lib/permisos";

/* Pendientes primero; después, las más recientes. */
export const GET = manejarErrores(async () => {
  const actor = await requiereRol("admin");

  const [{ rows }, grupos] = await Promise.all([
    db().query(
      `SELECT u.id, u.nombre, u.correo, u.rol, u.estado,
              u.creado_en, u.aprobado_en,
              a.nombre AS aprobado_por,
              COALESCE(
                array_agg(g.grupo_id) FILTER (WHERE g.grupo_id IS NOT NULL),
                '{}'
              ) AS grupos
         FROM usuarios u
         LEFT JOIN usuarios a ON a.id = u.aprobado_por
         LEFT JOIN grupos_entrenadores g ON g.usuario_id = u.id
        GROUP BY u.id, a.nombre
        ORDER BY (u.estado = 'pendiente') DESC, u.creado_en DESC`
    ),
    /* Sin Twenty la pantalla sigue sirviendo para aprobar cuentas. */
    getGrupos().catch(() => []),
  ]);

  return Response.json({
    usuarios: rows,
    roles_asignables: ROLES,
    grupos_disponibles: grupos
      .filter((grupo) => grupo.nombre)
      .map(({ id, nombre }) => ({ id, nombre })),
    yo: actor.id,
  });
});
