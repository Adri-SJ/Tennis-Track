import "server-only";
import { db } from "@/lib/auth/db";

export type EstadoSolicitud = "pendiente" | "aprobada" | "rechazada";

export type Solicitud = {
  id: number;
  entrenador: string;
  materialId: string;
  material: string;
  cantidad: number;
  nota: string;
  estado: EstadoSolicitud;
  creadaEn: string;
};

type FilaSolicitud = {
  id: number;
  entrenador: string;
  articulo_id: string;
  articulo_nombre: string;
  cantidad: number;
  nota: string;
  estado: EstadoSolicitud;
  creada_en: Date;
};

/* Sin usuarioId devuelve las de todos, primero las pendientes. */
export async function getSolicitudes(
  usuarioId: number | null
): Promise<Solicitud[]> {
  const { rows } = await db().query<FilaSolicitud>(
    `SELECT s.id, u.nombre AS entrenador, s.articulo_id, s.articulo_nombre,
            s.cantidad, s.nota, s.estado, s.creada_en
       FROM solicitudes_material s
       JOIN usuarios u ON u.id = s.usuario_id
      WHERE $1::integer IS NULL OR s.usuario_id = $1
      ORDER BY (s.estado = 'pendiente') DESC, s.creada_en DESC
      LIMIT 50`,
    [usuarioId]
  );

  return rows.map((fila) => ({
    id: fila.id,
    entrenador: fila.entrenador,
    materialId: fila.articulo_id,
    material: fila.articulo_nombre,
    cantidad: fila.cantidad,
    nota: fila.nota,
    estado: fila.estado,
    creadaEn: fila.creada_en.toISOString(),
  }));
}

export async function crearSolicitud(datos: {
  usuarioId: number;
  materialId: string;
  material: string;
  cantidad: number;
  nota: string;
}): Promise<void> {
  await db().query(
    `INSERT INTO solicitudes_material
       (usuario_id, articulo_id, articulo_nombre, cantidad, nota)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      datos.usuarioId,
      datos.materialId,
      datos.material,
      datos.cantidad,
      datos.nota,
    ]
  );
}

/*
  Pasa la solicitud de pendiente a su resolución. Devuelve null si
  ya estaba resuelta, para no descontar el material dos veces.
*/
export async function resolverSolicitud(
  id: number,
  estado: "aprobada" | "rechazada",
  adminId: number
): Promise<Solicitud | null> {
  const { rows } = await db().query<{ id: number }>(
    `UPDATE solicitudes_material
        SET estado = $1, resuelta_por = $2, resuelta_en = now()
      WHERE id = $3 AND estado = 'pendiente'
      RETURNING id`,
    [estado, adminId, id]
  );

  if (!rows[0]) {
    return null;
  }

  const todas = await getSolicitudes(null);

  return todas.find((solicitud) => solicitud.id === id) ?? null;
}

/* Si el movimiento falla, la solicitud vuelve a quedar pendiente. */
export async function reabrirSolicitud(id: number): Promise<void> {
  await db().query(
    `UPDATE solicitudes_material
        SET estado = 'pendiente', resuelta_por = NULL, resuelta_en = NULL
      WHERE id = $1`,
    [id]
  );
}
