import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  UsersRound,
  CalendarDays,
  CircleCheck,
  ArrowRight,
  Pencil,
} from "lucide-react";

import { getInscripcionById } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function InscripcionDetallePage({
  params,
}: Props) {
  const { id } = await params;

  const inscripcion =
    await getInscripcionById(id);

  /* =======================================================
     INSCRIPCIÓN NO ENCONTRADA
  ======================================================= */

  if (!inscripcion) {
    return (
      <AppLayout>
        <div className="px-5 py-6 md:px-8 lg:px-10">

          <Link
            href="/inscripciones"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7d9309]"
          >
            <ArrowLeft size={17} />
            Volver a inscripciones
          </Link>

          <div className="mt-6 rounded-2xl border border-[#e1dace] bg-white p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
              Inscripción
            </p>

            <h1 className="mt-2 text-3xl font-black text-[#141113]">
              INSCRIPCIÓN NO ENCONTRADA
            </h1>

            <p className="mt-3 text-sm text-[#6f6964]">
              No se encontró una inscripción con este identificador.
            </p>
          </div>

        </div>
      </AppLayout>
    );
  }

  const grupo = inscripcion.grupo;

  /*
    Con el modelo actual cada inscripción corresponde
    a un alumno, pero mantenemos alumnos[] porque así
    está normalizada la respuesta de Twenty en api.ts.
  */
  const alumno =
    inscripcion.alumnos[0] ?? null;

  return (
    <AppLayout>
      <div className="px-5 py-6 md:px-8 lg:px-10">

        {/* VOLVER */}
        <Link
          href="/inscripciones"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7d9309] transition hover:text-[#5f6d14]"
        >
          <ArrowLeft size={17} />
          Volver a inscripciones
        </Link>

        {/* ENCABEZADO */}
        <section className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
              Inscripción
            </p>

            <h1 className="mt-1 text-3xl font-black text-[#141113] md:text-5xl">
              {inscripcion.nombre}
            </h1>

            <p className="mt-2 text-sm text-[#6f6964] md:text-base">
              Información de la inscripción y su asignación.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${
                inscripcion.estado === "Activa"
                  ? "border-[#98ad09] text-[#7d9309]"
                  : "border-[#d4cfca] text-[#8c847d]"
              }`}
            >
              {inscripcion.estado}
            </span>

            <Link
              href={`/inscripciones/${inscripcion.id}/editar`}
              className="inline-flex items-center gap-2 rounded-xl border border-[#e1dace] bg-white px-4 py-2 text-sm font-semibold text-[#141113] transition hover:bg-[#f6f4ee]"
            >
              <Pencil size={16} />
              Editar
            </Link>
          </div>

        </section>

        {/* INFORMACIÓN PRINCIPAL */}
        <section className="mt-7 grid gap-4 md:grid-cols-2">

          {/* ALUMNO */}
          <div className="rounded-2xl border border-[#e1dace] bg-white p-5">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#cbd90a] text-[#32390d]">
                <UserRound size={20} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8c847d]">
                  Alumno
                </p>

                <p className="mt-1 font-black text-[#141113]">
                  {alumno
                    ? alumno.nombre
                    : "Sin alumno asignado"}
                </p>
              </div>
            </div>

            {alumno && (
              <Link
                href={`/alumnos/${alumno.id}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7d9309]"
              >
                Ver alumno
                <ArrowRight size={16} />
              </Link>
            )}

          </div>

          {/* GRUPO */}
          <div className="rounded-2xl border border-[#e1dace] bg-white p-5">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef310] text-[#32390d]">
                <UsersRound size={20} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8c847d]">
                  Grupo
                </p>

                <p className="mt-1 font-black text-[#141113]">
                  {grupo
                    ? grupo.nombre
                    : "Sin grupo asignado"}
                </p>
              </div>
            </div>

            {grupo && (
              <Link
                href={`/grupos/${grupo.id}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7d9309]"
              >
                Ver grupo
                <ArrowRight size={16} />
              </Link>
            )}

          </div>

        </section>

        {/* PERIODO */}
        <section className="mt-4 rounded-2xl border border-[#e1dace] bg-white p-5 md:p-6">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f4ee] text-[#7d9309]">
              <CalendarDays size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8c847d]">
                Periodo
              </p>

              <h2 className="font-black text-[#141113]">
                Vigencia de la inscripción
              </h2>
            </div>

          </div>

          <div className="grid gap-3 sm:grid-cols-2">

            {/* INICIO */}
            <div className="rounded-xl bg-[#f6f4ee] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8c847d]">
                Fecha de inicio
              </p>

              <p className="mt-2 text-lg font-black text-[#141113]">
                {inscripcion.fechaInicio || "—"}
              </p>
            </div>

            {/* FIN */}
            <div className="rounded-xl bg-[#f6f4ee] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8c847d]">
                Fecha de fin
              </p>

              <p className="mt-2 text-lg font-black text-[#141113]">
                {inscripcion.fechaFin || "Sin fecha de fin"}
              </p>
            </div>

          </div>

        </section>

        {/* ESTADO */}
        <section className="mt-4 rounded-2xl border border-[#e1dace] bg-white p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f4ee] text-[#7d9309]">
              <CircleCheck size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8c847d]">
                Estado
              </p>

              <p className="mt-1 font-black text-[#141113]">
                {inscripcion.estado}
              </p>
            </div>

          </div>

        </section>

      </div>
    </AppLayout>
  );
}