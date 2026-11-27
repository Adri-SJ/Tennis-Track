import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import Pestanas, { PESTANAS_GRUPOS } from "@/components/Pestanas";
import { alcanceDePagina } from "@/lib/auth/servidor";
import Link from "next/link";
import {
  Search,
  Plus,
  Clock3,
  Users,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

import {
  getGrupos,
  getInscripciones,
} from "@/lib/api";

export const metadata: Metadata = {
  title: "Grupos",
};

export default async function GruposPage() {
  const { esAdmin, grupos: permitidos } = await alcanceDePagina("/grupos");

  const [todos, inscripciones] = await Promise.all([
    getGrupos(),
    getInscripciones(),
  ]);

  const grupos = permitidos
    ? todos.filter((grupo) => permitidos.has(grupo.id))
    : todos;

  const gruposActivos = grupos.filter(
    (grupo) => grupo.estado === "Activo"
  );

  const getCantidadAlumnosDeGrupo = (grupoId: string) => {
    return inscripciones
      .filter(
        (inscripcion) =>
          inscripcion.estado === "Activa" &&
          inscripcion.grupo?.id === grupoId
      )
      .reduce(
        (total, inscripcion) =>
          total + inscripcion.alumnos.length,
        0
      );
  };

  const alumnosAsignados = grupos.reduce(
    (total, grupo) =>
      total + getCantidadAlumnosDeGrupo(grupo.id),
    0
  );

  return (
    <AppLayout>
      <div className="px-4 py-5 md:px-8 md:py-6 lg:px-10">
        <Pestanas pestanas={PESTANAS_GRUPOS} activa="/grupos" />

        {/* ENCABEZADO */}
        <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <h1 className="text-2xl font-black text-texto sm:text-3xl md:text-5xl">
              GRUPOS
            </h1>
          </div>

          {esAdmin && (
            <Link
              href="/grupos/nuevo"
              className="flex w-fit items-center gap-2 rounded-xl bg-boton px-4 py-3 text-sm font-semibold text-sobre-boton transition hover:bg-boton-hover"
            >
              <Plus size={18} />
              Nuevo grupo
            </Link>
          )}

        </section>

        {/* RESUMEN */}
        <section className="mb-6 grid grid-cols-2 gap-3 md:max-w-lg">

          <div className="rounded-2xl border border-borde bg-superficie p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-texto-suave sm:text-xs sm:tracking-[0.15em]">
              Grupos activos
            </p>

            <p className="mt-1 text-2xl font-black sm:mt-2 sm:text-3xl text-texto">
              {gruposActivos.length}
            </p>
          </div>

          <div className="rounded-2xl border border-borde bg-superficie p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-texto-suave sm:text-xs sm:tracking-[0.15em]">
              Alumnos asignados
            </p>

            <p className="mt-1 text-2xl font-black sm:mt-2 sm:text-3xl text-texto">
              {alumnosAsignados}
            </p>
          </div>

        </section>

        {/* BUSCADOR */}
        <section className="mb-5">

          <div className="flex w-full items-center gap-2 rounded-xl border border-borde bg-superficie px-4 py-3 md:max-w-md">

            <Search
              size={18}
              className="text-texto-suave"
            />

            <input
              type="text"
              placeholder="Buscar grupo..."
              className="w-full bg-transparent text-sm outline-none"
            />

          </div>

        </section>

        {/* GRUPOS */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">

          {grupos.map((grupo) => {
            const cantidadAlumnos =
              getCantidadAlumnosDeGrupo(grupo.id);

            return (
              <Link
                key={grupo.id}
                href={`/grupos/${grupo.id}`}
                className="group rounded-2xl border border-borde bg-superficie p-4 transition sm:p-5 hover:border-[#cbd90a]"
              >

                {/* CABECERA */}
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-verde">
                      Grupo
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-texto">
                      {grupo.nombre}
                    </h2>
                  </div>

                  <span className="rounded-full border border-[#98ad09] px-3 py-1 text-xs font-bold text-verde">
                    {grupo.estado}
                  </span>

                </div>

                {/* INFORMACIÓN */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                  <div className="flex items-start gap-3">

                    <CalendarDays
                      size={18}
                      className="mt-0.5 text-verde"
                    />

                    <div>
                      <p className="text-xs text-texto-suave">
                        Días
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {grupo.dias}
                      </p>
                    </div>

                  </div>

                  <div className="flex items-start gap-3">

                    <Clock3
                      size={18}
                      className="mt-0.5 text-verde"
                    />

                    <div>
                      <p className="text-xs text-texto-suave">
                        Horario
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {grupo.horaInicio} – {grupo.horaFin}
                      </p>
                    </div>

                  </div>

                  <div className="flex items-start gap-3">

                    <Users
                      size={18}
                      className="mt-0.5 text-verde"
                    />

                    <div>
                      <p className="text-xs text-texto-suave">
                        Alumnos
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {cantidadAlumnos} inscritos
                      </p>
                    </div>

                  </div>

                </div>

                {/* FOOTER */}
                <div className="mt-6 flex items-center justify-end border-t border-borde pt-4">

                  <span className="flex items-center gap-2 text-sm font-semibold text-verde">
                    Ver grupo

                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>

                </div>

              </Link>
            );
          })}

        </section>

      </div>
    </AppLayout>
  );
}