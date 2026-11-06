"use server";

import { autorizarAccion, requiereRol } from "@/lib/auth/servidor";
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
import {
  crearSolicitud,
  reabrirSolicitud,
  resolverSolicitud,
} from "@/lib/solicitudes";

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
  const sinPermiso = await autorizarAccion("/inventario/editar");

  if (sinPermiso) {
    return { error: sinPermiso };
  }

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
  const sinPermiso = await autorizarAccion("/inventario/editar");

  if (sinPermiso) {
    return { error: sinPermiso };
  }

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
  const sinPermiso = await autorizarAccion("/inventario/editar");

  if (sinPermiso) {
    return { error: sinPermiso };
  }

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

/* El entrenador pide material; las existencias cambian hasta que se aprueba. */
export async function solicitarMaterial(
  materialId: string,
  cantidad: number,
  nota: string
): Promise<Resultado> {
  const sinPermiso = await autorizarAccion("/inventario");

  if (sinPermiso) {
    return { error: sinPermiso };
  }

  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return { error: "La cantidad debe ser un número entero mayor a 0." };
  }

  try {
    const usuario = await requiereRol();
    const material = await getMaterialById(materialId);

    if (!material) {
      return { error: "Ese material ya no existe." };
    }

    if (cantidad > material.cantidad) {
      return {
        error: `Solo hay ${material.cantidad} disponibles de ${material.nombre}.`,
      };
    }

    await crearSolicitud({
      usuarioId: usuario.id,
      materialId,
      material: material.nombre,
      cantidad,
      nota: nota.trim(),
    });
  } catch (error) {
    console.error("No se pudo guardar la solicitud de material:", error);

    return { error: "No se pudo enviar la solicitud." };
  }

  revalidatePath("/inventario");

  return { error: null };
}

/* Al aprobar se registra la salida en Twenty y bajan las existencias. */
export async function decidirSolicitud(
  id: number,
  aprobar: boolean
): Promise<Resultado> {
  const sinPermiso = await autorizarAccion("/inventario/editar");

  if (sinPermiso) {
    return { error: sinPermiso };
  }

  const admin = await requiereRol("admin");

  const solicitud = await resolverSolicitud(
    id,
    aprobar ? "aprobada" : "rechazada",
    admin.id
  );

  if (!solicitud) {
    return { error: "Esta solicitud ya fue resuelta." };
  }

  if (aprobar) {
    try {
      const material = await getMaterialById(solicitud.materialId);

      if (!material || solicitud.cantidad > material.cantidad) {
        await reabrirSolicitud(id);

        return {
          error: material
            ? `Solo hay ${material.cantidad} disponibles de ${material.nombre}.`
            : "Ese material ya no existe.",
        };
      }

      await registrarMovimiento(material, {
        tipo: "Salida",
        cantidad: solicitud.cantidad,
        fecha: hoy(),
        nota: `Solicitud de ${solicitud.entrenador}${
          solicitud.nota ? `: ${solicitud.nota}` : ""
        }`,
      });
    } catch (error) {
      await reabrirSolicitud(id);
      console.error("No se pudo registrar la salida en Twenty:", error);

      return { error: "No se pudo registrar la salida en Twenty." };
    }
  }

  revalidatePath("/inventario");

  return { error: null };
}
