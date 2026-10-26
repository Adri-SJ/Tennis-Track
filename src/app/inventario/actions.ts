"use server";

import { revalidatePath } from "next/cache";
import { esFecha, hoy } from "@/lib/formulario";
import {
  createMaterial,
  deleteMaterial,
  getMaterialById,
  LISTA_CATEGORIAS,
  LISTA_CONDICIONES,
  LISTA_TIPOS,
  registrarMovimiento,
  SUMAN,
  updateMaterial,
  type DatosMaterial,
  type TipoMovimiento,
} from "@/lib/inventario";

type Resultado = { error: string | null };

function validarMaterial(datos: DatosMaterial): string | null {
  if (!datos.nombre.trim()) {
    return "Escribe el nombre del material.";
  }

  if (!LISTA_CATEGORIAS.includes(datos.categoria)) {
    return "Elige una categoría.";
  }

  if (!Number.isInteger(datos.cantidad) || datos.cantidad < 0) {
    return "Las existencias deben ser un número entero de 0 o más.";
  }

  if (!Number.isInteger(datos.minimo) || datos.minimo < 0) {
    return "El mínimo debe ser un número entero de 0 o más.";
  }

  if (datos.condicion !== null && !LISTA_CONDICIONES.includes(datos.condicion)) {
    return "Elige una condición válida.";
  }

  return null;
}

export async function guardarMaterial(
  id: string | null,
  datos: DatosMaterial
): Promise<Resultado> {
  const limpio: DatosMaterial = {
    ...datos,
    nombre: datos.nombre.trim(),
    ubicacion: datos.ubicacion.trim(),
  };

  const error = validarMaterial(limpio);

  if (error) {
    return { error };
  }

  try {
    if (id) {
      await updateMaterial(id, limpio);
    } else {
      await createMaterial(limpio);
    }
  } catch (error) {
    console.error("No se pudo guardar el material en Twenty:", error);

    return {
      error:
        "No se pudo guardar el material en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidatePath("/inventario");

  return { error: null };
}

export async function eliminarMaterial(id: string): Promise<Resultado> {
  try {
    await deleteMaterial(id);
  } catch (error) {
    console.error("No se pudo eliminar el material en Twenty:", error);

    return { error: "No se pudo eliminar el material en Twenty." };
  }

  revalidatePath("/inventario");

  return { error: null };
}

export async function guardarMovimiento(
  materialId: string,
  datos: {
    tipo: TipoMovimiento;
    cantidad: number;
    fecha: string;
    nota: string;
  }
): Promise<Resultado> {
  if (!LISTA_TIPOS.includes(datos.tipo)) {
    return { error: "Elige el tipo de movimiento." };
  }

  if (!Number.isInteger(datos.cantidad) || datos.cantidad < 1) {
    return { error: "La cantidad debe ser un número entero mayor que 0." };
  }

  if (!esFecha(datos.fecha) || datos.fecha > hoy()) {
    return { error: "Elige una fecha válida (no futura)." };
  }

  try {
    const material = await getMaterialById(materialId);

    if (!material) {
      return { error: "El material ya no existe." };
    }

    if (
      !SUMAN.includes(datos.tipo) &&
      datos.cantidad > material.cantidad
    ) {
      return {
        error: `Solo hay ${material.cantidad} en existencia; no se pueden retirar ${datos.cantidad}.`,
      };
    }

    await registrarMovimiento(material, {
      ...datos,
      nota: datos.nota.trim(),
    });
  } catch (error) {
    console.error("No se pudo registrar el movimiento en Twenty:", error);

    return {
      error:
        "No se pudo registrar el movimiento en Twenty. Revisa la conexión e inténtalo de nuevo.",
    };
  }

  revalidatePath("/inventario");

  return { error: null };
}
