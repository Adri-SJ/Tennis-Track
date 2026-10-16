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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
              Organización
            </p>

            <h1 className="mt-1 text-3xl font-black text-[#141113] md:text-5xl">
              GRUPOS
            </h1>

            <p className="mt-2 text-sm text-[#6f6964] md:text-base">
              Consulta los grupos, horarios y alumnos inscritos.
            </p>
          </div>

          <button className="flex w-fit items-center gap-2 rounded-xl bg-[#141113] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#32390d]">
            <Plus size={18} />
            Nuevo grupo
          </button>

        </section>

        {/* RESUMEN */}
        <section className="mb-6 grid grid-cols-2 gap-3 md:max-w-lg">

          <div className="rounded-2xl border border-[#e1dace] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8c847d]">
              Grupos activos
            </p>

            <p className="mt-2 text-3xl font-black text-[#141113]">
              {gruposActivos.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e1dace] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8c847d]">
              Alumnos asignados
            </p>

            <p className="mt-2 text-3xl font-black text-[#141113]">
              {alumnosAsignados}
            </p>
          </div>

        </section>

        {/* BUSCADOR */}
        <section className="mb-5">

          <div className="flex w-full items-center gap-2 rounded-xl border border-[#e1dace] bg-white px-4 py-3 md:max-w-md">

            <Search
              size={18}
              className="text-[#8c847d]"
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
                className="group rounded-2xl border border-[#e1dace] bg-white p-5 transition hover:border-[#cbd90a]"
              >

                {/* CABECERA */}
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7d9309]">
                      Grupo
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-[#141113]">
                      {grupo.nombre}
                    </h2>
                  </div>

                  <span className="rounded-full border border-[#98ad09] px-3 py-1 text-xs font-bold text-[#7d9309]">
                    {grupo.estado}
                  </span>

                </div>

                {/* INFORMACIÓN */}
                <div className="mt-6 grid gap-4 sm:grid-cols-3">

                  <div className="flex items-start gap-3">

                    <CalendarDays
                      size={18}
                      className="mt-0.5 text-[#7d9309]"
                    />

                    <div>
                      <p className="text-xs text-[#8c847d]">
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
                      className="mt-0.5 text-[#7d9309]"
                    />

                    <div>
                      <p className="text-xs text-[#8c847d]">
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
                      className="mt-0.5 text-[#7d9309]"
                    />

                    <div>
                      <p className="text-xs text-[#8c847d]">
                        Alumnos
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {cantidadAlumnos} inscritos
                      </p>
                    </div>

                  </div>

                </div>

                {/* FOOTER */}
                <div className="mt-6 flex items-center justify-end border-t border-[#e1dace] pt-4">

                  <span className="flex items-center gap-2 text-sm font-semibold text-[#7d9309]">
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