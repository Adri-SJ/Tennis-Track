
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  PackageCheck,
  AlertTriangle,
  Search,
  Plus,
  SlidersHorizontal,
  Boxes,
  ArrowUpRight,
  X,
  Info,
  Pencil,
  ArrowLeftRight,
  Trash2,
} from "lucide-react";
import type { Material, Movimiento } from "@/lib/inventario";
import { eliminarMaterial } from "./actions";
import MaterialModal, { CATEGORIAS } from "./MaterialModal";
import MovimientoModal from "./MovimientoModal";

const categorias = ["Todas", ...CATEGORIAS] as const;

type FiltroCategoria = (typeof categorias)[number];
type FiltroEstado = "Todos" | "Disponible" | "Stock bajo" | "Agotado";

function obtenerEstado(material: Material): FiltroEstado {
  if (material.cantidad === 0) return "Agotado";
  if (material.cantidad < material.minimo) return "Stock bajo";
  return "Disponible";
}

function estiloEstado(estado: FiltroEstado) {
  switch (estado) {
    case "Disponible":
      return "border-borde-lima bg-lima-suave text-verde-medio";
    case "Stock bajo":
      return "border-borde-alerta bg-alerta-suave text-alerta";
    case "Agotado":
      return "border-borde-peligro bg-peligro-suave text-peligro";
    default:
      return "";
  }
}

const formatoFecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export default function InventarioClient({
  materiales,
  movimientos,
}: {
  materiales: Material[];
  movimientos: Movimiento[];
}) {
  const router = useRouter();
  const [eliminando, startTransition] = useTransition();
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] =
    useState<FiltroCategoria>("Todas");
  const [estado, setEstado] = useState<FiltroEstado>("Todos");
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(
    null
  );
  const [formulario, setFormulario] = useState<
    { tipo: "material"; material: Material | null } | { tipo: "movimiento" } | null
  >(null);

  // Se busca por id para que el detalle muestre los datos
  // actualizados después de guardar.
  const materialSeleccionado =
    materiales.find((material) => material.id === seleccionadoId) ?? null;

  const movimientosSeleccionado = movimientos
    .filter((movimiento) => movimiento.materialId === seleccionadoId)
    .slice(0, 5);

  const setMaterialSeleccionado = (material: Material | null) =>
    setSeleccionadoId(material?.id ?? null);

  const eliminar = (material: Material) => {
    if (!window.confirm(`¿Eliminar «${material.nombre}» de Twenty?`)) {
      return;
    }

    startTransition(async () => {
      const resultado = await eliminarMaterial(material.id);

      if (resultado.error) {
        window.alert(resultado.error);
        return;
      }

      setSeleccionadoId(null);
      router.refresh();
    });
  };

  const totalMateriales = materiales.length;

  const unidadesTotales = materiales.reduce(
    (total, material) => total + material.cantidad,
    0
  );

  const materialesBajos = materiales.filter(
    (material) => obtenerEstado(material) === "Stock bajo"
  ).length;

  const materialesDisponibles = materiales.filter(
    (material) => obtenerEstado(material) === "Disponible"
  ).length;

  const materialesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return materiales.filter((material) => {
      const coincideBusqueda =
        material.nombre.toLowerCase().includes(texto) ||
        material.ubicacion.toLowerCase().includes(texto);

      const coincideCategoria =
        categoria === "Todas" ||
        material.categoria === categoria;

      const coincideEstado =
        estado === "Todos" ||
        obtenerEstado(material) === estado;

      return (
        coincideBusqueda &&
        coincideCategoria &&
        coincideEstado
      );
    });
  }, [materiales, busqueda, categoria, estado]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoria("Todas");
    setEstado("Todos");
  };

  return (
    <div className="px-5 py-6 md:px-8 lg:px-10">
      {/* ENCABEZADO */}
      <section className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-verde">
            Administración
          </p>

          <h1 className="mt-1 text-3xl font-black text-texto md:text-5xl">
            INVENTARIO
          </h1>

          <p className="mt-2 text-sm text-texto-3 md:text-base">
            Control de materiales y equipamiento deportivo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormulario({ tipo: "material", material: null })}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#cbd90a] px-5 py-3 text-sm font-black text-sobre-lima transition hover:bg-[#dce855]"
        >
          <Plus size={18} />
          Nuevo material
        </button>
      </section>

      {/* INDICADORES */}
      <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            titulo: "Tipos de material",
            valor: totalMateriales,
            icono: Package,
          },
          {
            titulo: "Unidades totales",
            valor: unidadesTotales,
            icono: Boxes,
          },
          {
            titulo: "Disponibles",
            valor: materialesDisponibles,
            icono: PackageCheck,
          },
          {
            titulo: "Stock bajo",
            valor: materialesBajos,
            icono: AlertTriangle,
          },
        ].map((indicador) => {
          const Icono = indicador.icono;

          return (
            <div
              key={indicador.titulo}
              className="rounded-2xl border border-borde bg-superficie p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-texto-suave">
                  {indicador.titulo}
                </p>
                <Icono size={18} className="text-verde" />
              </div>

              <p className="mt-3 text-3xl font-black text-texto">
                {indicador.valor}
              </p>
            </div>
          );
        })}
      </section>

      {/* ALERTA */}
      {materialesBajos > 0 && (
        <section className="mb-7 flex flex-col gap-3 rounded-2xl border border-borde-alerta bg-alerta-suave p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={21}
              className="mt-0.5 shrink-0 text-alerta"
            />

            <div>
              <p className="font-black text-alerta">
                Materiales que requieren atención
              </p>

              <p className="mt-1 text-sm text-alerta">
                Hay {materialesBajos} tipos de material con
                existencias por debajo del mínimo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setBusqueda("");
              setCategoria("Todas");
              setEstado("Stock bajo");
            }}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-alerta"
          >
            Ver materiales
            <ArrowUpRight size={16} />
          </button>
        </section>
      )}

      {/* CATÁLOGO */}
      <section className="overflow-hidden rounded-2xl border border-borde bg-superficie">
        <div className="border-b border-borde p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-verde">
                Catálogo
              </p>

              <h2 className="mt-1 text-xl font-black text-texto">
                Material deportivo
              </h2>
            </div>

            <span className="w-fit rounded-full border border-borde px-3 py-1 text-xs font-bold text-texto-suave">
              {materialesFiltrados.length} resultados
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-texto-suave"
              />

              <input
                type="search"
                placeholder="Buscar material..."
                value={busqueda}
                onChange={(event) =>
                  setBusqueda(event.target.value)
                }
                className="w-full rounded-xl border border-borde bg-fondo py-3 pl-11 pr-4 text-sm text-texto outline-none focus:border-verde"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-texto-suave"
              />

              <select
                aria-label="Filtrar por categoría"
                value={categoria}
                onChange={(event) =>
                  setCategoria(
                    event.target.value as FiltroCategoria
                  )
                }
                className="w-full rounded-xl border border-borde bg-fondo py-3 pl-11 pr-4 text-sm font-semibold text-texto outline-none focus:border-verde"
              >
                {categorias.map((item) => (
                  <option key={item} value={item}>
                    {item === "Todas"
                      ? "Todas las categorías"
                      : item}
                  </option>
                ))}
              </select>
            </div>

            <select
              aria-label="Filtrar por estado"
              value={estado}
              onChange={(event) =>
                setEstado(event.target.value as FiltroEstado)
              }
              className="w-full rounded-xl border border-borde bg-fondo px-4 py-3 text-sm font-semibold text-texto outline-none focus:border-verde"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="Stock bajo">Stock bajo</option>
              <option value="Agotado">Agotado</option>
            </select>
          </div>
        </div>

        {/* TABLA DESKTOP */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="bg-fondo">
              <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-texto-suave">
                <th className="px-6 py-4">Material</th>
                <th className="px-4 py-4">Categoría</th>
                <th className="px-4 py-4">Existencias</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Detalle</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-borde-suave">
              {materialesFiltrados.map((material) => {
                const estadoMaterial = obtenerEstado(material);

                return (
                  <tr
                    key={material.id}
                    className="transition hover:bg-superficie-2"
                  >
                    <td className="px-6 py-5">
                      <p className="font-bold text-texto">
                        {material.nombre}
                      </p>
                      <p className="mt-1 text-xs text-texto-suave">
                        {material.ubicacion || "Sin ubicación"}
                      </p>
                    </td>

                    <td className="px-4 py-5 text-sm text-texto-3">
                      {material.categoria}
                    </td>

                    <td className="px-4 py-5">
                      <p className="font-black text-texto">
                        {material.cantidad}
                      </p>

                      <p className="mt-1 text-xs text-texto-suave">
                        Mínimo: {material.minimo}
                      </p>
                    </td>

                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${estiloEstado(
                          estadoMaterial
                        )}`}
                      >
                        {estadoMaterial}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setMaterialSeleccionado(material)
                        }
                        className="inline-flex items-center gap-1 text-sm font-bold text-verde hover:text-verde-oscuro"
                      >
                        Ver
                        <ArrowUpRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* TARJETAS MÓVILES */}
        <div className="divide-y divide-borde-suave md:hidden">
          {materialesFiltrados.map((material) => {
            const estadoMaterial = obtenerEstado(material);

            return (
              <div key={material.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-texto">
                      {material.nombre}
                    </p>

                    <p className="mt-1 text-xs text-texto-suave">
                      {material.categoria}
                      {material.ubicacion && ` · ${material.ubicacion}`}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${estiloEstado(
                      estadoMaterial
                    )}`}
                  >
                    {estadoMaterial}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-fondo p-3">
                  <div>
                    <p className="text-xs text-texto-suave">
                      Existencias
                    </p>
                    <p className="mt-1 font-black text-texto">
                      {material.cantidad}
                    </p>
                  </div>

                  <p className="text-xs text-texto-suave">
                    Mínimo: {material.minimo}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMaterialSeleccionado(material)
                  }
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-verde"
                >
                  Ver detalle
                  <ArrowUpRight size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* SIN RESULTADOS */}
        {materialesFiltrados.length === 0 && (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <Search size={34} className="text-[#a8b65a]" />

            <h3 className="mt-4 font-black text-texto">
              No encontramos materiales
            </h3>

            <p className="mt-2 text-sm text-texto-suave">
              Prueba con otro nombre o modifica los filtros.
            </p>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="mt-4 text-sm font-bold text-verde"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-borde bg-superficie-2 px-5 py-4 text-xs text-texto-suave">
          <Info size={15} className="shrink-0" />
          Inventario guardado en Twenty. Las existencias se
          ajustan registrando entradas y salidas.
        </div>
      </section>

      {/* MODAL DE DETALLE */}
      {materialSeleccionado && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#141113]/50 p-4">
          <button
            type="button"
            aria-label="Cerrar detalle"
            onClick={() => setMaterialSeleccionado(null)}
            className="absolute inset-0"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-material"
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-superficie shadow-2xl"
          >
            <div className="flex items-start justify-between bg-fondo p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-verde">
                  Ficha de material
                </p>

                <h2
                  id="titulo-material"
                  className="mt-2 text-2xl font-black text-texto"
                >
                  {materialSeleccionado.nombre}
                </h2>

                <p className="mt-1 text-sm text-texto-suave">
                  {materialSeleccionado.categoria}
                </p>
              </div>

              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setMaterialSeleccionado(null)}
                className="rounded-full bg-superficie p-2 text-texto"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-texto-suave">
                  Estado
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${estiloEstado(
                    obtenerEstado(materialSeleccionado)
                  )}`}
                >
                  {obtenerEstado(materialSeleccionado)}
                </span>
              </div>

              {[
                {
                  titulo: "Existencias",
                  valor: `${materialSeleccionado.cantidad}`,
                },
                {
                  titulo: "Stock mínimo",
                  valor: `${materialSeleccionado.minimo}`,
                },
                {
                  titulo: "Ubicación",
                  valor: materialSeleccionado.ubicacion || "—",
                },
                {
                  titulo: "Condición",
                  valor: materialSeleccionado.condicion ?? "—",
                },
              ].map((campo) => (
                <div
                  key={campo.titulo}
                  className="flex items-start justify-between gap-4 border-b border-borde-suave pb-3"
                >
                  <span className="text-sm text-texto-suave">
                    {campo.titulo}
                  </span>

                  <span className="max-w-[65%] text-right text-sm font-bold text-texto">
                    {campo.valor}
                  </span>
                </div>
              ))}

              <div>
                <p className="text-sm font-bold text-texto">
                  Últimos movimientos
                </p>

                {movimientosSeleccionado.length > 0 ? (
                  <ul className="mt-2 divide-y divide-borde-suave">
                    {movimientosSeleccionado.map((movimiento) => (
                      <li
                        key={movimiento.id}
                        className="flex items-start justify-between gap-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-texto">
                            {movimiento.tipo}
                          </p>
                          <p className="text-xs text-texto-suave">
                            {formatoFecha.format(
                              new Date(`${movimiento.fecha}T12:00:00Z`)
                            )}
                            {movimiento.nota && ` · ${movimiento.nota}`}
                          </p>
                        </div>

                        <span className="font-black text-texto">
                          {movimiento.tipo === "Entrada" ||
                          movimiento.tipo === "Devolución"
                            ? "+"
                            : "−"}
                          {movimiento.cantidad}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-texto-suave">
                    Sin movimientos registrados.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormulario({ tipo: "movimiento" })}
                  className="inline-flex items-center gap-2 rounded-xl bg-boton px-4 py-3 text-sm font-semibold text-sobre-boton transition hover:bg-boton-hover"
                >
                  <ArrowLeftRight size={16} />
                  Registrar movimiento
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormulario({
                      tipo: "material",
                      material: materialSeleccionado,
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-borde px-4 py-3 text-sm font-semibold text-texto transition hover:bg-fondo"
                >
                  <Pencil size={16} />
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => eliminar(materialSeleccionado)}
                  disabled={eliminando}
                  className="inline-flex items-center gap-2 px-2 py-3 text-sm font-bold text-peligro disabled:opacity-60"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {formulario?.tipo === "material" && (
        <MaterialModal
          material={formulario.material}
          onCerrar={() => setFormulario(null)}
        />
      )}

      {formulario?.tipo === "movimiento" && materialSeleccionado && (
        <MovimientoModal
          material={materialSeleccionado}
          onCerrar={() => setFormulario(null)}
        />
      )}
    </div>
  );
}
