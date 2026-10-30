import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
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
  const [grupos, inscripciones] = await Promise.all([
    getGrupos(),
    getInscripciones(),
  ]);

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
      <div className="px-5 py-6 md:px-8 lg:px-10">

        {/* ENCABEZADO */}
        <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-verde">
              Organización
            </p>

            <h1 className="mt-1 text-3xl font-black text-texto md:text-5xl">
              GRUPOS
            </h1>

            <p className="mt-2 text-sm text-texto-3 md:text-base">
              Consulta los grupos, horarios y alumnos inscritos.
            </p>
          </div>

          <Link
            href="/grupos/nuevo"
            className="flex w-fit items-center gap-2 rounded-xl bg-boton px-4 py-3 text-sm font-semibold text-sobre-boton transition hover:bg-boton-hover"
          >
            <Plus size={18} />
            Nuevo grupo
          </Link>

        </section>

        {/* RESUMEN */}
        <section className="mb-6 grid grid-cols-2 gap-3 md:max-w-lg">

          <div className="rounded-2xl border border-borde bg-superficie p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-texto-suave">
              Grupos activos
            </p>

            <p className="mt-2 text-3xl font-black text-texto">
              {gruposActivos.length}
            </p>
          </div>

          <div className="rounded-2xl border border-borde bg-superficie p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-texto-suave">
              Alumnos asignados
            </p>

            <p className="mt-2 text-3xl font-black text-texto">
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
        <section className="grid gap-4 xl:grid-cols-2">

          {grupos.map((grupo) => {
            const cantidadAlumnos =
              getCantidadAlumnosDeGrupo(grupo.id);

            return (
              <Link
                key={grupo.id}
                href={`/grupos/${grupo.id}`}
                className="group rounded-2xl border border-borde bg-superficie p-5 transition hover:border-[#cbd90a]"
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
                <div className="mt-6 grid gap-4 sm:grid-cols-3">

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