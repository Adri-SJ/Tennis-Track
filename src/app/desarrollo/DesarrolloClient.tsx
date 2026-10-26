
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Alumno } from "@/lib/types";
import type {
  Evaluacion,
  Habilidad,
  Puntuaciones,
} from "@/lib/evaluaciones";
import { borrarEvaluacion, guardarEvaluacion } from "./actions";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ClipboardList,
  Dumbbell,
  Info,
  Plus,
  Save,
  Search,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  UserRound,
  X,
} from "lucide-react";

type Formulario = {
  fecha: string;
  puntuaciones: Puntuaciones;
  observaciones: string;
};

const habilidades: {
  key: Habilidad;
  nombre: string;
  corto: string;
}[] = [
  { key: "saque", nombre: "Saque", corto: "Saque" },
  { key: "derecha", nombre: "Derecha", corto: "Derecha" },
  { key: "reves", nombre: "Revés", corto: "Revés" },
  { key: "volea", nombre: "Volea", corto: "Volea" },
  {
    key: "condicionFisica",
    nombre: "Condición física",
    corto: "Físico",
  },
];

const puntuacionesIniciales: Puntuaciones = {
  saque: 5,
  derecha: 5,
  reves: 5,
  volea: 5,
  condicionFisica: 5,
};

function promedio(puntuaciones: Puntuaciones) {
  const total = habilidades.reduce(
    (suma, habilidad) => suma + puntuaciones[habilidad.key],
    0
  );

  return total / habilidades.length;
}

function formatoNumero(numero: number) {
  return numero.toFixed(1);
}

function fechaLocalISO() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${fecha}T12:00:00Z`));
}

function nuevaEvaluacionForm(): Formulario {
  return {
    fecha: fechaLocalISO(),
    puntuaciones: { ...puntuacionesIniciales },
    observaciones: "",
  };
}

function puntoRadar(
  indice: number,
  valor: number,
  radioMaximo = 105
) {
  const angulo =
    (indice / habilidades.length) * Math.PI * 2 -
    Math.PI / 2;

  const radio = (valor / 10) * radioMaximo;

  return {
    x: 150 + Math.cos(angulo) * radio,
    y: 145 + Math.sin(angulo) * radio,
  };
}

function poligonoRadar(
  puntuaciones: Puntuaciones,
  escala = 1
) {
  return habilidades
    .map((habilidad, indice) => {
      const punto = puntoRadar(
        indice,
        puntuaciones[habilidad.key] * escala
      );

      return `${punto.x},${punto.y}`;
    })
    .join(" ");
}

function RadarChart({
  actual,
  anterior,
}: {
  actual: Puntuaciones;
  anterior?: Puntuaciones;
}) {
  return (
    <div>
      <svg
        viewBox="0 0 300 295"
        role="img"
        aria-label="Gráfica radar con puntuaciones de saque, derecha, revés, volea y condición física"
        className="mx-auto w-full max-w-[360px]"
      >
        {[2, 4, 6, 8, 10].map((nivel) => (
          <polygon
            key={nivel}
            points={poligonoRadar(
              {
                saque: nivel,
                derecha: nivel,
                reves: nivel,
                volea: nivel,
                condicionFisica: nivel,
              }
            )}
            fill="none"
            stroke="#e1dace"
            strokeWidth="1"
          />
        ))}

        {habilidades.map((habilidad, indice) => {
          const punto = puntoRadar(indice, 10);

          const etiqueta = puntoRadar(indice, 12);

          return (
            <g key={habilidad.key}>
              <line
                x1="150"
                y1="145"
                x2={punto.x}
                y2={punto.y}
                stroke="#e1dace"
              />

              <text
                x={etiqueta.x}
                y={etiqueta.y}
                fontSize="10"
                fontWeight="700"
                fill="#6f6964"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {habilidad.corto}
              </text>
            </g>
          );
        })}

        {anterior && (
          <polygon
            points={poligonoRadar(anterior)}
            fill="#bdb8ae"
            fillOpacity="0.12"
            stroke="#aaa39c"
            strokeWidth="2"
            strokeDasharray="5 4"
            strokeLinejoin="round"
          />
        )}

        <polygon
          points={poligonoRadar(actual)}
          fill="#cbd90a"
          fillOpacity="0.3"
          stroke="#7d9309"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {habilidades.map((habilidad, indice) => {
          const punto = puntoRadar(
            indice,
            actual[habilidad.key]
          );

          return (
            <circle
              key={habilidad.key}
              cx={punto.x}
              cy={punto.y}
              r="4"
              fill="#7d9309"
              stroke="white"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-[#6f6964]">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#7d9309]" />
          Última evaluación
        </div>

        {anterior && (
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#aaa39c]" />
            Evaluación anterior
          </div>
        )}
      </div>
    </div>
  );
}

function EvolucionChart({
  evaluaciones,
}: {
  evaluaciones: Evaluacion[];
}) {
  const datos = [...evaluaciones]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(-8);

  if (datos.length < 2) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center text-center">
        <ChartNoAxesCombined
          size={30}
          className="text-[#a8b65a]"
        />

        <p className="mt-3 font-bold text-[#141113]">
          Aún no hay suficiente historial
        </p>

        <p className="mt-1 text-sm text-[#8c847d]">
          Necesitamos al menos dos evaluaciones.
        </p>
      </div>
    );
  }

  const izquierda = 40;
  const derecha = 570;
  const arriba = 20;
  const abajo = 190;

  const coordenadas = datos.map((evaluacion, indice) => {
    const x =
      izquierda +
      (indice / (datos.length - 1)) *
        (derecha - izquierda);

    const y =
      abajo -
      (promedio(evaluacion.puntuaciones) / 10) *
        (abajo - arriba);

    return {
      x,
      y,
      valor: promedio(evaluacion.puntuaciones),
      fecha: evaluacion.fecha,
    };
  });

  const linea = coordenadas
    .map((punto) => `${punto.x},${punto.y}`)
    .join(" ");

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox="0 0 600 245"
        className="min-w-[420px] w-full"
        role="img"
        aria-label="Gráfica de evolución del promedio de evaluaciones"
      >
        {[0, 2, 4, 6, 8, 10].map((valor) => {
          const y =
            abajo -
            (valor / 10) * (abajo - arriba);

          return (
            <g key={valor}>
              <line
                x1={izquierda}
                y1={y}
                x2={derecha}
                y2={y}
                stroke="#e1dace"
                strokeDasharray="4 4"
              />

              <text
                x="27"
                y={y + 4}
                fontSize="11"
                fill="#8c847d"
                textAnchor="end"
              >
                {valor}
              </text>
            </g>
          );
        })}

        <polyline
          points={linea}
          fill="none"
          stroke="#7d9309"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {coordenadas.map((punto, indice) => (
          <g key={indice}>
            <circle
              cx={punto.x}
              cy={punto.y}
              r="5"
              fill="#cbd90a"
              stroke="#52620a"
              strokeWidth="2"
            />

            <text
              x={punto.x}
              y={punto.y - 12}
              fontSize="12"
              fontWeight="700"
              fill="#32390d"
              textAnchor="middle"
            >
              {formatoNumero(punto.valor)}
            </text>

            <text
              x={punto.x}
              y="220"
              fontSize="10"
              fill="#8c847d"
              textAnchor="middle"
            >
              {new Intl.DateTimeFormat("es-MX", {
                day: "numeric",
                month: "short",
                timeZone: "UTC",
              }).format(
                new Date(`${punto.fecha}T12:00:00Z`)
              )}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function DesarrolloClient({
  alumnos,
  evaluaciones,
}: {
  alumnos: Alumno[];
  evaluaciones: Evaluacion[];
}) {
  const router = useRouter();
  const [guardando, startTransition] = useTransition();

  const [alumnoId, setAlumnoId] = useState(
    alumnos[0]?.id ?? ""
  );

  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [selectorAbierto, setSelectorAbierto] =
    useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] =
    useState<Formulario>(nuevaEvaluacionForm);

  const [evaluacionDetalle, setEvaluacionDetalle] =
    useState<Evaluacion | null>(null);

  const [error, setError] = useState("");

  const alumnoSeleccionado = alumnos.find(
    (alumno) => alumno.id === alumnoId
  );

  const alumnosFiltrados = alumnos.filter((alumno) =>
    alumno.nombre
      .toLowerCase()
      .includes(busquedaAlumno.toLowerCase())
  );

  const evaluacionesAlumno = useMemo(
    () =>
      evaluaciones.filter(
        (evaluacion) => evaluacion.alumnoId === alumnoId
      ),
    [alumnoId, evaluaciones]
  );

  const historial = [...evaluacionesAlumno].sort(
    (a, b) =>
      b.fecha.localeCompare(a.fecha) ||
      b.id.localeCompare(a.id)
  );

  const ultima = historial[0];
  const anterior = historial[1];

  const promedioActual = ultima
    ? promedio(ultima.puntuaciones)
    : null;

  const cambio =
    ultima && anterior
      ? promedio(ultima.puntuaciones) -
        promedio(anterior.puntuaciones)
      : null;

  const habilidadFuerte = ultima
    ? [...habilidades].sort(
        (a, b) =>
          ultima.puntuaciones[b.key] -
          ultima.puntuaciones[a.key]
      )[0]
    : null;

  const habilidadMejora = ultima
    ? [...habilidades].sort(
        (a, b) =>
          ultima.puntuaciones[a.key] -
          ultima.puntuaciones[b.key]
      )[0]
    : null;

  const abrirFormulario = () => {
    setFormulario(nuevaEvaluacionForm());
    setError("");
    setModalAbierto(true);
  };

  const actualizarPuntuacion = (
    habilidad: Habilidad,
    valor: number
  ) => {
    setFormulario((actual) => ({
      ...actual,
      puntuaciones: {
        ...actual.puntuaciones,
        [habilidad]: valor,
      },
    }));
  };

  const guardarEvaluacionActual = () => {
    if (!alumnoSeleccionado) {
      setError("Selecciona un alumno.");
      return;
    }

    if (!formulario.fecha) {
      setError("Selecciona una fecha.");
      return;
    }

    if (formulario.fecha > fechaLocalISO()) {
      setError(
        "La evaluación no puede tener una fecha futura."
      );
      return;
    }

    setError("");

    startTransition(async () => {
      const resultado = await guardarEvaluacion({
        alumnoId,
        fecha: formulario.fecha,
        puntuaciones: { ...formulario.puntuaciones },
        observaciones: formulario.observaciones,
      });

      if (resultado.error) {
        setError(resultado.error);
        return;
      }

      setModalAbierto(false);
      router.refresh();
    });
  };

  const eliminarEvaluacion = (id: string) => {
    const confirmacion = window.confirm(
      "¿Eliminar esta evaluación de Twenty?"
    );

    if (!confirmacion) return;

    startTransition(async () => {
      const resultado = await borrarEvaluacion(id);

      if (resultado.error) {
        window.alert(resultado.error);
        return;
      }

      setEvaluacionDetalle(null);
      router.refresh();
    });
  };

  const totalEvaluaciones = evaluacionesAlumno.length;

  return (
    <div className="px-5 py-6 md:px-8 lg:px-10">
      {/* ENCABEZADO */}
      <section className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
            Seguimiento académico-deportivo
          </p>

          <h1 className="mt-1 text-3xl font-black text-[#141113] md:text-5xl">
            DESARROLLO DEPORTIVO
          </h1>

          <p className="mt-2 text-sm text-[#6f6964] md:text-base">
            Evalúa habilidades y acompaña el progreso de
            cada alumno.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirFormulario}
          disabled={!alumnoSeleccionado}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#cbd90a] px-5 py-3 text-sm font-black text-[#32390d] transition hover:bg-[#dce855] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Nueva evaluación
        </button>
      </section>

      {/* SELECCIÓN DE ALUMNO */}
      <section className="mb-7 rounded-2xl border border-[#e1dace] bg-white p-5 md:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-[#eef2cf] p-3 text-[#52620a]">
            <UserRound size={22} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7d9309]">
              Expediente deportivo
            </p>

            <h2 className="text-lg font-black text-[#141113]">
              Seleccionar alumno
            </h2>
          </div>
        </div>

        <div className="relative max-w-xl">
          <button
            type="button"
            onClick={() =>
              setSelectorAbierto((abierto) => !abierto)
            }
            disabled={alumnos.length === 0}
            className="flex w-full items-center justify-between rounded-xl border border-[#e1dace] bg-[#f6f4ee] px-4 py-4 text-left"
          >
            <div>
              <p className="font-bold text-[#141113]">
                {alumnoSeleccionado?.nombre ??
                  "No hay alumnos disponibles"}
              </p>

              <p className="mt-1 text-xs text-[#8c847d]">
                {alumnoSeleccionado
                  ? `${alumnoSeleccionado.estado} · ${
                      alumnoSeleccionado.edad ??
                      "Edad no registrada"
                    } ${
                      alumnoSeleccionado.edad !== null
                        ? "años"
                        : ""
                    }`
                  : "Agrega alumnos en Twenty"}
              </p>
            </div>

            <ChevronDown
              size={19}
              className="text-[#8c847d]"
            />
          </button>

          {selectorAbierto && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-[#e1dace] bg-white shadow-xl">
              <div className="relative p-3">
                <Search
                  size={17}
                  className="absolute left-7 top-1/2 -translate-y-1/2 text-[#8c847d]"
                />

                <input
                  autoFocus
                  type="search"
                  placeholder="Buscar alumno..."
                  value={busquedaAlumno}
                  onChange={(event) =>
                    setBusquedaAlumno(event.target.value)
                  }
                  className="w-full rounded-lg bg-[#f6f4ee] py-3 pl-10 pr-3 text-sm outline-none"
                />
              </div>

              <div className="max-h-64 overflow-y-auto">
                {alumnosFiltrados.map((alumno) => (
                  <button
                    type="button"
                    key={alumno.id}
                    onClick={() => {
                      setAlumnoId(alumno.id);
                      setSelectorAbierto(false);
                      setBusquedaAlumno("");
                    }}
                    className="flex w-full items-center justify-between border-t border-[#f1ede5] px-4 py-3 text-left hover:bg-[#f6f4ee]"
                  >
                    <span className="text-sm font-semibold text-[#141113]">
                      {alumno.nombre}
                    </span>

                    {alumno.id === alumnoId && (
                      <Check
                        size={17}
                        className="text-[#7d9309]"
                      />
                    )}
                  </button>
                ))}

                {alumnosFiltrados.length === 0 && (
                  <p className="px-4 py-5 text-sm text-[#8c847d]">
                    No encontramos alumnos.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#8c847d]">
            Alumnos obtenidos directamente de Twenty CRM.
          </p>

        </div>
      </section>

      {/* INDICADORES */}
      <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            titulo: "Promedio actual",
            valor:
              promedioActual !== null
                ? `${formatoNumero(promedioActual)}/10`
                : "—",
            icono: Target,
          },
          {
            titulo: "Evaluaciones",
            valor: totalEvaluaciones,
            icono: ClipboardList,
          },
          {
            titulo: "Habilidad destacada",
            valor: habilidadFuerte?.nombre ?? "—",
            icono: Trophy,
          },
          {
            titulo: "Última evaluación",
            valor: ultima
              ? formatearFecha(ultima.fecha)
              : "—",
            icono: CalendarDays,
          },
        ].map((indicador) => {
          const Icono = indicador.icono;

          return (
            <div
              key={indicador.titulo}
              className="rounded-2xl border border-[#e1dace] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8c847d]">
                  {indicador.titulo}
                </p>

                <Icono
                  size={18}
                  className="shrink-0 text-[#7d9309]"
                />
              </div>

              <p className="mt-4 break-words text-xl font-black text-[#141113] md:text-2xl">
                {indicador.valor}
              </p>
            </div>
          );
        })}
      </section>

      {/* RESUMEN PRINCIPAL */}
      <section className="mb-7 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-[#e1dace] bg-white p-5 md:p-6">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7d9309]">
              Análisis técnico
            </p>

            <h2 className="mt-1 text-xl font-black text-[#141113]">
              Perfil de habilidades
            </h2>

            <p className="mt-2 text-sm text-[#8c847d]">
              Comparación entre las dos evaluaciones más
              recientes.
            </p>
          </div>

          {ultima ? (
            <RadarChart
              actual={ultima.puntuaciones}
              anterior={anterior?.puntuaciones}
            />
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <Target
                size={36}
                className="text-[#a8b65a]"
              />

              <p className="mt-4 font-bold text-[#141113]">
                Sin evaluaciones
              </p>

              <p className="mt-2 max-w-xs text-sm text-[#8c847d]">
                Registra la primera evaluación para
                visualizar el perfil deportivo.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-[#32390d] p-6 text-white">
          <div className="flex items-center gap-2 text-[#dce6a1]">
            <TrendingUp size={19} />

            <p className="text-xs font-bold uppercase tracking-[0.15em]">
              Resumen de progreso
            </p>
          </div>

          <h2 className="mt-3 text-2xl font-black">
            Evolución del alumno
          </h2>

          {ultima ? (
            <>
              <p className="mt-6 text-sm text-[#d1d5ba]">
                Promedio de la evaluación más reciente
              </p>

              <p className="mt-2 text-5xl font-black text-[#eef310]">
                {formatoNumero(promedioActual!)}
                <span className="ml-2 text-lg text-[#d1d5ba]">
                  / 10
                </span>
              </p>

              {cambio !== null && (
                <div className="mt-4 flex items-center gap-2">
                  {cambio >= 0 ? (
                    <ArrowUpRight
                      size={19}
                      className="text-[#eef310]"
                    />
                  ) : (
                    <ArrowDownRight
                      size={19}
                      className="text-[#f2b5a6]"
                    />
                  )}

                  <span className="text-sm font-bold">
                    {cambio > 0 ? "+" : ""}
                    {formatoNumero(cambio)} puntos
                  </span>

                  <span className="text-xs text-[#d1d5ba]">
                    frente a la evaluación anterior
                  </span>
                </div>
              )}

              <div className="my-6 border-t border-white/20" />

              <div className="space-y-5">
                <div>
                  <p className="text-xs text-[#d1d5ba]">
                    Principal fortaleza
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {habilidadFuerte?.nombre}
                  </p>

                  <p className="text-sm text-[#eef310]">
                    {habilidadFuerte
                      ? ultima.puntuaciones[
                          habilidadFuerte.key
                        ]
                      : 0}
                    /10
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#d1d5ba]">
                    Área de mejora
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {habilidadMejora?.nombre}
                  </p>

                  <p className="text-sm text-[#eef310]">
                    {habilidadMejora
                      ? ultima.puntuaciones[
                          habilidadMejora.key
                        ]
                      : 0}
                    /10
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-10">
              <Activity
                size={38}
                className="text-[#cbd90a]"
              />

              <p className="mt-4 text-sm text-[#d1d5ba]">
                El resumen aparecerá cuando registres
                una evaluación.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* DESGLOSE DE HABILIDADES */}
      <section className="mb-7 rounded-2xl border border-[#e1dace] bg-white p-5 md:p-6">
        <div className="mb-6 flex items-center gap-3">
          <Dumbbell
            size={21}
            className="text-[#7d9309]"
          />

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7d9309]">
              Evaluación técnica
            </p>

            <h2 className="text-xl font-black text-[#141113]">
              Desglose de habilidades
            </h2>
          </div>
        </div>

        {ultima ? (
          <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            {habilidades.map((habilidad) => {
              const valor =
                ultima.puntuaciones[habilidad.key];

              const anteriorValor =
                anterior?.puntuaciones[habilidad.key];

              return (
                <div key={habilidad.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-bold text-[#141113]">
                      {habilidad.nombre}
                    </p>

                    <div className="flex items-center gap-2">
                      {anteriorValor !== undefined && (
                        <span className="text-xs text-[#8c847d]">
                          {valor - anteriorValor > 0
                            ? "+"
                            : ""}
                          {valor - anteriorValor}
                        </span>
                      )}

                      <span className="font-black text-[#52620a]">
                        {valor}/10
                      </span>
                    </div>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-[#eeeae0]">
                    <div
                      className="h-full rounded-full bg-[#a5b91b]"
                      style={{
                        width: `${valor * 10}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[#8c847d]">
            Todavía no hay puntuaciones para este alumno.
          </p>
        )}
      </section>

      {/* EVOLUCIÓN HISTÓRICA */}
      <section className="mb-7 rounded-2xl border border-[#e1dace] bg-white p-5 md:p-6">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7d9309]">
            Seguimiento
          </p>

          <h2 className="mt-1 text-xl font-black text-[#141113]">
            Evolución histórica
          </h2>

          <p className="mt-2 text-sm text-[#8c847d]">
            Promedio general de las últimas ocho
            evaluaciones.
          </p>
        </div>

        <EvolucionChart evaluaciones={historial} />
      </section>

      {/* HISTORIAL */}
      <section className="overflow-hidden rounded-2xl border border-[#e1dace] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#e1dace] p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7d9309]">
              Registro deportivo
            </p>

            <h2 className="mt-1 text-xl font-black text-[#141113]">
              Historial de evaluaciones
            </h2>
          </div>

          <span className="w-fit rounded-full border border-[#e1dace] px-3 py-1 text-xs font-bold text-[#8c847d]">
            {totalEvaluaciones} registros
          </span>
        </div>

        {historial.length > 0 ? (
          <div className="divide-y divide-[#eee9df]">
            {historial.map((evaluacion) => (
              <div
                key={evaluacion.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:px-6"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-[#eef2cf] p-3 text-[#52620a]">
                    <ClipboardList size={21} />
                  </div>

                  <div>
                    <p className="font-black text-[#141113]">
                      {formatearFecha(evaluacion.fecha)}
                    </p>

                    <p className="mt-1 text-sm text-[#8c847d]">
                      Promedio:{" "}
                      {formatoNumero(
                        promedio(evaluacion.puntuaciones)
                      )}
                      /10
                    </p>

                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEvaluacionDetalle(evaluacion)
                  }
                  className="inline-flex items-center gap-2 self-start text-sm font-bold text-[#7d9309]"
                >
                  Ver evaluación
                  <ArrowUpRight size={17} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <ClipboardList
              size={32}
              className="mx-auto text-[#a8b65a]"
            />

            <p className="mt-3 font-bold text-[#141113]">
              No hay evaluaciones registradas
            </p>

            <p className="mt-2 text-sm text-[#8c847d]">
              Comienza creando una evaluación.
            </p>
          </div>
        )}

        <div className="flex items-start gap-2 border-t border-[#e1dace] bg-[#fdfcf9] px-5 py-4 text-xs leading-relaxed text-[#8c847d]">
          <Info size={15} className="mt-0.5 shrink-0" />

          <p>
            Los alumnos y las evaluaciones se guardan
            en Twenty. Cada habilidad se califica del
            1 al 10.
          </p>
        </div>
      </section>

      {/* MODAL NUEVA EVALUACIÓN */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#141113]/55 p-3 md:p-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-nueva-evaluacion"
            className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-start justify-between bg-[#f6f4ee] p-5 md:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7d9309]">
                  Registro deportivo
                </p>

                <h2
                  id="titulo-nueva-evaluacion"
                  className="mt-1 text-2xl font-black text-[#141113]"
                >
                  NUEVA EVALUACIÓN
                </h2>

                <p className="mt-1 text-sm text-[#8c847d]">
                  {alumnoSeleccionado?.nombre}
                </p>
              </div>

              <button
                type="button"
                aria-label="Cerrar formulario"
                onClick={() => setModalAbierto(false)}
                className="rounded-full bg-white p-2 text-[#141113]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto p-5 md:p-6">
              <div>
                <label
                  htmlFor="fecha-evaluacion"
                  className="mb-2 block text-sm font-bold text-[#141113]"
                >
                  Fecha de evaluación
                </label>

                <input
                  id="fecha-evaluacion"
                  type="date"
                  max={fechaLocalISO()}
                  value={formulario.fecha}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      fecha: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] px-4 py-3 text-sm outline-none focus:border-[#7d9309]"
                />
              </div>

              <div>
                <h3 className="font-black text-[#141113]">
                  Evaluación de habilidades
                </h3>

                <p className="mt-1 text-sm text-[#8c847d]">
                  Califica cada habilidad del 1 al 10.
                </p>
              </div>

              {habilidades.map((habilidad) => (
                <div key={habilidad.key}>
                  <div className="mb-3 flex items-center justify-between">
                    <label
                      htmlFor={`habilidad-${habilidad.key}`}
                      className="text-sm font-bold text-[#141113]"
                    >
                      {habilidad.nombre}
                    </label>

                    <span className="rounded-lg bg-[#eef2cf] px-3 py-1 text-sm font-black text-[#52620a]">
                      {
                        formulario.puntuaciones[
                          habilidad.key
                        ]
                      }
                      /10
                    </span>
                  </div>

                  <input
                    id={`habilidad-${habilidad.key}`}
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={
                      formulario.puntuaciones[
                        habilidad.key
                      ]
                    }
                    onChange={(event) =>
                      actualizarPuntuacion(
                        habilidad.key,
                        Number(event.target.value)
                      )
                    }
                    className="w-full accent-[#7d9309]"
                  />

                  <div className="mt-1 flex justify-between text-[11px] text-[#8c847d]">
                    <span>1 · Inicial</span>
                    <span>10 · Excelente</span>
                  </div>
                </div>
              ))}

              <div className="rounded-xl bg-[#f0f5d8] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#657a0b]">
                  Promedio de la evaluación
                </p>

                <p className="mt-2 text-3xl font-black text-[#32390d]">
                  {formatoNumero(
                    promedio(formulario.puntuaciones)
                  )}
                  /10
                </p>
              </div>

              <div>
                <label
                  htmlFor="observaciones"
                  className="mb-2 block text-sm font-bold text-[#141113]"
                >
                  Observaciones del entrenador
                </label>

                <textarea
                  id="observaciones"
                  rows={4}
                  maxLength={1000}
                  placeholder="Ejemplo: Mejoró la precisión del saque, pero necesita trabajar el desplazamiento lateral..."
                  value={formulario.observaciones}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      observaciones: event.target.value,
                    }))
                  }
                  className="w-full resize-y rounded-xl border border-[#e1dace] bg-[#f6f4ee] px-4 py-3 text-sm outline-none focus:border-[#7d9309]"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-[#fff0ed] p-3 text-sm font-semibold text-[#b4493c]"
                >
                  {error}
                </p>
              )}

              <div className="flex items-start gap-2 text-xs text-[#8c847d]">
                <Info size={16} className="shrink-0" />
                La evaluación se guardará en Twenty.
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e1dace] bg-white p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="rounded-xl border border-[#e1dace] px-5 py-3 text-sm font-bold text-[#6f6964]"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={guardarEvaluacionActual}
                disabled={guardando}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#cbd90a] px-5 py-3 text-sm font-black text-[#32390d] disabled:cursor-wait disabled:opacity-60"
              >
                <Save size={18} />
                {guardando ? "Guardando…" : "Guardar evaluación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {evaluacionDetalle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#141113]/55 p-3 md:p-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalle-evaluacion"
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between bg-[#f6f4ee] p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7d9309]">
                  Expediente deportivo
                </p>

                <h2
                  id="titulo-detalle-evaluacion"
                  className="mt-1 text-2xl font-black text-[#141113]"
                >
                  DETALLE DE EVALUACIÓN
                </h2>

                <p className="mt-2 text-sm text-[#8c847d]">
                  {formatearFecha(evaluacionDetalle.fecha)}
                </p>
              </div>

              <button
                type="button"
                aria-label="Cerrar detalle"
                onClick={() => setEvaluacionDetalle(null)}
                className="rounded-full bg-white p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-xl bg-[#32390d] p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#dce6a1]">
                  Promedio general
                </p>

                <p className="mt-2 text-4xl font-black text-[#eef310]">
                  {formatoNumero(
                    promedio(
                      evaluacionDetalle.puntuaciones
                    )
                  )}
                  /10
                </p>
              </div>

              {habilidades.map((habilidad) => (
                <div
                  key={habilidad.key}
                  className="flex items-center justify-between border-b border-[#eee9df] pb-3"
                >
                  <span className="text-sm text-[#6f6964]">
                    {habilidad.nombre}
                  </span>

                  <span className="font-black text-[#141113]">
                    {
                      evaluacionDetalle.puntuaciones[
                        habilidad.key
                      ]
                    }
                    /10
                  </span>
                </div>
              ))}

              <div>
                <p className="text-sm font-bold text-[#141113]">
                  Observaciones
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#6f6964]">
                  {evaluacionDetalle.observaciones ||
                    "Sin observaciones registradas."}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  eliminarEvaluacion(evaluacionDetalle.id)
                }
                disabled={guardando}
                className="inline-flex items-center gap-2 rounded-xl border border-[#e6b1a9] px-4 py-3 text-sm font-bold text-[#b4493c] disabled:cursor-wait disabled:opacity-60"
              >
                <Trash2 size={17} />
                Eliminar evaluación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
