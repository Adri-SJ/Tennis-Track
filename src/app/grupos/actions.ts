"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createGrupo,
  getCantidadAlumnosDeGrupo,
  updateGrupo,
  type NuevoGrupo,
} from "@/lib/api";
import type { EstadoFormulario } from "@/lib/formulario";
import type { DiaEntrenamiento, NivelGrupo } from "@/lib/types";

const DIAS: DiaEntrenamiento[] = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
];

const NIVELES: NivelGrupo[] = ["Principiante", "Intermedio", "Avanzado"];

function leerGrupo(
  formData: FormData
): NuevoGrupo | EstadoFormulario {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const dias = formData
    .getAll("dias")
    .map(String)
    .filter((dia): dia is DiaEntrenamiento =>
      DIAS.includes(dia as DiaEntrenamiento)
    )
    .sort((a, b) => DIAS.indexOf(a) - DIAS.indexOf(b));
  const horaInicio = String(formData.get("horaInicio") ?? "");
  const horaFin = String(formData.get("horaFin") ?? "");
  const nivel = String(formData.get("nivel") ?? "");
  const capacidadTexto = String(formData.get("capacidadMaxima") ?? "").trim();
  const estado = formData.get("estado");

  if (!nombre) {
    return { error: "Escribe el nombre del grupo." };
  }

  if (dias.length === 0) {
    return { error: "Elige al menos un día de entrenamiento." };
  }

  if (!/^\d{2}:\d{2}$/.test(horaInicio) || !/^\d{2}:\d{2}$/.test(horaFin)) {
    return { error: "Escribe la hora de inicio y la de fin." };
  }

  if (horaFin <= horaInicio) {
    return { error: "La hora de fin debe ser posterior a la de inicio." };
  }

  if (nivel && !NIVELES.includes(nivel as NivelGrupo)) {
    return { error: "Elige un nivel válido." };
  }

  const capacidadMaxima = capacidadTexto ? Number(capacidadTexto) : null;

  if (
    capacidadMaxima !== null &&
    (!Number.isInteger(capacidadMaxima) || capacidadMaxima < 1)
  ) {
    return { error: "La capacidad máxima debe ser un número entero mayor que 0." };
  }

  if (estado !== "Activo" && estado !== "Inactivo") {
    return { error: "Elige el estado del grupo." };
  }

  return {
    nombre,
    dias,
    horaInicio,
    horaFin,
    nivel: nivel ? (nivel as NivelGrupo) : null,
    capacidadMaxima,
    estado,
  };
}

export async function crearGrupo(
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const datos = leerGrupo(formData);

  if ("error" in datos) {
    return datos;
  }

  let id: string;

  try {
    const grupo = await createGrupo(datos);

    id = grupo.id;
  } catch (error) {
    console.error("No se pudo crear el grupo en Twenty:", error);

    return {
      error:
        "No se pudo guardar el grupo en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidatePath("/", "layout");

  redirect(`/grupos/${id}`);
}

export async function actualizarGrupo(
  id: string,
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const datos = leerGrupo(formData);

  if ("error" in datos) {
    return datos;
  }

  try {
    if (datos.capacidadMaxima !== null) {
      const inscritos = await getCantidadAlumnosDeGrupo(id);

      if (datos.capacidadMaxima < inscritos) {
        return {
          error: `El grupo ya tiene ${inscritos} alumnos inscritos; la capacidad no puede ser menor.`,
        };
      }
    }

    await updateGrupo(id, datos);
  } catch (error) {
    console.error("No se pudo actualizar el grupo en Twenty:", error);

    return {
      error:
        "No se pudieron guardar los cambios en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidatePath("/", "layout");

  redirect(`/grupos/${id}`);
}
