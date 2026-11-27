import { getGrupos } from "@/lib/api";
import { db } from "@/lib/auth/db";
import { manejarErrores } from "@/lib/auth/errores";
import { requiereRol } from "@/lib/auth/servidor";
import { esSuperadmin, rolesAsignables } from "@/lib/permisos";

/*
  Pendientes primero; después, las más recientes. Un administrador
  normal no ve a los superadministradores, ni como "aprobado por".
*/
export const GET = manejarErrores(async () => {
  const actor = await requiereRol("admin");
  const veTodo = esSuperadmin(actor.rol);

  const [{ rows }, grupos] = await Promise.all([
    db().query(
      `SELECT u.id, u.nombre, u.correo, u.rol, u.estado,
              u.creado_en, u.aprobado_en,
              CASE WHEN a.rol = 'superadmin' AND NOT $1 THEN NULL
                   ELSE a.nombre END AS aprobado_por,
              COALESCE(
                array_agg(g.grupo_id) FILTER (WHERE g.grupo_id IS NOT NULL),
                '{}'
              ) AS grupos
         FROM usuarios u
         LEFT JOIN usuarios a ON a.id = u.aprobado_por
         LEFT JOIN grupos_entrenadores g ON g.usuario_id = u.id
        WHERE $1 OR u.rol IS DISTINCT FROM 'superadmin'
        GROUP BY u.id, a.nombre, a.rol
        ORDER BY (u.estado = 'pendiente') DESC, u.creado_en DESC`,
      [veTodo]
    ),
    /* Sin Twenty la pantalla sigue sirviendo para aprobar cuentas. */
    getGrupos().catch(() => []),
  ]);

  return Response.json({
    usuarios: rows,
    roles_asignables: rolesAsignables(actor.rol),
    grupos_disponibles: grupos
      .filter((grupo) => grupo.nombre)
      .map(({ id, nombre }) => ({ id, nombre })),
    yo: actor.id,
  });
});
