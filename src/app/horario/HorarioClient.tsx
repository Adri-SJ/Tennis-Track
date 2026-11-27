"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock3, UsersRound } from "lucide-react";
import type { NivelGrupo } from "@/lib/types";
import Pestanas, { PESTANAS_GRUPOS } from "@/components/Pestanas";

export type Sesion = {
  grupoId: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  nivel: NivelGrupo | null;
  alumnos: number;
  capacidad: number | null;
};

const DIAS = [
  { corto: "Lun", nombre: "Lunes" },
  { corto: "Mar", nombre: "Martes" },
  { corto: "Mié", nombre: "Miércoles" },
  { corto: "Jue", nombre: "Jueves" },
  { corto: "Vie", nombre: "Viernes" },
  { corto: "Sáb", nombre: "Sábado" },
  { corto: "Dom", nombre: "Domingo" },
];

type Estado = "en-curso" | "proxima" | "terminada" | null;

/* "HH:MM" → minutos del día; null si el grupo no tiene hora. */
function aMinutos(hora: string): number | null {
  const partes = /^(\d{1,2}):(\d{2})/.exec(hora);

  return partes ? Number(partes[1]) * 60 + Number(partes[2]) : null;
}

function estadoDe(sesion: Sesion, minutos: number): Estado {
  const inicio = aMinutos(sesion.horaInicio);
  const fin = aMinutos(sesion.horaFin);

  if (inicio === null || fin === null) {
    return null;
  }

  if (minutos >= fin) {
    return "terminada";
  }

  return minutos >= inicio ? "en-curso" : "proxima";
}

function faltan(minutos: number): string {
  if (minutos < 60) {
    return `en ${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  return resto ? `en ${horas} h ${resto} min` : `en ${horas} h`;
}

/* Minutos del día en la hora de México, igual que el servidor. */
function minutosEnMexico(): number {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const valor = (tipo: string) =>
    Number(partes.find((parte) => parte.type === tipo)?.value ?? 0);

  return valor("hour") * 60 + valor("minute");
}

export default function HorarioClient({
  semana,
  totalGrupos,
  hoy,
  minutosAhora,
  fechaHoy,
}: {
  semana: Sesion[][];
  totalGrupos: number;
  hoy: number;
  minutosAhora: number;
  fechaHoy: string;
}) {
  const [diaElegido, setDiaElegido] = useState(hoy);
  const [minutos, setMinutos] = useState(minutosAhora);

  /* Mantiene al día «En curso» y «Siguiente» mientras la página está abierta. */
  useEffect(() => {
    const intervalo = window.setInterval(
      () => setMinutos(minutosEnMexico()),
      60 * 1000
    );

    return () => window.clearInterval(intervalo);
  }, []);

  /* El domingo solo aparece si hay clases o si hoy es domingo. */
  const dias = DIAS.map((dia, indice) => ({ ...dia, indice })).filter(
    (dia) => dia.indice < 6 || semana[6].length > 0 || hoy === 6
  );

  const totalClases = semana.reduce((total, dia) => total + dia.length, 0);
  const deHoy = semana[hoy] ?? [];
  const enCurso = deHoy.find((sesion) => estadoDe(sesion, minutos) === "en-curso");
  const siguiente = deHoy.find((sesion) => estadoDe(sesion, minutos) === "proxima");
  const elegido = semana[diaElegido] ?? [];

  return (
    <div className="px-4 py-5 md:px-8 md:py-6 lg:px-10">
      <Pestanas pestanas={PESTANAS_GRUPOS} activa="/horario" />

      {/* ENCABEZADO */}
      <section className="mb-5">
        <h1 className="text-2xl font-black text-texto sm:text-3xl md:text-5xl">
          HORARIO
        </h1>
        <p className="mt-2 text-sm text-texto-3 md:text-base">
          {totalGrupos} {totalGrupos === 1 ? "grupo" : "grupos"} ·{" "}
          {totalClases} {totalClases === 1 ? "clase" : "clases"} a la semana
        </p>
      </section>

      {/* HOY */}
      <section className="mb-5 rounded-2xl bg-banner p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d5de91]">
          Hoy · {fechaHoy}
        </p>

        {enCurso ? (
          <ResumenHoy etiqueta="En curso" sesion={enCurso} />
        ) : siguiente ? (
          <ResumenHoy
            etiqueta={`Siguiente, ${faltan(
              (aMinutos(siguiente.horaInicio) ?? minutos) - minutos
            )}`}
            sesion={siguiente}
          />
        ) : (
          <p className="mt-2 text-lg font-black">
            {deHoy.length
              ? "Ya terminaron las clases de hoy."
              : "Hoy no hay clases."}
          </p>
        )}
      </section>

      {/* MÓVIL Y TABLETA: un día a la vez */}
      <div className="lg:hidden">
        <nav
          aria-label="Días de la semana"
          className="sticky top-[57px] z-30 -mx-4 mb-4 grid gap-1.5 bg-fondo px-4 py-2 md:-mx-8 md:px-8"
          style={{ gridTemplateColumns: `repeat(${dias.length}, minmax(0, 1fr))` }}
        >
          {dias.map((dia) => {
            const activo = dia.indice === diaElegido;
            const cantidad = semana[dia.indice].length;

            return (
              <button
                key={dia.corto}
                type="button"
                onClick={() => setDiaElegido(dia.indice)}
                aria-pressed={activo}
                className={`flex min-w-0 flex-col items-center rounded-xl border px-1 py-2 transition ${
                  activo
                    ? "border-boton bg-boton text-sobre-boton"
                    : "border-borde bg-superficie text-texto"
                }`}
              >
                <span className="text-xs font-bold">{dia.corto}</span>
                <span
                  className={`mt-1 text-[11px] ${
                    activo ? "opacity-80" : "text-texto-suave"
                  }`}
                >
                  {cantidad || "—"}
                </span>
                {dia.indice === hoy && (
                  <span
                    className={`mt-1 h-1.5 w-1.5 rounded-full ${
                      activo ? "bg-sobre-boton" : "bg-verde"
                    }`}
                    aria-label="Hoy"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <h2 className="mb-3 text-lg font-black text-texto">
          {DIAS[diaElegido].nombre}
          {diaElegido === hoy && (
            <span className="ml-2 text-sm font-semibold text-verde">Hoy</span>
          )}
        </h2>

        {elegido.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center text-sm text-texto-suave">
            No hay clases este día.
          </p>
        ) : (
          <ul className="space-y-3">
            {elegido.map((sesion) => (
              <li key={sesion.grupoId}>
                <TarjetaSesion
                  sesion={sesion}
                  estado={diaElegido === hoy ? estadoDe(sesion, minutos) : null}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* COMPUTADORA: toda la semana */}
      <section
        className="hidden gap-3 lg:grid"
        style={{ gridTemplateColumns: `repeat(${dias.length}, minmax(0, 1fr))` }}
      >
        {dias.map((dia) => {
          const sesiones = semana[dia.indice];
          const esHoy = dia.indice === hoy;

          return (
            <div key={dia.corto} className="min-w-0">
              <div
                className={`mb-3 rounded-xl px-3 py-2 ${
                  esHoy ? "bg-lima-suave text-verde-oscuro" : "text-texto"
                }`}
              >
                <p className="text-sm font-black">
                  {dia.nombre}
                  {esHoy && <span className="ml-1 text-xs font-semibold">· Hoy</span>}
                </p>
                <p className="text-xs text-texto-suave">
                  {sesiones.length
                    ? `${sesiones.length} ${sesiones.length === 1 ? "clase" : "clases"}`
                    : "Sin clases"}
                </p>
              </div>

              <div className="space-y-2">
                {sesiones.map((sesion) => (
                  <TarjetaSesion
                    key={sesion.grupoId}
                    sesion={sesion}
                    estado={esHoy ? estadoDe(sesion, minutos) : null}
                    compacta
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function ResumenHoy({ etiqueta, sesion }: { etiqueta: string; sesion: Sesion }) {
  return (
    <Link href={`/grupos/${sesion.grupoId}`} className="mt-2 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#eef310]">{etiqueta}</p>
        <p className="truncate text-xl font-black">{sesion.nombre}</p>
        <p className="text-sm text-[#d1d5ba]">
          {sesion.horaInicio} – {sesion.horaFin} · {sesion.alumnos}{" "}
          {sesion.alumnos === 1 ? "alumno" : "alumnos"}
        </p>
      </div>
      <ChevronRight size={22} className="shrink-0 text-[#eef310]" />
    </Link>
  );
}

const ESTILO_ESTADO: Record<Exclude<Estado, null>, string> = {
  "en-curso": "bg-[#cbd90a] text-sobre-lima",
  proxima: "bg-lima-suave text-verde-oscuro",
  terminada: "bg-hundido text-texto-suave",
};

const TEXTO_ESTADO: Record<Exclude<Estado, null>, string> = {
  "en-curso": "En curso",
  proxima: "Próxima",
  terminada: "Terminada",
};

function TarjetaSesion({
  sesion,
  estado,
  compacta = false,
}: {
  sesion: Sesion;
  estado: Estado;
  compacta?: boolean;
}) {
  const cupo =
    sesion.capacidad !== null
      ? `${sesion.alumnos}/${sesion.capacidad}`
      : `${sesion.alumnos}`;

  return (
    <Link
      href={`/grupos/${sesion.grupoId}`}
      className={`flex gap-3 rounded-2xl border bg-superficie transition hover:border-verde ${
        estado === "en-curso" ? "border-verde" : "border-borde"
      } ${estado === "terminada" ? "opacity-70" : ""} ${compacta ? "flex-col p-3" : "items-center p-4"}`}
    >
      {/* Hora destacada */}
      <div className={compacta ? "flex items-center gap-1 text-xs text-texto-3" : "w-16 shrink-0 text-center"}>
        {compacta ? (
          <>
            <Clock3 size={13} />
            {sesion.horaInicio} – {sesion.horaFin}
          </>
        ) : (
          <>
            <p className="text-lg font-black text-texto">{sesion.horaInicio}</p>
            <p className="text-xs text-texto-suave">{sesion.horaFin}</p>
          </>
        )}
      </div>

      {!compacta && <div className="h-10 w-px shrink-0 bg-borde" />}

      <div className="min-w-0 flex-1">
        <p className={`font-bold text-texto ${compacta ? "text-sm leading-snug" : ""}`}>
          {sesion.nombre}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-texto-3">
          <span className="flex items-center gap-1">
            <UsersRound size={13} />
            {cupo} {sesion.alumnos === 1 && sesion.capacidad === null ? "alumno" : "alumnos"}
          </span>
          {sesion.nivel && <span>{sesion.nivel}</span>}
        </div>

        {estado && (
          <span
            className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${ESTILO_ESTADO[estado]}`}
          >
            {TEXTO_ESTADO[estado]}
          </span>
        )}
      </div>

      {!compacta && <ChevronRight size={18} className="shrink-0 text-verde" />}
    </Link>
  );
}
