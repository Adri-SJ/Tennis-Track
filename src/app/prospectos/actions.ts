"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { esFecha } from "@/lib/formulario";
import {
  convertirProspectoEnAlumno,
  createProspecto,
  deleteProspecto,
  getProspectos,
  LISTA_ETAPAS,
  LISTA_ORIGENES,
  updateProspecto,
  type DatosProspecto,
  type Etapa,
} from "@/lib/prospectos";

type Resultado = { error: string | null };

function validar(datos: DatosProspecto): string | null {
  if (!datos.nombre.trim()) {
    return "Escribe el nombre del prospecto.";
  }

  if (!datos.telefono.trim()) {
    return "Escribe un teléfono de contacto.";
  }

  if (
    datos.correo.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())
  ) {
    return "El correo electrónico no es válido.";
  }

  if (!LISTA_ORIGENES.includes(datos.origen)) {
    return "Elige el medio de contacto.";
  }

  if (!LISTA_ETAPAS.includes(datos.etapa)) {
    return "Elige la etapa.";
  }

  if (datos.fechaClaseMuestra && !esFecha(datos.fechaClaseMuestra)) {
    return "La fecha de la clase de prueba no es válida.";
  }

  return null;
}

export async function guardarProspecto(
  id: string | null,
  datos: DatosProspecto
): Promise<Resultado> {
  const limpio: DatosProspecto = {
    ...datos,
    nombre: datos.nombre.trim(),
    telefono: datos.telefono.trim(),
    correo: datos.correo.trim(),
  };

  const error = validar(limpio);

  if (error) {
    return { error };
  }

  try {
    if (id) {
      await updateProspecto(id, limpio);
    } else {
      await createProspecto(limpio);
    }
  } catch (error) {
    console.error("No se pudo guardar el prospecto en Twenty:", error);

    return {
      error:
        "No se pudo guardar el prospecto en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidatePath("/prospectos");

  return { error: null };
}

export async function cambiarEtapaProspecto(
  id: string,
  etapa: Etapa
): Promise<Resultado> {
  if (!LISTA_ETAPAS.includes(etapa)) {
    return { error: "Etapa no válida." };
  }

  try {
    await updateProspecto(id, { etapa });
  } catch (error) {
    console.error("No se pudo cambiar la etapa en Twenty:", error);

    return { error: "No se pudo cambiar la etapa en Twenty." };
  }

  revalidatePath("/prospectos");

  return { error: null };
}

export async function eliminarProspecto(id: string): Promise<Resultado> {
  try {
    await deleteProspecto(id);
  } catch (error) {
    console.error("No se pudo eliminar el prospecto en Twenty:", error);

    return { error: "No se pudo eliminar el prospecto en Twenty." };
  }

  revalidatePath("/prospectos");

  return { error: null };
}

export async function convertirEnAlumno(id: string): Promise<Resultado> {
  let alumnoId: string;

  try {
    const prospecto = (await getProspectos()).find((item) => item.id === id);

    if (!prospecto) {
      return { error: "El prospecto ya no existe." };
    }

    if (prospecto.alumnoId) {
      return { error: "Este prospecto ya tiene un alumno en Twenty." };
    }

    alumnoId = await convertirProspectoEnAlumno(prospecto);
  } catch (error) {
    console.error("No se pudo crear el alumno desde el prospecto:", error);

    return {
      error: "No se pudo crear el alumno en Twenty. Inténtalo de nuevo.",
    };
  }

  revalidatePath("/", "layout");

  redirect(`/alumnos/${alumnoId}/editar`);
}
