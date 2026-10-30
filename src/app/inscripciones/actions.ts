"use server";

import { autorizarAccion } from "@/lib/auth/servidor";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createInscripcion,
  getCantidadAlumnosDeGrupo,
  getGrupoById,
  getInscripcionActivaDeAlumno,
  getInscripcionById,
  updateInscripcion,
} from "@/lib/api";
import { esFecha, type EstadoFormulario } from "@/lib/formulario";

function leerFechas(
  formData: FormData
): { fechaInicio: string; fechaFin: string | null } | EstadoFormulario {
  const fechaInicio = String(formData.get("fechaInicio") ?? "");
  const fechaFinTexto = String(formData.get("fechaFin") ?? "");

  if (!esFecha(fechaInicio)) {
    return { error: "Elige la fecha de inicio." };
  }

  const fechaFin = fechaFinTexto ? fechaFinTexto : null;

  if (fechaFin !== null && !esFecha(fechaFin)) {
    return { error: "La fecha de fin no es válida." };
  }

  if (fechaFin !== null && fechaFin < fechaInicio) {
    return { error: "La fecha de fin no puede ser anterior a la de inicio." };
  }

  return { fechaInicio, fechaFin };
}

export async function crearInscripcion(
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sinPermiso = await autorizarAccion("/inscripciones");

  if (sinPermiso) {
    return { error: sinPermiso };
  }

  const alumnoId = String(formData.get("alumnoId") ?? "");
  const grupoId = String(formData.get("grupoId") ?? "");
  const fechas = leerFechas(formData);

  if (!alumnoId) {
    return { error: "Elige un alumno." };
  }

  if (!grupoId) {
    return { error: "Elige un grupo." };
  }

  if ("error" in fechas) {
    return fechas;
  }

  let id: string;

  try {
    const [grupo, actual, inscritos] = await Promise.all([
      getGrupoById(grupoId),
      getInscripcionActivaDeAlumno(alumnoId),
      getCantidadAlumnosDeGrupo(grupoId),
    ]);

    if (!grupo) {
      return { error: "El grupo elegido ya no existe." };
    }

    if (grupo.estado === "Inactivo") {
      return { error: "El grupo está inactivo; actívalo antes de inscribir alumnos." };
    }

    if (actual) {
      return {
        error: `El alumno ya tiene una inscripción activa en ${
          actual.grupo?.nombre ?? "otro grupo"
        }. Usa «Cambiar de grupo» en su perfil.`,
      };
    }

    if (
      grupo.capacidadMaxima !== null &&
      inscritos >= grupo.capacidadMaxima
    ) {
      return {
        error: `El grupo está lleno (${inscritos} de ${grupo.capacidadMaxima} lugares).`,
      };
    }

    const inscripcion = await createInscripcion({
      alumnoId,
      grupoId,
      ...fechas,
      estado: "Activa",
    });

    id = inscripcion.id;
  } catch (error) {
    console.error("No se pudo crear la inscripción en Twenty:", error);

    return {
      error:
        "No se pudo guardar la inscripción en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidatePath("/", "layout");

  redirect(`/inscripciones/${id}`);
}

export async function actualizarInscripcion(
  id: string,
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sinPermiso = await autorizarAccion("/inscripciones");

  if (sinPermiso) {
    return { error: sinPermiso };
  }

  const fechas = leerFechas(formData);
  const estado = formData.get("estado");

  if ("error" in fechas) {
    return fechas;
  }

  if (estado !== "Activa" && estado !== "Inactiva") {
    return { error: "Elige el estado de la inscripción." };
  }

  try {
    const inscripcion = await getInscripcionById(id);

    if (!inscripcion) {
      return { error: "La inscripción ya no existe." };
    }

    /*
      Un alumno solo puede tener una inscripción activa.
      Reactivar una inscripción vieja no puede dejarlo
      en dos grupos a la vez.
    */
    if (estado === "Activa" && inscripcion.estado === "Inactiva") {
      const alumnoId = inscripcion.alumnos[0]?.id;
      const activa = alumnoId
        ? await getInscripcionActivaDeAlumno(alumnoId)
        : null;

      if (activa && activa.id !== id) {
        return {
          error: `El alumno ya tiene una inscripción activa en ${
            activa.grupo?.nombre ?? "otro grupo"
          }.`,
        };
      }
    }

    await updateInscripcion(id, { ...fechas, estado });
  } catch (error) {
    console.error("No se pudo actualizar la inscripción en Twenty:", error);

    return {
      error:
        "No se pudieron guardar los cambios en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidatePath("/", "layout");

  redirect(`/inscripciones/${id}`);
}
