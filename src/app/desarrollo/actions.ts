"use server";

import { alumnosPermitidos } from "@/lib/auth/alcance";
import {
  autorizarAccion,
  gruposPermitidos,
  requiereRol,
} from "@/lib/auth/servidor";
import { revalidatePath } from "next/cache";
import { getAlumnoById } from "@/lib/api";
import {
  createEvaluacion,
  deleteEvaluacion,
  getEvaluaciones,
  HABILIDADES,
  type Puntuaciones,
} from "@/lib/evaluaciones";
import { esFecha, hoy } from "@/lib/formulario";

/* El entrenador solo trabaja con los alumnos de sus grupos. */
async function alumnoFueraDeAlcance(alumnoId: string): Promise<boolean> {
  const visibles = await alumnosPermitidos(
    await gruposPermitidos(await requiereRol())
  );

  return visibles !== null && !visibles.has(alumnoId);
}

export async function guardarEvaluacion(datos: {
  alumnoId: string;
  fecha: string;
  puntuaciones: Puntuaciones;
  observaciones: string;
}): Promise<{ error: string | null }> {
  const sinPermiso = await autorizarAccion("/desarrollo");

  if (sinPermiso) {
    return { error: sinPermiso };
  }

  if (!esFecha(datos.fecha)) {
    return { error: "Selecciona una fecha." };
  }

  if (datos.fecha > hoy()) {
    return { error: "La evaluación no puede tener una fecha futura." };
  }

  const validas = HABILIDADES.every((habilidad) => {
    const valor = datos.puntuaciones[habilidad];
    return Number.isInteger(valor) && valor >= 1 && valor <= 10;
  });

  if (!validas) {
    return { error: "Cada habilidad debe calificarse del 1 al 10." };
  }

  try {
    if (await alumnoFueraDeAlcance(datos.alumnoId)) {
      return { error: "Solo puedes evaluar a los alumnos de tus grupos." };
    }

    const alumno = await getAlumnoById(datos.alumnoId);

    if (!alumno) {
      return { error: "Selecciona un alumno." };
    }

    await createEvaluacion(
      {
        alumnoId: alumno.id,
        fecha: datos.fecha,
        puntuaciones: datos.puntuaciones,
        observaciones: datos.observaciones.trim(),
      },
      alumno.nombre
    );
  } catch (error) {
    console.error("No se pudo guardar la evaluación en Twenty:", error);

    return {
      error:
        "No se pudo guardar la evaluación en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidatePath("/desarrollo");

  return { error: null };
}

export async function borrarEvaluacion(
  id: string
): Promise<{ error: string | null }> {
  const sinPermiso = await autorizarAccion("/desarrollo");

  if (sinPermiso) {
    return { error: sinPermiso };
  }

  try {
    const evaluacion = (await getEvaluaciones()).find(
      (item) => item.id === id
    );

    if (!evaluacion) {
      return { error: "Esa evaluación ya no existe." };
    }

    if (await alumnoFueraDeAlcance(evaluacion.alumnoId)) {
      return { error: "Solo puedes eliminar evaluaciones de tus alumnos." };
    }

    await deleteEvaluacion(id);
  } catch (error) {
    console.error("No se pudo eliminar la evaluación en Twenty:", error);

    return { error: "No se pudo eliminar la evaluación en Twenty." };
  }

  revalidatePath("/desarrollo");

  return { error: null };
}
