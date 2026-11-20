import "server-only";
import { getInscripciones } from "@/lib/api";

/*
  Alumnos que puede ver quien tiene acceso a estos grupos: los que
  tienen una inscripción activa en alguno. null significa todos.
*/
export async function alumnosPermitidos(
  grupos: Set<string> | null
): Promise<Set<string> | null> {
  if (!grupos) {
    return null;
  }

  const inscripciones = await getInscripciones();

  return new Set(
    inscripciones
      .filter(
        (inscripcion) =>
          inscripcion.estado === "Activa" &&
          inscripcion.grupo !== null &&
          grupos.has(inscripcion.grupo.id)
      )
      .flatMap((inscripcion) =>
        inscripcion.alumnos.map((alumno) => alumno.id)
      )
  );
}
