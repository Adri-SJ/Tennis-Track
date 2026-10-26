"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  cambiarGrupoDeAlumno,
  createAlumno,
  getGrupoById,
  getInscripcionActivaDeAlumno,
  updateAlumno,
  type NuevoAlumno,
} from "@/lib/api";
import { esFecha, type EstadoFormulario } from "@/lib/formulario";

function leerAlumno(
  formData: FormData
): NuevoAlumno | EstadoFormulario {
  const nombres = String(formData.get("nombres") ?? "").trim();
  const apellidos = String(formData.get("apellidos") ?? "").trim();
  const edad = Number(formData.get("edad"));
  const estatura = Number(formData.get("estatura"));
  const manoHabil = formData.get("manoHabil");
  const estado = formData.get("estado");

  if (!nombres || !apellidos) {
    return { error: "Escribe el nombre y los apellidos del alumno." };
  }

  if (!Number.isInteger(edad) || edad < 1 || edad > 120) {
    return { error: "La edad debe ser un número entero entre 1 y 120." };
  }

  if (!Number.isFinite(estatura) || estatura < 50 || estatura > 250) {
    return { error: "La estatura debe estar entre 50 y 250 cm." };
  }

  if (manoHabil !== "Derecha" && manoHabil !== "Izquierda") {
    return { error: "Elige la mano hábil." };
  }

  if (estado !== "Activo" && estado !== "Inactivo") {
    return { error: "Elige el estado del alumno." };
  }

  return { nombres, apellidos, edad, estatura, manoHabil, estado };
}

function revalidarTodo() {
  revalidatePath("/", "layout");
}

export async function crearAlumno(
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const datos = leerAlumno(formData);

  if ("error" in datos) {
    return datos;
  }

  let id: string;

  try {
    const alumno = await createAlumno(datos);

    id = alumno.id;
  } catch (error) {
    console.error("No se pudo crear el alumno en Twenty:", error);

    return {
      error:
        "No se pudo guardar el alumno en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidarTodo();

  redirect(`/alumnos/${id}`);
}

export async function actualizarAlumno(
  id: string,
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const datos = leerAlumno(formData);

  if ("error" in datos) {
    return datos;
  }

  try {
    await updateAlumno(id, datos);
  } catch (error) {
    console.error("No se pudo actualizar el alumno en Twenty:", error);

    return {
      error:
        "No se pudieron guardar los cambios en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidarTodo();

  redirect(`/alumnos/${id}`);
}

export async function cambiarDeGrupo(
  alumnoId: string,
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const grupoId = String(formData.get("grupoId") ?? "");
  const fecha = String(formData.get("fecha") ?? "");

  if (!grupoId) {
    return { error: "Elige el grupo nuevo." };
  }

  if (!esFecha(fecha)) {
    return { error: "Elige la fecha del cambio." };
  }

  try {
    const [grupo, actual] = await Promise.all([
      getGrupoById(grupoId),
      getInscripcionActivaDeAlumno(alumnoId),
    ]);

    if (!grupo) {
      return { error: "El grupo elegido ya no existe." };
    }

    if (actual?.grupo?.id === grupoId) {
      return { error: "El alumno ya está en ese grupo." };
    }

    if (
      actual &&
      actual.fechaInicio !== "—" &&
      fecha < actual.fechaInicio
    ) {
      return {
        error: `La fecha del cambio no puede ser anterior al inicio de la inscripción actual (${actual.fechaInicio}).`,
      };
    }

    await cambiarGrupoDeAlumno(alumnoId, grupoId, fecha);
  } catch (error) {
    console.error("No se pudo cambiar de grupo en Twenty:", error);

    return {
      error:
        "No se pudo cambiar de grupo en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidarTodo();

  redirect(`/alumnos/${alumnoId}`);
}
