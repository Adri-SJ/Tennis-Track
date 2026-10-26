"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAlumno } from "@/lib/api";

export type EstadoFormulario = {
  error: string | null;
};

export async function crearAlumno(
  _estadoPrevio: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
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

  let id: string;

  try {
    const alumno = await createAlumno({
      nombres,
      apellidos,
      edad,
      estatura,
      manoHabil,
      estado,
    });

    id = alumno.id;
  } catch (error) {
    console.error("No se pudo crear el alumno en Twenty:", error);

    return {
      error:
        "No se pudo guardar el alumno en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidatePath("/alumnos");
  revalidatePath("/");

  redirect(`/alumnos/${id}`);
}
