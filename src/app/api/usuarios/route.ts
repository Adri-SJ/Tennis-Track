import { db } from "@/lib/auth/db";
import { manejarErrores } from "@/lib/auth/errores";
import { rolesAsignables } from "@/lib/auth/gestion";
import { requiereRol } from "@/lib/auth/servidor";

/* Pendientes primero; después, las más recientes. */
export const GET = manejarErrores(async () => {
  const actor = await requiereRol("admin");

  const { rows } = await db().query(
    `SELECT u.id, u.nombre, u.correo, u.rol, u.estado,
            u.creado_en, u.aprobado_en,
            a.nombre AS aprobado_por
       FROM usuarios u
       LEFT JOIN usuarios a ON a.id = u.aprobado_por
      ORDER BY (u.estado = 'pendiente') DESC, u.creado_en DESC`
  );

  return Response.json({
    usuarios: rows,
    roles_asignables: rolesAsignables(actor),
    yo: actor.id,
  });
});
