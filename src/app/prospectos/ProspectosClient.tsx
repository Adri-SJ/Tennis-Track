
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  Info,
  LayoutGrid,
  List,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type Etapa =
  | "Nuevo"
  | "Contactado"
  | "Clase de prueba"
  | "Inscrito";

type Origen =
  | "Recomendación"
  | "Redes sociales"
  | "WhatsApp"
  | "Visita"
  | "Otro";

type Prospecto = {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  edad: string;
  origen: Origen;
  etapa: Etapa;
  fechaContacto: string;
  notas: string;
};

const STORAGE_KEY = "tennistrack-prospectos-v1";

const etapas: Etapa[] = [
  "Nuevo",
  "Contactado",
  "Clase de prueba",
  "Inscrito",
];

const origenes: Origen[] = [
  "Recomendación",
  "Redes sociales",
  "WhatsApp",
  "Visita",
  "Otro",
];

const coloresEtapa: Record<Etapa, string> = {
  Nuevo: "bg-[#eef0f7] text-[#5d6b91]",
  Contactado: "bg-[#fff5df] text-[#a16a1b]",
  "Clase de prueba": "bg-[#eaf3f1] text-[#397f75]",
  Inscrito: "bg-[#eef2cf] text-[#52620a]",
};

const prospectosDemo: Prospecto[] = [
  {
    id: "demo-1",
    nombre: "Sofía Martínez",
    telefono: "9510000001",
    correo: "sofia.ejemplo@example.com",
    edad: "14",
    origen: "Redes sociales",
    etapa: "Nuevo",
    fechaContacto: "2026-10-07",
    notas: "Interesada en conocer los horarios disponibles.",
  },
  {
    id: "demo-2",
    nombre: "Diego López",
    telefono: "9510000002",
    correo: "",
    edad: "11",
    origen: "Recomendación",
    etapa: "Contactado",
    fechaContacto: "2026-10-05",
    notas: "Solicitó información sobre clases por la mañana.",
  },
  {
    id: "demo-3",
    nombre: "Valentina Ruiz",
    telefono: "9510000003",
    correo: "valentina.ejemplo@example.com",
    edad: "16",
    origen: "WhatsApp",
    etapa: "Clase de prueba",
    fechaContacto: "2026-10-02",
    notas: "Pendiente de asistir a una sesión de prueba.",
  },
  {
    id: "demo-4",
    nombre: "Mateo García",
    telefono: "9510000004",
    correo: "",
    edad: "12",
    origen: "Visita",
    etapa: "Inscrito",
    fechaContacto: "2026-09-29",
    notas: "Registro de ejemplo para mostrar el proceso.",
  },
];

function fechaHoy() {
  const fecha = new Date();

  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatearFecha(fecha: string) {
  if (!fecha) return "—";

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${fecha}T12:00:00Z`));
}

function formularioVacio(): Prospecto {
  return {
    id: "",
    nombre: "",
    telefono: "",
    correo: "",
    edad: "",
    origen: "WhatsApp",
    etapa: "Nuevo",
    fechaContacto: fechaHoy(),
    notas: "",
  };
}

function IconoEtapa({ etapa }: { etapa: Etapa }) {
  if (etapa === "Nuevo") return <UserPlus size={17} />;
  if (etapa === "Contactado") return <Phone size={17} />;
  if (etapa === "Clase de prueba") {
    return <CalendarDays size={17} />;
  }
  return <CircleCheck size={17} />;
}

export default function ProspectosClient() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [cargado, setCargado] = useState(false);
  const [mostrarDemo, setMostrarDemo] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEtapa, setFiltroEtapa] = useState<
    Etapa | "Todas"
  >("Todas");
  const [vista, setVista] = useState<"tablero" | "lista">(
    "tablero"
  );

  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState<Prospecto>(
    formularioVacio
  );
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const datos = localStorage.getItem(STORAGE_KEY);

      if (datos) {
        const registros = JSON.parse(datos);

        if (Array.isArray(registros)) {
          setProspectos(
            registros.filter(
              (item): item is Prospecto =>
                typeof item?.id === "string" &&
                typeof item?.nombre === "string" &&
                typeof item?.telefono === "string" &&
                typeof item?.correo === "string" &&
                typeof item?.edad === "string" &&
                origenes.includes(item?.origen) &&
                etapas.includes(item?.etapa) &&
                typeof item?.fechaContacto === "string" &&
                typeof item?.notas === "string"
            )
          );
        }
      }
    } catch {
      console.warn("No se pudieron recuperar los prospectos.");
    }

    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(prospectos)
      );
    } catch {
      console.warn("No se pudieron guardar los prospectos.");
    }
  }, [prospectos, cargado]);

  const todos = useMemo(
    () => [
      ...(mostrarDemo ? prospectosDemo : []),
      ...prospectos,
    ],
    [mostrarDemo, prospectos]
  );

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return todos.filter((prospecto) => {
      const coincideTexto =
        prospecto.nombre.toLowerCase().includes(texto) ||
        prospecto.telefono.includes(texto) ||
        prospecto.correo.toLowerCase().includes(texto);

      const coincideEtapa =
        filtroEtapa === "Todas" ||
        prospecto.etapa === filtroEtapa;

      return coincideTexto && coincideEtapa;
    });
  }, [todos, busqueda, filtroEtapa]);

  const totalNuevos = todos.filter(
    (prospecto) => prospecto.etapa === "Nuevo"
  ).length;

  const totalPruebas = todos.filter(
    (prospecto) => prospecto.etapa === "Clase de prueba"
  ).length;

  const totalInscritos = todos.filter(
    (prospecto) => prospecto.etapa === "Inscrito"
  ).length;

  const conversion =
    todos.length > 0
      ? Math.round((totalInscritos / todos.length) * 100)
      : 0;

  const abrirNuevo = () => {
    setFormulario(formularioVacio());
    setError("");
    setModalAbierto(true);
  };

  const abrirEditar = (prospecto: Prospecto) => {
    setFormulario({ ...prospecto });
    setError("");
    setModalAbierto(true);
  };

  const guardar = () => {
    if (!formulario.nombre.trim()) {
      setError("Escribe el nombre del prospecto.");
      return;
    }

    if (!formulario.telefono.trim()) {
      setError("Escribe un teléfono de contacto.");
      return;
    }

    if (
      formulario.correo.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formulario.correo.trim()
      )
    ) {
      setError("El correo electrónico no es válido.");
      return;
    }

    if (
      formulario.edad &&
      (!Number.isInteger(Number(formulario.edad)) ||
        Number(formulario.edad) < 1 ||
        Number(formulario.edad) > 120)
    ) {
      setError("Escribe una edad válida.");
      return;
    }

    if (!formulario.fechaContacto) {
      setError("Selecciona la fecha de contacto.");
      return;
    }

    const registro: Prospecto = {
      ...formulario,
      id:
        formulario.id ||
        `pros-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
      nombre: formulario.nombre.trim(),
      telefono: formulario.telefono.trim(),
      correo: formulario.correo.trim(),
      notas: formulario.notas.trim(),
    };

    setProspectos((actuales) => {
      const existe = actuales.some(
        (item) => item.id === registro.id
      );

      return existe
        ? actuales.map((item) =>
            item.id === registro.id ? registro : item
          )
        : [registro, ...actuales];
    });

    setModalAbierto(false);
  };

  const cambiarEtapa = (id: string, etapa: Etapa) => {
    setProspectos((actuales) =>
      actuales.map((prospecto) =>
        prospecto.id === id
          ? { ...prospecto, etapa }
          : prospecto
      )
    );
  };

  const eliminar = (id: string) => {
    if (
      !window.confirm(
        "¿Eliminar este prospecto del navegador?"
      )
    ) {
      return;
    }

    setProspectos((actuales) =>
      actuales.filter((prospecto) => prospecto.id !== id)
    );

    setModalAbierto(false);
  };

  const tarjetaProspecto = (prospecto: Prospecto) => {
    const esDemo = prospecto.id.startsWith("demo-");

    return (
      <div
        key={prospecto.id}
        className="rounded-xl border border-[#e1dace] bg-white p-4 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef2cf] font-black text-[#52620a]">
              {prospecto.nombre.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate font-black text-[#141113]">
                {prospecto.nombre}
              </p>

              <p className="mt-1 text-xs text-[#8c847d]">
                {prospecto.origen}
              </p>
            </div>
          </div>

          {!esDemo && (
            <button
              type="button"
              onClick={() => abrirEditar(prospecto)}
              aria-label={`Editar a ${prospecto.nombre}`}
              className="rounded-lg p-2 text-[#8c847d] hover:bg-[#f6f4ee]"
            >
              <Pencil size={16} />
            </button>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <p className="flex items-center gap-2 text-xs text-[#6f6964]">
            <Phone size={14} />
            {prospecto.telefono}
          </p>

          <p className="flex items-center gap-2 text-xs text-[#6f6964]">
            <CalendarDays size={14} />
            {formatearFecha(prospecto.fechaContacto)}
          </p>
        </div>

        {prospecto.notas && (
          <p className="mt-4 line-clamp-2 rounded-lg bg-[#f6f4ee] p-3 text-xs leading-relaxed text-[#6f6964]">
            {prospecto.notas}
          </p>
        )}

        <div className="mt-4 border-t border-[#eee9df] pt-3">
          {esDemo ? (
            <span className="text-xs font-semibold text-[#a16a1b]">
              Registro de ejemplo
            </span>
          ) : (
            <div className="relative">
              <select
                aria-label={`Etapa de ${prospecto.nombre}`}
                value={prospecto.etapa}
                onChange={(event) =>
                  cambiarEtapa(
                    prospecto.id,
                    event.target.value as Etapa
                  )
                }
                className="w-full appearance-none rounded-lg bg-[#f6f4ee] px-3 py-2 pr-9 text-xs font-bold text-[#52620a] outline-none"
              >
                {etapas.map((etapa) => (
                  <option key={etapa} value={etapa}>
                    {etapa}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#52620a]"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="px-5 py-6 md:px-8 lg:px-10">
      {/* ENCABEZADO */}
      <section className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
            Crecimiento de la academia
          </p>

          <h1 className="mt-1 text-3xl font-black text-[#141113] md:text-5xl">
            PROSPECTOS
          </h1>

          <p className="mt-2 text-sm text-[#6f6964] md:text-base">
            Seguimiento de personas interesadas en formar
            parte de la academia.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevo}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#cbd90a] px-5 py-3 text-sm font-black text-[#32390d] transition hover:bg-[#dce855]"
        >
          <Plus size={18} />
          Nuevo prospecto
        </button>
      </section>

      {/* INDICADORES */}
      <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            titulo: "Total de prospectos",
            valor: todos.length,
            icono: Users,
          },
          {
            titulo: "Nuevos",
            valor: totalNuevos,
            icono: UserPlus,
          },
          {
            titulo: "Clases de prueba",
            valor: totalPruebas,
            icono: CalendarDays,
          },
          {
            titulo: "Convertidos",
            valor: totalInscritos,
            icono: CircleCheck,
          },
        ].map((indicador) => {
          const Icono = indicador.icono;

          return (
            <div
              key={indicador.titulo}
              className="rounded-2xl border border-[#e1dace] bg-white p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8c847d]">
                  {indicador.titulo}
                </p>

                <Icono
                  size={18}
                  className="shrink-0 text-[#7d9309]"
                />
              </div>

              <p className="mt-4 text-3xl font-black text-[#141113]">
                {indicador.valor}
              </p>
            </div>
          );
        })}
      </section>

      {/* CONVERSIÓN */}
      <section className="mb-7 rounded-2xl bg-[#32390d] p-6 text-white md:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#dce6a1]">
              Captación de alumnos
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Conversión de prospectos
            </h2>

            <p className="mt-2 text-sm text-[#d1d5ba]">
              Porcentaje de registros que llegaron a la
              etapa de inscrito.
            </p>
          </div>

          <p className="text-5xl font-black text-[#eef310]">
            {conversion}%
          </p>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-[#cbd90a]"
            style={{ width: `${conversion}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between text-xs text-[#d1d5ba]">
          <span>{totalInscritos} inscritos</span>
          <span>{todos.length} prospectos</span>
        </div>
      </section>

      {/* CONTROLES */}
      <section className="mb-5 rounded-2xl border border-[#e1dace] bg-white p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_200px]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c847d]"
              />

              <input
                type="search"
                placeholder="Buscar nombre, teléfono o correo..."
                value={busqueda}
                onChange={(event) =>
                  setBusqueda(event.target.value)
                }
                className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#7d9309]"
              />
            </div>

            <select
              aria-label="Filtrar por etapa"
              value={filtroEtapa}
              onChange={(event) =>
                setFiltroEtapa(
                  event.target.value as Etapa | "Todas"
                )
              }
              className="rounded-xl border border-[#e1dace] bg-[#f6f4ee] px-4 py-3 text-sm font-semibold outline-none"
            >
              <option value="Todas">Todas las etapas</option>

              {etapas.map((etapa) => (
                <option key={etapa} value={etapa}>
                  {etapa}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVista("tablero")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${
                vista === "tablero"
                  ? "bg-[#eef2cf] text-[#52620a]"
                  : "bg-[#f6f4ee] text-[#8c847d]"
              }`}
            >
              <LayoutGrid size={17} />
              Tablero
            </button>

            <button
              type="button"
              onClick={() => setVista("lista")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${
                vista === "lista"
                  ? "bg-[#eef2cf] text-[#52620a]"
                  : "bg-[#f6f4ee] text-[#8c847d]"
              }`}
            >
              <List size={17} />
              Lista
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#8c847d]">
            {filtrados.length} prospectos encontrados
          </span>

          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#6f6964]">
            <input
              type="checkbox"
              checked={mostrarDemo}
              onChange={(event) =>
                setMostrarDemo(event.target.checked)
              }
              className="accent-[#7d9309]"
            />
            Mostrar ejemplos
          </label>
        </div>
      </section>

      {/* TABLERO */}
      {vista === "tablero" && (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {etapas.map((etapa) => {
            const registros = filtrados.filter(
              (prospecto) => prospecto.etapa === etapa
            );

            return (
              <div
                key={etapa}
                className="min-h-72 rounded-2xl border border-[#e1dace] bg-[#f6f4ee] p-3"
              >
                <div className="mb-4 flex items-center justify-between px-2 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-lg p-2 ${coloresEtapa[etapa]}`}
                    >
                      <IconoEtapa etapa={etapa} />
                    </span>

                    <h3 className="text-sm font-black text-[#141113]">
                      {etapa}
                    </h3>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#6f6964]">
                    {registros.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {registros.map(tarjetaProspecto)}

                  {registros.length === 0 && (
                    <div className="rounded-xl border border-dashed border-[#d8d0c4] px-4 py-10 text-center text-xs text-[#8c847d]">
                      Sin prospectos en esta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* LISTA */}
      {vista === "lista" && (
        <section className="overflow-hidden rounded-2xl border border-[#e1dace] bg-white">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="bg-[#f6f4ee]">
                <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8c847d]">
                  <th className="px-6 py-4">Prospecto</th>
                  <th className="px-4 py-4">Contacto</th>
                  <th className="px-4 py-4">Origen</th>
                  <th className="px-4 py-4">Etapa</th>
                  <th className="px-4 py-4">Fecha</th>
                  <th className="px-6 py-4 text-right">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#eee9df]">
                {filtrados.map((prospecto) => {
                  const esDemo =
                    prospecto.id.startsWith("demo-");

                  return (
                    <tr key={prospecto.id}>
                      <td className="px-6 py-5 font-bold text-[#141113]">
                        {prospecto.nombre}
                      </td>

                      <td className="px-4 py-5 text-sm text-[#6f6964]">
                        {prospecto.telefono}
                      </td>

                      <td className="px-4 py-5 text-sm text-[#6f6964]">
                        {prospecto.origen}
                      </td>

                      <td className="px-4 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${coloresEtapa[prospecto.etapa]}`}
                        >
                          {prospecto.etapa}
                        </span>
                      </td>

                      <td className="px-4 py-5 text-sm text-[#6f6964]">
                        {formatearFecha(
                          prospecto.fechaContacto
                        )}
                      </td>

                      <td className="px-6 py-5 text-right">
                        {esDemo ? (
                          <span className="text-xs text-[#a16a1b]">
                            Ejemplo
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              abrirEditar(prospecto)
                            }
                            className="text-sm font-bold text-[#7d9309]"
                          >
                            Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {filtrados.map(tarjetaProspecto)}
          </div>

          {filtrados.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-[#8c847d]">
              No hay prospectos que coincidan con los
              filtros.
            </p>
          )}
        </section>
      )}

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-[#e1dace] bg-white p-4 text-xs leading-relaxed text-[#8c847d]">
        <Info size={16} className="mt-0.5 shrink-0" />
        Los prospectos nuevos se guardan solo en este
        navegador. Los registros de ejemplo son ficticios.
        Cambiar la etapa a Inscrito no crea todavía un
        alumno en Twenty.
      </div>

      {/* FORMULARIO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#141113]/55 p-3 md:p-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-prospecto"
            className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-start justify-between bg-[#f6f4ee] p-5 md:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7d9309]">
                  Captación de alumnos
                </p>

                <h2
                  id="titulo-prospecto"
                  className="mt-1 text-2xl font-black text-[#141113]"
                >
                  {formulario.id
                    ? "EDITAR PROSPECTO"
                    : "NUEVO PROSPECTO"}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Cerrar formulario"
                onClick={() => setModalAbierto(false)}
                className="rounded-full bg-white p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto p-5 md:p-6">
              <div>
                <label
                  htmlFor="prospecto-nombre"
                  className="mb-2 block text-sm font-bold"
                >
                  Nombre completo *
                </label>

                <input
                  id="prospecto-nombre"
                  value={formulario.nombre}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      nombre: event.target.value,
                    }))
                  }
                  placeholder="Nombre del interesado"
                  maxLength={120}
                  className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] px-4 py-3 text-sm outline-none focus:border-[#7d9309]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="prospecto-telefono"
                    className="mb-2 block text-sm font-bold"
                  >
                    Teléfono *
                  </label>

                  <input
                    id="prospecto-telefono"
                    type="tel"
                    value={formulario.telefono}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        telefono: event.target.value,
                      }))
                    }
                    placeholder="951..."
                    maxLength={25}
                    className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] px-4 py-3 text-sm outline-none focus:border-[#7d9309]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="prospecto-edad"
                    className="mb-2 block text-sm font-bold"
                  >
                    Edad
                  </label>

                  <input
                    id="prospecto-edad"
                    type="number"
                    min={1}
                    max={120}
                    value={formulario.edad}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        edad: event.target.value,
                      }))
                    }
                    placeholder="Opcional"
                    className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] px-4 py-3 text-sm outline-none focus:border-[#7d9309]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="prospecto-correo"
                  className="mb-2 block text-sm font-bold"
                >
                  Correo electrónico
                </label>

                <input
                  id="prospecto-correo"
                  type="email"
                  value={formulario.correo}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      correo: event.target.value,
                    }))
                  }
                  placeholder="correo@ejemplo.com"
                  maxLength={180}
                  className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] px-4 py-3 text-sm outline-none focus:border-[#7d9309]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="prospecto-origen"
                    className="mb-2 block text-sm font-bold"
                  >
                    Medio de contacto
                  </label>

                  <select
                    id="prospecto-origen"
                    value={formulario.origen}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        origen: event.target.value as Origen,
                      }))
                    }
                    className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] px-4 py-3 text-sm outline-none"
                  >
                    {origenes.map((origen) => (
                      <option key={origen} value={origen}>
                        {origen}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="prospecto-etapa"
                    className="mb-2 block text-sm font-bold"
                  >
                    Etapa
                  </label>

                  <select
                    id="prospecto-etapa"
                    value={formulario.etapa}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        etapa: event.target.value as Etapa,
                      }))
                    }
                    className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] px-4 py-3 text-sm outline-none"
                  >
                    {etapas.map((etapa) => (
                      <option key={etapa} value={etapa}>
                        {etapa}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="prospecto-fecha"
                  className="mb-2 block text-sm font-bold"
                >
                  Fecha de contacto
                </label>

                <input
                  id="prospecto-fecha"
                  type="date"
                  value={formulario.fechaContacto}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      fechaContacto: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="prospecto-notas"
                  className="mb-2 block text-sm font-bold"
                >
                  Notas de seguimiento
                </label>

                <textarea
                  id="prospecto-notas"
                  rows={4}
                  maxLength={1000}
                  value={formulario.notas}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      notas: event.target.value,
                    }))
                  }
                  placeholder="Intereses, horarios solicitados, próxima acción..."
                  className="w-full resize-y rounded-xl border border-[#e1dace] bg-[#f6f4ee] px-4 py-3 text-sm outline-none"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-[#fff0ed] p-3 text-sm font-bold text-[#b4493c]"
                >
                  {error}
                </p>
              )}

              {formulario.id && (
                <button
                  type="button"
                  onClick={() => eliminar(formulario.id)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#b4493c]"
                >
                  <Trash2 size={17} />
                  Eliminar prospecto
                </button>
              )}
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e1dace] p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="rounded-xl border border-[#e1dace] px-5 py-3 text-sm font-bold text-[#6f6964]"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={guardar}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#cbd90a] px-5 py-3 text-sm font-black text-[#32390d]"
              >
                <Check size={18} />
                Guardar prospecto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
