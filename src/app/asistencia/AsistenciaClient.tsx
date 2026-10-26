
"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  CalendarDays,
  UsersRound,
  Check,
  X,
  Clock3,
  ChevronRight,
  Info,
  RotateCcw,
  Save,
  AlarmClock,
} from "lucide-react";
import type { Alumno, Grupo } from "@/lib/types";
import type { EstadoAsistencia } from "@/lib/asistencias";
import { guardarPaseDeLista } from "./actions";

type GrupoConAlumnos = Grupo & {
  alumnos: Alumno[];
};

type Props = {
  grupos: GrupoConAlumnos[];
  grupoId: string;
  fecha: string;
  guardadas: Record<string, EstadoAsistencia>;
};

export default function AsistenciaClient({
  grupos,
  grupoId,
  fecha,
  guardadas,
}: Props) {
  const router = useRouter();

  // Las marcas parten de lo guardado en Twenty para este
  // grupo y fecha; los cambios se guardan con el botón.
  const [marcas, setMarcas] =
    useState<Record<string, EstadoAsistencia>>(guardadas);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, startTransition] = useTransition();

  const cambiarSeleccion = (siguiente: {
    grupo?: string;
    fecha?: string;
  }) => {
    const parametros = new URLSearchParams({
      grupo: siguiente.grupo ?? grupoId,
      fecha: siguiente.fecha ?? fecha,
    });

    router.push(`/asistencia?${parametros}`);
  };

  const grupo = grupos.find((item) => item.id === grupoId);

  const alumnos = useMemo(
    () =>
      [...(grupo?.alumnos ?? [])].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es")
      ),
    [grupo]
  );

  const obtenerEstado = (alumnoId: string) =>
    marcas[alumnoId] ?? null;

  const marcar = (
    alumnoId: string,
    estado: EstadoAsistencia
  ) => {
    setAviso(null);
    setMarcas((anterior) => ({
      ...anterior,
      [alumnoId]: estado,
    }));
  };

  const hayCambios = alumnos.some(
    (alumno) =>
      (marcas[alumno.id] ?? null) !== (guardadas[alumno.id] ?? null)
  );

  const guardar = () => {
    setError(null);
    setAviso(null);

    startTransition(async () => {
      const resultado = await guardarPaseDeLista(
        grupoId,
        fecha,
        Object.fromEntries(
          alumnos.map((alumno) => [alumno.id, marcas[alumno.id] ?? null])
        )
      );

      if (resultado.error) {
        setError(resultado.error);
        return;
      }

      setAviso("Asistencia guardada en Twenty.");
      router.refresh();
    });
  };

  const presentes = alumnos.filter(
    (alumno) => obtenerEstado(alumno.id) === "Presente"
  ).length;

  const ausentes = alumnos.filter(
    (alumno) => obtenerEstado(alumno.id) === "Ausente"
  ).length;

  const justificadas = alumnos.filter(
    (alumno) => obtenerEstado(alumno.id) === "Justificada"
  ).length;

  const retardos = alumnos.filter(
    (alumno) => obtenerEstado(alumno.id) === "Retardo"
  ).length;

  const pendientes =
    alumnos.length - presentes - ausentes - justificadas - retardos;

  // Un retardo cuenta como asistencia.
  const porcentaje =
    alumnos.length > 0
      ? Math.round(((presentes + retardos) / alumnos.length) * 100)
      : 0;

  const marcarTodos = () => {
    setAviso(null);
    setMarcas((anterior) => {
      const siguiente = { ...anterior };

      alumnos.forEach((alumno) => {
        siguiente[alumno.id] = "Presente";
      });

      return siguiente;
    });
  };

  const limpiarMarcas = () => {
    setAviso(null);
    setMarcas((anterior) => {
      const siguiente = { ...anterior };

      alumnos.forEach((alumno) => {
        delete siguiente[alumno.id];
      });

      return siguiente;
    });
  };

  return (
    <div className="px-5 py-6 md:px-8 lg:px-10">
      {/* ENCABEZADO */}
      <section className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
          Entrenamientos
        </p>

        <h1 className="mt-1 text-3xl font-black text-[#141113] md:text-5xl">
          ASISTENCIA
        </h1>

        <p className="mt-2 text-sm text-[#6f6964] md:text-base">
          Control de asistencia por grupo y fecha.
        </p>
      </section>

      {/* SELECTORES */}
      <section className="mb-6 grid gap-4 rounded-2xl border border-[#e1dace] bg-white p-5 md:grid-cols-2 md:p-6">
        <div>
          <label
            htmlFor="grupo-asistencia"
            className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#8c847d]"
          >
            Grupo de entrenamiento
          </label>

          <select
            id="grupo-asistencia"
            value={grupoId}
            onChange={(event) =>
              cambiarSeleccion({ grupo: event.target.value })
            }
            className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] px-4 py-3 text-sm font-semibold text-[#141113] outline-none focus:border-[#7d9309]"
          >
            {grupos.length === 0 && (
              <option value="">No hay grupos disponibles</option>
            )}

            {grupos.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="fecha-asistencia"
            className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#8c847d]"
          >
            Fecha de entrenamiento
          </label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7d9309]"
            />

            <input
              id="fecha-asistencia"
              type="date"
              value={fecha}
              onChange={(event) =>
                event.target.value &&
                cambiarSeleccion({ fecha: event.target.value })
              }
              className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] py-3 pl-11 pr-4 text-sm font-semibold text-[#141113] outline-none focus:border-[#7d9309]"
            />
          </div>
        </div>
      </section>

      {/* INDICADORES */}
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          {
            titulo: "Presentes",
            valor: presentes,
            color: "text-[#7d9309]",
          },
          {
            titulo: "Ausentes",
            valor: ausentes,
            color: "text-[#c34d42]",
          },
          {
            titulo: "Justificadas",
            valor: justificadas,
            color: "text-[#b18432]",
          },
          {
            titulo: "Retardos",
            valor: retardos,
            color: "text-[#5d6b91]",
          },
          {
            titulo: "Sin marcar",
            valor: pendientes,
            color: "text-[#141113]",
          },
        ].map((indicador) => (
          <div
            key={indicador.titulo}
            className="rounded-2xl border border-[#e1dace] bg-white p-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8c847d]">
              {indicador.titulo}
            </p>

            <p
              className={`mt-2 text-3xl font-black ${indicador.color}`}
            >
              {indicador.valor}
            </p>
          </div>
        ))}
      </section>

      {/* CONTENIDO */}
      <section className="overflow-hidden rounded-2xl border border-[#e1dace] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#e1dace] p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7d9309]">
              Pase de lista
            </p>

            <h2 className="mt-1 text-xl font-black text-[#141113]">
              {grupo?.nombre ?? "Sin grupo seleccionado"}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#8c847d]">
              <span className="flex items-center gap-1">
                <UsersRound size={14} />
                {alumnos.length} alumnos
              </span>

              {grupo && (
                <span className="flex items-center gap-1">
                  <Clock3 size={14} />
                  {grupo.horaInicio} - {grupo.horaFin}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={marcarTodos}
              disabled={alumnos.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-[#cbd90a] px-4 py-3 text-xs font-black text-[#32390d] transition hover:bg-[#b8c709] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={16} />
              Todos presentes
            </button>

            <button
              type="button"
              onClick={limpiarMarcas}
              disabled={alumnos.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-[#e1dace] px-4 py-3 text-xs font-bold text-[#6f6964] transition hover:bg-[#f6f4ee] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={15} />
              Limpiar
            </button>
          </div>
        </div>

        {/* PROGRESO */}
        <div className="border-b border-[#e1dace] bg-[#fdfcf9] px-5 py-4 md:px-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#6f6964]">
              Asistencia del grupo
            </span>

            <span className="font-black text-[#32390d]">
              {porcentaje}% presentes
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[#e7e4da]">
            <div
              className="h-full rounded-full bg-[#7d9309] transition-all"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        {/* LISTA */}
        {alumnos.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <ClipboardCheck
              size={36}
              className="text-[#a8b65a]"
            />

            <h3 className="mt-4 font-black text-[#141113]">
              No hay alumnos para pasar lista
            </h3>

            <p className="mt-2 max-w-md text-sm text-[#8c847d]">
              Este grupo no tiene alumnos con inscripciones
              activas o todavía no existen grupos disponibles.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#eee9df]">
            {alumnos.map((alumno, index) => {
              const estado = obtenerEstado(alumno.id);

              return (
                <div
                  key={alumno.id}
                  className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-5 text-xs font-bold text-[#aaa39c]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0f2d8] text-sm font-black text-[#32390d]">
                      {alumno.nombre
                        .split(" ")
                        .slice(0, 2)
                        .map((parte) => parte[0])
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <Link
                        href={`/alumnos/${alumno.id}`}
                        className="font-bold text-[#141113] hover:text-[#7d9309]"
                      >
                        {alumno.nombre}
                      </Link>

                      <p className="mt-1 text-xs text-[#8c847d]">
                        {estado ?? "Pendiente de registrar"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                      type="button"
                      onClick={() => marcar(alumno.id, "Presente")}
                      aria-pressed={estado === "Presente"}
                      className={`flex items-center justify-center gap-1 rounded-xl border px-3 py-3 text-xs font-bold transition ${
                        estado === "Presente"
                          ? "border-[#7d9309] bg-[#eaf0c5] text-[#52620a]"
                          : "border-[#e1dace] bg-white text-[#8c847d] hover:bg-[#f6f4ee]"
                      }`}
                    >
                      <Check size={15} />
                      Presente
                    </button>

                    <button
                      type="button"
                      onClick={() => marcar(alumno.id, "Ausente")}
                      aria-pressed={estado === "Ausente"}
                      className={`flex items-center justify-center gap-1 rounded-xl border px-3 py-3 text-xs font-bold transition ${
                        estado === "Ausente"
                          ? "border-[#c34d42] bg-[#fff0ed] text-[#a73d33]"
                          : "border-[#e1dace] bg-white text-[#8c847d] hover:bg-[#f6f4ee]"
                      }`}
                    >
                      <X size={15} />
                      Ausente
                    </button>

                    <button
                      type="button"
                      onClick={() => marcar(alumno.id, "Justificada")}
                      aria-pressed={estado === "Justificada"}
                      className={`flex items-center justify-center gap-1 rounded-xl border px-3 py-3 text-xs font-bold transition ${
                        estado === "Justificada"
                          ? "border-[#c8a25b] bg-[#fff6df] text-[#926b25]"
                          : "border-[#e1dace] bg-white text-[#8c847d] hover:bg-[#f6f4ee]"
                      }`}
                    >
                      <Info size={15} />
                      Justificada
                    </button>

                    <button
                      type="button"
                      onClick={() => marcar(alumno.id, "Retardo")}
                      aria-pressed={estado === "Retardo"}
                      className={`flex items-center justify-center gap-1 rounded-xl border px-3 py-3 text-xs font-bold transition ${
                        estado === "Retardo"
                          ? "border-[#5d6b91] bg-[#eef0f7] text-[#4a5679]"
                          : "border-[#e1dace] bg-white text-[#8c847d] hover:bg-[#f6f4ee]"
                      }`}
                    >
                      <AlarmClock size={15} />
                      Retardo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PIE */}
        <div className="flex flex-col gap-3 border-t border-[#e1dace] bg-[#fdfcf9] p-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div className="text-xs leading-relaxed">
            {error ? (
              <p role="alert" className="font-semibold text-[#9d3a2e]">
                {error}
              </p>
            ) : aviso ? (
              <p role="status" className="font-semibold text-[#52620a]">
                {aviso}
              </p>
            ) : (
              <p className="flex items-start gap-2 text-[#8c847d]">
                <Info size={15} className="mt-0.5 shrink-0" />
                {hayCambios
                  ? "Hay cambios sin guardar."
                  : "El pase de lista está guardado en Twenty."}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-4">
            {grupo && (
              <Link
                href={`/grupos/${grupo.id}`}
                className="inline-flex items-center gap-1 text-sm font-bold text-[#7d9309]"
              >
                Ver grupo
                <ChevronRight size={16} />
              </Link>
            )}

            <button
              type="button"
              onClick={guardar}
              disabled={!hayCambios || guardando}
              className="inline-flex items-center gap-2 rounded-xl bg-[#141113] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#32390d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} />
              {guardando ? "Guardando…" : "Guardar asistencia"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
