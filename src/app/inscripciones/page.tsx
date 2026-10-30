import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Inscripciones",
};

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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-verde">
              Control
            </p>

            <h1 className="mt-1 text-3xl font-black text-texto md:text-5xl">
              INSCRIPCIONES
            </h1>

            <p className="mt-2 text-sm text-texto-3 md:text-base">
              Consulta las inscripciones y los grupos asociados.
            </p>
          </div>

          <Link
            href="/inscripciones/nueva"
            className="flex w-fit items-center gap-2 rounded-xl bg-boton px-4 py-3 text-sm font-semibold text-sobre-boton transition hover:bg-boton-hover"
          >
            <Plus size={18} />
            Nueva inscripción
          </Link>
        </section>

        {/* RESUMEN */}
        <section className="mb-6 grid grid-cols-2 gap-3 md:max-w-lg">
          <div className="rounded-2xl border border-borde bg-superficie p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-texto-suave">
              Activas
            </p>

            <p className="mt-2 text-3xl font-black text-texto">
              {activas.length}
            </p>
          </div>

          <div className="rounded-2xl border border-borde bg-superficie p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-texto-suave">
              Inactivas
            </p>

            <p className="mt-2 text-3xl font-black text-texto">
              {inactivas.length}
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
                className="rounded-2xl border border-borde bg-superficie p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-verde">
                      Inscripción
                    </p>

                    <Link
                      href={`/inscripciones/${inscripcion.id}`}
                      className="mt-1 block text-lg font-black text-texto hover:text-verde"
                    >
                      {inscripcion.nombre}
                    </Link>
                  </div>

                  <span className="rounded-full border border-[#98ad09] px-3 py-1 text-xs font-bold text-verde">
                    {inscripcion.estado}
                  </span>
                </div>

                <div className="mt-4 space-y-3">

                  {/* GRUPO */}
                  <div className="flex items-center gap-3">
                    <UsersRound
                      size={17}
                      className="text-verde"
                    />

                    {grupo ? (
                      <Link
                        href={`/grupos/${grupo.id}`}
                        className="text-sm font-semibold hover:text-verde"
                      >
                        {grupo.nombre}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-texto-suave">
                        Sin grupo
                      </span>
                    )}
                  </div>

                  {/* FECHA DE INICIO */}
                  <div className="flex items-center gap-3">
                    <CalendarDays
                      size={17}
                      className="text-verde"
                    />

                    <p className="text-sm text-texto-3">
                      Inicio: {inscripcion.fechaInicio || "—"}
                    </p>
                  </div>

                  {/* FECHA DE FIN */}
                  <div className="flex items-center gap-3">
                    <CalendarDays
                      size={17}
                      className="text-verde"
                    />

                    <p className="text-sm text-texto-3">
                      Fin: {inscripcion.fechaFin || "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-borde pt-4">
                  <Link
                    href={`/inscripciones/${inscripcion.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-verde"
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
        <section className="hidden overflow-hidden rounded-2xl border border-borde bg-superficie md:block">
          <table className="w-full text-left">

            <thead className="border-b border-borde bg-fondo">
              <tr>
                <th className="px-5 py-4 text-xs uppercase tracking-[0.15em] text-texto-suave">
                  Inscripción
                </th>

                <th className="px-5 py-4 text-xs uppercase tracking-[0.15em] text-texto-suave">
                  Grupo
                </th>

                <th className="px-5 py-4 text-xs uppercase tracking-[0.15em] text-texto-suave">
                  Inicio
                </th>

                <th className="px-5 py-4 text-xs uppercase tracking-[0.15em] text-texto-suave">
                  Fin
                </th>

                <th className="px-5 py-4 text-xs uppercase tracking-[0.15em] text-texto-suave">
                  Estado
                </th>

                <th className="px-5 py-4" />
              </tr>
            </thead>

            <tbody className="divide-y divide-borde">
              {inscripciones.map((inscripcion) => {
                const grupo = inscripcion.grupo;

                return (
                  <tr
                    key={inscripcion.id}
                    className="transition hover:bg-superficie-2"
                  >

                    {/* INSCRIPCIÓN */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/inscripciones/${inscripcion.id}`}
                        className="font-semibold text-texto hover:text-verde"
                      >
                        {inscripcion.nombre}
                      </Link>
                    </td>

                    {/* GRUPO */}
                    <td className="px-5 py-4">
                      {grupo ? (
                        <Link
                          href={`/grupos/${grupo.id}`}
                          className="font-medium text-texto-3 hover:text-verde"
                        >
                          {grupo.nombre}
                        </Link>
                      ) : (
                        <span className="font-medium text-texto-suave">
                          Sin grupo
                        </span>
                      )}
                    </td>

                    {/* INICIO */}
                    <td className="px-5 py-4 text-texto-3">
                      {inscripcion.fechaInicio || "—"}
                    </td>

                    {/* FIN */}
                    <td className="px-5 py-4 text-texto-3">
                      {inscripcion.fechaFin || "—"}
                    </td>

                    {/* ESTADO */}
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-[#98ad09] px-3 py-1 text-xs font-bold text-verde">
                        {inscripcion.estado}
                      </span>
                    </td>

                    {/* VER */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/inscripciones/${inscripcion.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-verde"
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
          <section className="mt-5 rounded-2xl border border-borde bg-superficie p-8 text-center">
            <p className="font-semibold text-texto">
              No hay inscripciones registradas.
            </p>

            <p className="mt-1 text-sm text-texto-suave">
              Las inscripciones creadas en Twenty aparecerán aquí.
            </p>
          </section>
        )}

      </div>
    </AppLayout>
  );
}