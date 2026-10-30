import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import {
  Search,
  Plus,
  UserRound,
  ArrowRight,
} from "lucide-react";

import { getAlumnos } from "@/lib/api";

export const metadata: Metadata = {
  title: "Alumnos",
};

export default async function AlumnosPage() {
  const alumnos = await getAlumnos();

  const alumnosActivos = alumnos.filter(
    (alumno) => alumno.estado === "Activo"
  );

  return (
    <AppLayout>
      <div className="px-5 py-6 md:px-8 lg:px-10">

        {/* ENCABEZADO */}
        <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-verde">
              Gestión
            </p>

            <h1 className="mt-1 text-3xl font-black text-texto md:text-5xl">
              ALUMNOS
            </h1>

            <p className="mt-2 text-sm text-texto-3 md:text-base">
              Consulta y administra los alumnos registrados en la academia.
            </p>
          </div>

          <Link
            href="/alumnos/nuevo"
            className="flex w-fit items-center gap-2 rounded-xl bg-boton px-4 py-3 text-sm font-semibold text-sobre-boton transition hover:bg-boton-hover"
          >
            <Plus size={18} />
            Nuevo alumno
          </Link>

        </section>

        {/* RESUMEN */}
        <section className="mb-6 grid grid-cols-2 gap-3 md:max-w-lg">

          <div className="rounded-2xl border border-borde bg-superficie p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-texto-suave">
              Total alumnos
            </p>

            <p className="mt-2 text-3xl font-black text-texto">
              {alumnos.length}
            </p>
          </div>

          <div className="rounded-2xl border border-borde bg-superficie p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-texto-suave">
              Alumnos activos
            </p>

            <p className="mt-2 text-3xl font-black text-texto">
              {alumnosActivos.length}
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
              placeholder="Buscar alumno..."
              className="w-full bg-transparent text-sm outline-none"
            />

          </div>

        </section>

        {/* VISTA MÓVIL */}
        <section className="space-y-3 md:hidden">

          {alumnos.map((alumno) => (
            <Link
              key={alumno.id}
              href={`/alumnos/${alumno.id}`}
              className="group block rounded-2xl border border-borde bg-superficie p-5 transition hover:border-[#cbd90a]"
            >

              {/* CABECERA */}
              <div className="flex items-start justify-between gap-4">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lima-suave text-verde-musgo">
                    <UserRound size={21} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-verde">
                      Alumno
                    </p>

                    <h2 className="mt-1 truncate text-lg font-black text-texto">
                      {alumno.nombre}
                    </h2>

                  </div>

                </div>

                <span className="shrink-0 rounded-full border border-[#98ad09] px-3 py-1 text-xs font-bold text-verde">
                  {alumno.estado}
                </span>

              </div>

              {/* INFORMACIÓN */}
              <div className="mt-5 grid grid-cols-3 gap-3">

                <div>
                  <p className="text-xs text-texto-suave">
                    Edad
                  </p>

                  <p className="mt-1 text-sm font-semibold text-texto">
                    {alumno.edad !== null
                      ? `${alumno.edad} años`
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-texto-suave">
                    Estatura
                  </p>

                  <p className="mt-1 text-sm font-semibold text-texto">
                    {alumno.estatura !== null
                      ? `${alumno.estatura} cm`
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-texto-suave">
                    Mano hábil
                  </p>

                  <p className="mt-1 text-sm font-semibold text-texto">
                    {alumno.manoHabil ?? "—"}
                  </p>
                </div>

              </div>

              {/* FOOTER */}
              <div className="mt-5 flex items-center justify-end border-t border-borde pt-4">

                <span className="flex items-center gap-2 text-sm font-semibold text-verde">
                  Ver alumno

                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </span>

              </div>

            </Link>
          ))}

        </section>

        {/* VISTA ESCRITORIO */}
        <section className="hidden overflow-hidden rounded-2xl border border-borde bg-superficie md:block">

          <table className="w-full">

            <thead>
              <tr className="border-b border-borde">

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-texto-suave">
                  Alumno
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-texto-suave">
                  Edad
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-texto-suave">
                  Estatura
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-texto-suave">
                  Mano hábil
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-texto-suave">
                  Estado
                </th>

                <th className="px-5 py-4"></th>

              </tr>
            </thead>

            <tbody>

              {alumnos.map((alumno) => (
                <tr
                  key={alumno.id}
                  className="border-b border-borde transition last:border-0 hover:bg-superficie-2"
                >

                  {/* ALUMNO */}
                  <td className="px-5 py-4">

                    <Link
                      href={`/alumnos/${alumno.id}`}
                      className="flex items-center gap-3"
                    >

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lima-suave text-verde-musgo">
                        <UserRound size={19} />
                      </div>

                      <div>
                        <p className="font-bold text-texto">
                          {alumno.nombre}
                        </p>

                        <p className="mt-0.5 text-xs text-texto-suave">
                          {alumno.id.slice(0, 8)}
                        </p>
                      </div>

                    </Link>

                  </td>

                  {/* EDAD */}
                  <td className="px-5 py-4 text-sm font-medium text-texto">
                    {alumno.edad !== null
                      ? `${alumno.edad} años`
                      : "—"}
                  </td>

                  {/* ESTATURA */}
                  <td className="px-5 py-4 text-sm font-medium text-texto">
                    {alumno.estatura !== null
                      ? `${alumno.estatura} cm`
                      : "—"}
                  </td>

                  {/* MANO */}
                  <td className="px-5 py-4 text-sm font-medium text-texto">
                    {alumno.manoHabil ?? "—"}
                  </td>

                  {/* ESTADO */}
                  <td className="px-5 py-4">

                    <span className="rounded-full border border-[#98ad09] px-3 py-1 text-xs font-bold text-verde">
                      {alumno.estado}
                    </span>

                  </td>

                  {/* VER */}
                  <td className="px-5 py-4">

                    <Link
                      href={`/alumnos/${alumno.id}`}
                      className="flex items-center justify-end gap-2 text-sm font-semibold text-verde"
                    >
                      Ver

                      <ArrowRight size={16} />
                    </Link>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </section>

        {/* SIN ALUMNOS */}
        {alumnos.length === 0 && (
          <section className="rounded-2xl border border-borde bg-superficie p-10 text-center">

            <UserRound
              size={32}
              className="mx-auto mb-3 text-texto-suave"
            />

            <p className="font-semibold text-texto">
              No hay alumnos registrados.
            </p>

            <p className="mt-1 text-sm text-texto-suave">
              Crea el primer alumno para comenzar.
            </p>

          </section>
        )}

      </div>
    </AppLayout>
  );
}