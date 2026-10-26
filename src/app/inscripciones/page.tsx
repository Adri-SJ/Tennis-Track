import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import {
  Plus,
  Search,
  UsersRound,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

import { getInscripciones } from "@/lib/api";

export default async function InscripcionesPage() {
  const inscripciones = await getInscripciones();

  const activas = inscripciones.filter(
    (inscripcion) => inscripcion.estado === "Activa"
  );

  const inactivas = inscripciones.filter(
    (inscripcion) => inscripcion.estado === "Inactiva"
  );

  return (
    <AppLayout>
      <div className="px-5 py-6 md:px-8 lg:px-10">

        {/* ENCABEZADO */}
        <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
              Control
            </p>

            <h1 className="mt-1 text-3xl font-black text-[#141113] md:text-5xl">
              INSCRIPCIONES
            </h1>

            <p className="mt-2 text-sm text-[#6f6964] md:text-base">
              Consulta las inscripciones y los grupos asociados.
            </p>
          </div>

          <Link
            href="/inscripciones/nueva"
            className="flex w-fit items-center gap-2 rounded-xl bg-[#141113] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#32390d]"
          >
            <Plus size={18} />
            Nueva inscripción
          </Link>
        </section>

        {/* RESUMEN */}
        <section className="mb-6 grid grid-cols-2 gap-3 md:max-w-lg">
          <div className="rounded-2xl border border-[#e1dace] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8c847d]">
              Activas
            </p>

            <p className="mt-2 text-3xl font-black text-[#141113]">
              {activas.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e1dace] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8c847d]">
              Inactivas
            </p>

            <p className="mt-2 text-3xl font-black text-[#141113]">
              {inactivas.length}
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
              placeholder="Buscar inscripción..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </section>

        {/* MÓVIL */}
        <section className="space-y-3 md:hidden">
          {inscripciones.map((inscripcion) => {
            const grupo = inscripcion.grupo;

            return (
              <div
                key={inscripcion.id}
                className="rounded-2xl border border-[#e1dace] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7d9309]">
                      Inscripción
                    </p>

                    <Link
                      href={`/inscripciones/${inscripcion.id}`}
                      className="mt-1 block text-lg font-black text-[#141113] hover:text-[#7d9309]"
                    >
                      {inscripcion.nombre}
                    </Link>
                  </div>

                  <span className="rounded-full border border-[#98ad09] px-3 py-1 text-xs font-bold text-[#7d9309]">
                    {inscripcion.estado}
                  </span>
                </div>

                <div className="mt-4 space-y-3">

                  {/* GRUPO */}
                  <div className="flex items-center gap-3">
                    <UsersRound
                      size={17}
                      className="text-[#7d9309]"
                    />

                    {grupo ? (
                      <Link
                        href={`/grupos/${grupo.id}`}
                        className="text-sm font-semibold hover:text-[#7d9309]"
                      >
                        {grupo.nombre}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-[#8c847d]">
                        Sin grupo
                      </span>
                    )}
                  </div>

                  {/* FECHA DE INICIO */}
                  <div className="flex items-center gap-3">
                    <CalendarDays
                      size={17}
                      className="text-[#7d9309]"
                    />

                    <p className="text-sm text-[#6f6964]">
                      Inicio: {inscripcion.fechaInicio || "—"}
                    </p>
                  </div>

                  {/* FECHA DE FIN */}
                  <div className="flex items-center gap-3">
                    <CalendarDays
                      size={17}
                      className="text-[#7d9309]"
                    />

                    <p className="text-sm text-[#6f6964]">
                      Fin: {inscripcion.fechaFin || "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#e1dace] pt-4">
                  <Link
                    href={`/inscripciones/${inscripcion.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#7d9309]"
                  >
                    Ver inscripción
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </section>

        {/* DESKTOP */}
        <section className="hidden overflow-hidden rounded-2xl border border-[#e1dace] bg-white md:block">
          <table className="w-full text-left">

            <thead className="border-b border-[#e1dace] bg-[#f6f4ee]">
              <tr>
                <th className="px-5 py-4 text-xs uppercase tracking-[0.15em] text-[#8c847d]">
                  Inscripción
                </th>

                <th className="px-5 py-4 text-xs uppercase tracking-[0.15em] text-[#8c847d]">
                  Grupo
                </th>

                <th className="px-5 py-4 text-xs uppercase tracking-[0.15em] text-[#8c847d]">
                  Inicio
                </th>

                <th className="px-5 py-4 text-xs uppercase tracking-[0.15em] text-[#8c847d]">
                  Fin
                </th>

                <th className="px-5 py-4 text-xs uppercase tracking-[0.15em] text-[#8c847d]">
                  Estado
                </th>

                <th className="px-5 py-4" />
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e1dace]">
              {inscripciones.map((inscripcion) => {
                const grupo = inscripcion.grupo;

                return (
                  <tr
                    key={inscripcion.id}
                    className="transition hover:bg-[#fbfaf7]"
                  >

                    {/* INSCRIPCIÓN */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/inscripciones/${inscripcion.id}`}
                        className="font-semibold text-[#141113] hover:text-[#7d9309]"
                      >
                        {inscripcion.nombre}
                      </Link>
                    </td>

                    {/* GRUPO */}
                    <td className="px-5 py-4">
                      {grupo ? (
                        <Link
                          href={`/grupos/${grupo.id}`}
                          className="font-medium text-[#6f6964] hover:text-[#7d9309]"
                        >
                          {grupo.nombre}
                        </Link>
                      ) : (
                        <span className="font-medium text-[#8c847d]">
                          Sin grupo
                        </span>
                      )}
                    </td>

                    {/* INICIO */}
                    <td className="px-5 py-4 text-[#6f6964]">
                      {inscripcion.fechaInicio || "—"}
                    </td>

                    {/* FIN */}
                    <td className="px-5 py-4 text-[#6f6964]">
                      {inscripcion.fechaFin || "—"}
                    </td>

                    {/* ESTADO */}
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-[#98ad09] px-3 py-1 text-xs font-bold text-[#7d9309]">
                        {inscripcion.estado}
                      </span>
                    </td>

                    {/* VER */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/inscripciones/${inscripcion.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#7d9309]"
                      >
                        Ver
                        <ArrowRight size={16} />
                      </Link>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </section>

        {/* SIN INSCRIPCIONES */}
        {inscripciones.length === 0 && (
          <section className="mt-5 rounded-2xl border border-[#e1dace] bg-white p-8 text-center">
            <p className="font-semibold text-[#141113]">
              No hay inscripciones registradas.
            </p>

            <p className="mt-1 text-sm text-[#8c847d]">
              Las inscripciones creadas en Twenty aparecerán aquí.
            </p>
          </section>
        )}

      </div>
    </AppLayout>
  );
}