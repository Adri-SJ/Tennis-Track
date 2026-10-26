"use server";

import { revalidatePath } from "next/cache";
import { getAlumnosDeGrupo } from "@/lib/api";
import {
  ESTADOS_ASISTENCIA,
  guardarAsistencias,
  type EstadoAsistencia,
} from "@/lib/asistencias";
import { esFecha } from "@/lib/formulario";

export async function guardarPaseDeLista(
  grupoId: string,
  fecha: string,
  marcas: Record<string, EstadoAsistencia | null>
): Promise<{ error: string | null }> {
  if (!grupoId || !esFecha(fecha)) {
    return { error: "Elige un grupo y una fecha." };
  }

  try {
    const alumnos = await getAlumnosDeGrupo(grupoId);
    const nombres = Object.fromEntries(
      alumnos.map((alumno) => [alumno.id, alumno.nombre])
    );

    /* Solo se aceptan alumnos inscritos en el grupo. */
    const validas = Object.fromEntries(
      Object.entries(marcas).filter(
        ([alumnoId, estado]) =>
          alumnoId in nombres &&
          (estado === null || ESTADOS_ASISTENCIA.includes(estado))
      )
    );

    await guardarAsistencias({ grupoId, fecha, marcas: validas, nombres });
  } catch (error) {
    console.error("No se pudo guardar la asistencia en Twenty:", error);

    return {
      error:
        "No se pudo guardar la asistencia en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidatePath("/asistencia");

  return { error: null };
}
