import { twentyFetch } from "@/lib/api";

export type Categoria =
  | "Pelotas"
  | "Raquetas"
  | "Conos"
  | "Redes"
  | "Entrenamiento"
  | "Otro";

export type Condicion = "Bueno" | "Desgastado" | "Dañado";

export type TipoMovimiento =
  | "Entrada"
  | "Salida"
  | "Devolución"
  | "Préstamo"
  | "Baja";

export type Material = {
  id: string;
  nombre: string;
  categoria: Categoria;
  cantidad: number;
  minimo: number;
  ubicacion: string;
  condicion: Condicion | null;
};

export type DatosMaterial = Omit<Material, "id">;

export type Movimiento = {
  id: string;
  materialId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  fecha: string;
  nota: string;
};

const CATEGORIAS: Record<string, Categoria> = {
  PELOTAS: "Pelotas",
  RAQUETAS: "Raquetas",
  CONOS: "Conos",
  REDES: "Redes",
  ENTRENAMIENTO: "Entrenamiento",
  OTRO: "Otro",
};

const CONDICIONES: Record<string, Condicion> = {
  BUENO: "Bueno",
  DESGASTADO: "Desgastado",
  DANADO: "Dañado",
};

const TIPOS: Record<string, TipoMovimiento> = {
  ENTRADA: "Entrada",
  SALIDA: "Salida",
  DEVOLUCION: "Devolución",
  PRESTAMO: "Préstamo",
  BAJA: "Baja",
};

/* Entradas y devoluciones suman existencias; el resto resta. */
export const SUMAN: TipoMovimiento[] = ["Entrada", "Devolución"];

export const LISTA_CATEGORIAS = Object.values(CATEGORIAS);
export const LISTA_CONDICIONES = Object.values(CONDICIONES);
export const LISTA_TIPOS = Object.values(TIPOS);

const aTwenty = <T extends string>(
  mapa: Record<string, T>,
  valor: T | null
) =>
  valor === null
    ? null
    : (Object.keys(mapa).find((clave) => mapa[clave] === valor) ?? null);

type TwentyArticulo = {
  id: string;
  name: string | null;
  categoria: string | null;
  cantidad: number | null;
  cantidadMinima: number | null;
  ubicacion: string | null;
  estado: string | null;
};

type TwentyMovimiento = {
  id: string;
  articuloId: string | null;
  tipo: string | null;
  cantidad: number | null;
  fecha: string | null;
  nota: string | null;
};

function cuerpoMaterial(datos: DatosMaterial) {
  return {
    name: datos.nombre,
    categoria: aTwenty(CATEGORIAS, datos.categoria),
    cantidad: datos.cantidad,
    cantidadMinima: datos.minimo,
    ubicacion: datos.ubicacion,
    estado: aTwenty(CONDICIONES, datos.condicion),
  };
}

export async function getMateriales(): Promise<Material[]> {
  const result = await twentyFetch<{
    data: { articulos: TwentyArticulo[] };
  }>("articulos?limit=200&order_by=name[AscNullsLast]");

  return result.data.articulos
    .filter((articulo) => articulo.name)
    .map((articulo) => ({
      id: articulo.id,
      nombre: articulo.name ?? "",
      categoria: CATEGORIAS[articulo.categoria ?? ""] ?? "Otro",
      cantidad: articulo.cantidad ?? 0,
      minimo: articulo.cantidadMinima ?? 0,
      ubicacion: articulo.ubicacion ?? "",
      condicion: CONDICIONES[articulo.estado ?? ""] ?? null,
    }));
}

export async function getMovimientos(): Promise<Movimiento[]> {
  const result = await twentyFetch<{
    data: { movimientosInventario: TwentyMovimiento[] };
  }>("movimientosInventario?limit=200&order_by=fecha[DescNullsLast]");

  return result.data.movimientosInventario
    .filter(
      (movimiento) =>
        movimiento.articuloId && movimiento.tipo && movimiento.fecha
    )
    .map((movimiento) => ({
      id: movimiento.id,
      materialId: movimiento.articuloId as string,
      tipo: TIPOS[movimiento.tipo as string] ?? "Entrada",
      cantidad: movimiento.cantidad ?? 0,
      fecha: movimiento.fecha as string,
      nota: movimiento.nota ?? "",
    }));
}

export async function getMaterialById(
  id: string
): Promise<Material | null> {
  const materiales = await getMateriales();

  return materiales.find((material) => material.id === id) ?? null;
}

export async function createMaterial(datos: DatosMaterial): Promise<void> {
  await twentyFetch("articulos", {
    method: "POST",
    body: cuerpoMaterial(datos),
  });
}

export async function updateMaterial(
  id: string,
  datos: DatosMaterial
): Promise<void> {
  await twentyFetch(`articulos/${id}`, {
    method: "PATCH",
    body: cuerpoMaterial(datos),
  });
}

/* Borra el artículo junto con sus movimientos para no dejarlos huérfanos. */
export async function deleteMaterial(id: string): Promise<void> {
  const filtro = encodeURIComponent(`articuloId[eq]:"${id}"`);

  const result = await twentyFetch<{
    data: { movimientosInventario: { id: string }[] };
  }>(`movimientosInventario?limit=200&filter=${filtro}`);

  await Promise.all(
    result.data.movimientosInventario.map((movimiento) =>
      twentyFetch(`movimientosInventario/${movimiento.id}`, {
        method: "DELETE",
      })
    )
  );

  await twentyFetch(`articulos/${id}`, { method: "DELETE" });
}

/*
  Registra el movimiento y ajusta las existencias del
  artículo en la misma operación.
*/
export async function registrarMovimiento(
  material: Material,
  movimiento: Omit<Movimiento, "id" | "materialId">
): Promise<void> {
  const nuevaCantidad = SUMAN.includes(movimiento.tipo)
    ? material.cantidad + movimiento.cantidad
    : material.cantidad - movimiento.cantidad;

  await twentyFetch("movimientosInventario", {
    method: "POST",
    body: {
      name: `${movimiento.tipo} · ${material.nombre}`,
      articuloId: material.id,
      tipo: aTwenty(TIPOS, movimiento.tipo),
      cantidad: movimiento.cantidad,
      fecha: movimiento.fecha,
      nota: movimiento.nota,
    },
  });

  await twentyFetch(`articulos/${material.id}`, {
    method: "PATCH",
    body: { cantidad: nuevaCantidad },
  });
}
