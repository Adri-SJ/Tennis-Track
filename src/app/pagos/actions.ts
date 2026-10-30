"use server";

import { autorizarAccion } from "@/lib/auth/servidor";
import { revalidatePath } from "next/cache";
import { esFecha, hoy } from "@/lib/formulario";
import {
  cancelarMensualidad,
  createMensualidad,
  getMensualidades,
  LISTA_METODOS,
  registrarPago,
  type NuevaMensualidad,
  type NuevoPago,
} from "@/lib/pagos";

type Resultado = { error: string | null };

export async function crearMensualidad(
  datos: NuevaMensualidad
): Promise<Resultado> {
  const sinPermiso = await autorizarAccion("/pagos");

  if (sinPermiso) {
    return { error: sinPermiso };
  }

  if (!datos.alumnoId) {
    return { error: "Elige un alumno." };
  }

  if (!/^\d{4}-\d{2}-01$/.test(datos.periodo)) {
    return { error: "Elige el mes de la mensualidad." };
  }

  if (!Number.isFinite(datos.monto) || datos.monto <= 0) {
    return { error: "El importe debe ser mayor que 0." };
  }

  if (!esFecha(datos.vencimiento)) {
    return { error: "Elige la fecha de vencimiento." };
  }

  try {
    const existentes = await getMensualidades();

    const duplicada = existentes.some(
      (item) =>
        item.alumnoId === datos.alumnoId &&
        item.periodo === datos.periodo &&
        item.estado !== "Cancelado"
    );

    if (duplicada) {
      return { error: "Ese alumno ya tiene una mensualidad para ese mes." };
    }

    await createMensualidad(datos);
  } catch (error) {
    console.error("No se pudo crear la mensualidad en Twenty:", error);

    return {
      error:
        "No se pudo guardar la mensualidad en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidatePath("/pagos");

  return { error: null };
}

export async function guardarPago(
  mensualidadId: string,
  pago: NuevoPago
): Promise<Resultado> {
  const sinPermiso = await autorizarAccion("/pagos");

  if (sinPermiso) {
    return { error: sinPermiso };
  }

  if (!esFecha(pago.fecha) || pago.fecha > hoy()) {
    return { error: "Elige una fecha de pago válida (no futura)." };
  }

  if (!LISTA_METODOS.includes(pago.metodo)) {
    return { error: "Elige el método de pago." };
  }

  try {
    const mensualidad = (await getMensualidades()).find(
      (item) => item.id === mensualidadId
    );

    if (!mensualidad) {
      return { error: "La mensualidad ya no existe." };
    }

    if (mensualidad.estado === "Pagado" || mensualidad.estado === "Cancelado") {
      return { error: "Esta mensualidad ya no tiene saldo pendiente." };
    }

    await registrarPago(mensualidad, {
      ...pago,
      referencia: pago.referencia.trim(),
    });
  } catch (error) {
    console.error("No se pudo registrar el pago en Twenty:", error);

    return {
      error:
        "No se pudo registrar el pago en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidatePath("/pagos");

  return { error: null };
}

export async function anularMensualidad(id: string): Promise<Resultado> {
  const sinPermiso = await autorizarAccion("/pagos");

  if (sinPermiso) {
    return { error: sinPermiso };
  }

  try {
    await cancelarMensualidad(id);
  } catch (error) {
    console.error("No se pudo cancelar la mensualidad en Twenty:", error);

    return { error: "No se pudo cancelar la mensualidad en Twenty." };
  }

  revalidatePath("/pagos");

  return { error: null };
}
