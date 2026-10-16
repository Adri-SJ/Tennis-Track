
"use client";

import { useMemo, useState } from "react";
import {
  Package,
  PackageCheck,
  AlertTriangle,
  Search,
  Plus,
  SlidersHorizontal,
  Boxes,
  ArrowUpRight,
  CircleCheck,
  X,
  Info,
} from "lucide-react";

type Categoria =
  | "Pelotas"
  | "Raquetas"
  | "Entrenamiento"
  | "Accesorios"
  | "Mantenimiento";

type Material = {
  id: string;
  nombre: string;
  categoria: Categoria;
  cantidad: number;
  minimo: number;
  unidad: string;
  ubicacion: string;
  descripcion: string;
};

const materialesIniciales: Material[] = [
  {
    id: "MAT-001",
    nombre: "Pelotas de entrenamiento",
    categoria: "Pelotas",
    cantidad: 120,
    minimo: 60,
    unidad: "piezas",
    ubicacion: "Bodega principal",
    descripcion: "Pelotas para sesiones regulares",
  },
  {
    id: "MAT-002",
    nombre: "Pelotas de baja presión",
    categoria: "Pelotas",
    cantidad: 18,
    minimo: 30,
    unidad: "piezas",
    ubicacion: "Bodega principal",
    descripcion: "Entrenamiento de principiantes",
  },
  {
    id: "MAT-003",
    nombre: "Raquetas de préstamo",
    categoria: "Raquetas",
    cantidad: 12,
    minimo: 8,
    unidad: "piezas",
    ubicacion: "Área de entrenadores",
    descripcion: "Raquetas disponibles para alumnos",
  },
  {
    id: "MAT-004",
    nombre: "Conos de entrenamiento",
    categoria: "Entrenamiento",
    cantidad: 24,
    minimo: 20,
    unidad: "piezas",
    ubicacion: "Bodega principal",
    descripcion: "Delimitación de ejercicios",
  },
  {
    id: "MAT-005",
    nombre: "Escaleras de coordinación",
    categoria: "Entrenamiento",
    cantidad: 3,
    minimo: 4,
    unidad: "piezas",
    ubicacion: "Área de entrenadores",
    descripcion: "Trabajo de velocidad y coordinación",
  },
  {
    id: "MAT-006",
    nombre: "Redes de repuesto",
    categoria: "Mantenimiento",
    cantidad: 2,
    minimo: 2,
    unidad: "piezas",
    ubicacion: "Bodega principal",
    descripcion: "Redes para mantenimiento de cancha",
  },
  {
    id: "MAT-007",
    nombre: "Overgrips",
    categoria: "Accesorios",
    cantidad: 8,
    minimo: 20,
    unidad: "piezas",
    ubicacion: "Área de entrenadores",
    descripcion: "Accesorios para empuñaduras",
  },
  {
    id: "MAT-008",
    nombre: "Canastas para pelotas",
    categoria: "Entrenamiento",
    cantidad: 5,
    minimo: 3,
    unidad: "piezas",
    ubicacion: "Bodega principal",
    descripcion: "Transporte de pelotas",
  },
];

const categorias = [
  "Todas",
  "Pelotas",
  "Raquetas",
  "Entrenamiento",
  "Accesorios",
  "Mantenimiento",
] as const;

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
      return "border-[#b9ca75] bg-[#f0f5d8] text-[#657a0b]";
    case "Stock bajo":
      return "border-[#e6c58d] bg-[#fff5df] text-[#a16a1b]";
    case "Agotado":
      return "border-[#e6b1a9] bg-[#fff0ed] text-[#b4493c]";
    default:
      return "";
  }
}

export default function InventarioClient() {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] =
    useState<FiltroCategoria>("Todas");
  const [estado, setEstado] = useState<FiltroEstado>("Todos");
  const [materialSeleccionado, setMaterialSeleccionado] =
    useState<Material | null>(null);

  const totalMateriales = materialesIniciales.length;

  const unidadesTotales = materialesIniciales.reduce(
    (total, material) => total + material.cantidad,
    0
  );

  const materialesBajos = materialesIniciales.filter(
    (material) => obtenerEstado(material) === "Stock bajo"
  ).length;

  const materialesDisponibles = materialesIniciales.filter(
    (material) => obtenerEstado(material) === "Disponible"
  ).length;

  const materialesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return materialesIniciales.filter((material) => {
      const coincideBusqueda =
        material.nombre.toLowerCase().includes(texto) ||
        material.id.toLowerCase().includes(texto) ||
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
  }, [busqueda, categoria, estado]);

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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
            Administración
          </p>

          <h1 className="mt-1 text-3xl font-black text-[#141113] md:text-5xl">
            INVENTARIO
          </h1>

          <p className="mt-2 text-sm text-[#6f6964] md:text-base">
            Control de materiales y equipamiento deportivo.
          </p>
        </div>

        <button
          type="button"
          disabled
          title="Disponible al implementar el registro de materiales"
          className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-xl bg-[#cbd90a] px-5 py-3 text-sm font-black text-[#32390d] opacity-60"
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
              className="rounded-2xl border border-[#e1dace] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8c847d]">
                  {indicador.titulo}
                </p>
                <Icono size={18} className="text-[#7d9309]" />
              </div>

              <p className="mt-3 text-3xl font-black text-[#141113]">
                {indicador.valor}
              </p>
            </div>
          );
        })}
      </section>

      {/* ALERTA */}
      {materialesBajos > 0 && (
        <section className="mb-7 flex flex-col gap-3 rounded-2xl border border-[#e6c58d] bg-[#fff8e9] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={21}
              className="mt-0.5 shrink-0 text-[#a16a1b]"
            />

            <div>
              <p className="font-black text-[#754e16]">
                Materiales que requieren atención
              </p>

              <p className="mt-1 text-sm text-[#94703a]">
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
            className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#936316]"
          >
            Ver materiales
            <ArrowUpRight size={16} />
          </button>
        </section>
      )}

      {/* CATÁLOGO */}
      <section className="overflow-hidden rounded-2xl border border-[#e1dace] bg-white">
        <div className="border-b border-[#e1dace] p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7d9309]">
                Catálogo
              </p>

              <h2 className="mt-1 text-xl font-black text-[#141113]">
                Material deportivo
              </h2>
            </div>

            <span className="w-fit rounded-full border border-[#e1dace] px-3 py-1 text-xs font-bold text-[#8c847d]">
              {materialesFiltrados.length} resultados
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8c847d]"
              />

              <input
                type="search"
                placeholder="Buscar material..."
                value={busqueda}
                onChange={(event) =>
                  setBusqueda(event.target.value)
                }
                className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] py-3 pl-11 pr-4 text-sm text-[#141113] outline-none focus:border-[#7d9309]"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8c847d]"
              />

              <select
                aria-label="Filtrar por categoría"
                value={categoria}
                onChange={(event) =>
                  setCategoria(
                    event.target.value as FiltroCategoria
                  )
                }
                className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] py-3 pl-11 pr-4 text-sm font-semibold text-[#141113] outline-none focus:border-[#7d9309]"
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
              className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] px-4 py-3 text-sm font-semibold text-[#141113] outline-none focus:border-[#7d9309]"
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
            <thead className="bg-[#f6f4ee]">
              <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8c847d]">
                <th className="px-6 py-4">Material</th>
                <th className="px-4 py-4">Categoría</th>
                <th className="px-4 py-4">Existencias</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Detalle</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#eee9df]">
              {materialesFiltrados.map((material) => {
                const estadoMaterial = obtenerEstado(material);

                return (
                  <tr
                    key={material.id}
                    className="transition hover:bg-[#fdfcf9]"
                  >
                    <td className="px-6 py-5">
                      <p className="font-bold text-[#141113]">
                        {material.nombre}
                      </p>
                      <p className="mt-1 text-xs text-[#8c847d]">
                        {material.id}
                      </p>
                    </td>

                    <td className="px-4 py-5 text-sm text-[#6f6964]">
                      {material.categoria}
                    </td>

                    <td className="px-4 py-5">
                      <p className="font-black text-[#141113]">
                        {material.cantidad}{" "}
                        <span className="text-xs font-normal text-[#8c847d]">
                          {material.unidad}
                        </span>
                      </p>

                      <p className="mt-1 text-xs text-[#8c847d]">
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
                        className="inline-flex items-center gap-1 text-sm font-bold text-[#7d9309] hover:text-[#52620a]"
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
        <div className="divide-y divide-[#eee9df] md:hidden">
          {materialesFiltrados.map((material) => {
            const estadoMaterial = obtenerEstado(material);

            return (
              <div key={material.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#141113]">
                      {material.nombre}
                    </p>

                    <p className="mt-1 text-xs text-[#8c847d]">
                      {material.id} · {material.categoria}
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

                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f6f4ee] p-3">
                  <div>
                    <p className="text-xs text-[#8c847d]">
                      Existencias
                    </p>
                    <p className="mt-1 font-black text-[#141113]">
                      {material.cantidad} {material.unidad}
                    </p>
                  </div>

                  <p className="text-xs text-[#8c847d]">
                    Mínimo: {material.minimo}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMaterialSeleccionado(material)
                  }
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#7d9309]"
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

            <h3 className="mt-4 font-black text-[#141113]">
              No encontramos materiales
            </h3>

            <p className="mt-2 text-sm text-[#8c847d]">
              Prueba con otro nombre o modifica los filtros.
            </p>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="mt-4 text-sm font-bold text-[#7d9309]"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-[#e1dace] bg-[#fdfcf9] px-5 py-4 text-xs text-[#8c847d]">
          <Info size={15} className="shrink-0" />
          Datos de demostración. Pendiente de conexión con Twenty.
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
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between bg-[#f6f4ee] p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7d9309]">
                  Ficha de material
                </p>

                <h2
                  id="titulo-material"
                  className="mt-2 text-2xl font-black text-[#141113]"
                >
                  {materialSeleccionado.nombre}
                </h2>

                <p className="mt-1 text-sm text-[#8c847d]">
                  {materialSeleccionado.id}
                </p>
              </div>

              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setMaterialSeleccionado(null)}
                className="rounded-full bg-white p-2 text-[#141113]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8c847d]">
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
                  titulo: "Categoría",
                  valor: materialSeleccionado.categoria,
                },
                {
                  titulo: "Existencias",
                  valor: `${materialSeleccionado.cantidad} ${materialSeleccionado.unidad}`,
                },
                {
                  titulo: "Stock mínimo",
                  valor: `${materialSeleccionado.minimo} ${materialSeleccionado.unidad}`,
                },
                {
                  titulo: "Ubicación",
                  valor: materialSeleccionado.ubicacion,
                },
                {
                  titulo: "Descripción",
                  valor: materialSeleccionado.descripcion,
                },
              ].map((campo) => (
                <div
                  key={campo.titulo}
                  className="flex items-start justify-between gap-4 border-b border-[#eee9df] pb-3"
                >
                  <span className="text-sm text-[#8c847d]">
                    {campo.titulo}
                  </span>

                  <span className="max-w-[65%] text-right text-sm font-bold text-[#141113]">
                    {campo.valor}
                  </span>
                </div>
              ))}

              <div className="flex items-center gap-2 rounded-xl bg-[#f0f5d8] p-4 text-xs text-[#657a0b]">
                <CircleCheck size={17} className="shrink-0" />
                Información de ejemplo para visualizar el módulo.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
